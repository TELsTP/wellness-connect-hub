import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEPUTY_PROMPT = (clinicianPresent: boolean, language: string) => `You are My-AssistAI acting as the on-call deputy for a live telemedicine consultation.

Mode: ${clinicianPresent ? "SILENT SCRIBE — clinician is present; produce only a short clinical note for the running record, no patient-facing speech." : "ACTIVE DEPUTY — no clinician available; speak directly to the patient: warm, brief, ask one history question at a time, screen for red-flags, gather chief complaint, HPI, allergies, meds, relevant PMH."}

Language: respond in ${language === "ar" ? "Arabic (Egyptian dialect, simple words)" : language === "zh" ? "Simplified Chinese" : "English"}.

Always:
- Keep replies under 60 words so they can be spoken aloud.
- If anything sounds like an emergency (chest pain, stroke signs, severe bleeding, breathing failure, suicidal ideation) immediately instruct the patient to call 123 (Egypt emergency) and add the marker [[ESCALATE:emergency]] on its own final line.
- Never invent vitals — if Anura vitals are not provided, do not mention numeric measurements.
- End every reply with one short next question, unless ending the encounter.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { roomId, language, history, latest, clinicianPresent } = await req.json();
    if (!roomId || !latest) {
      return new Response(JSON.stringify({ error: "roomId and latest are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: DEPUTY_PROMPT(!!clinicianPresent, language || "en") },
      ...(Array.isArray(history) ? history.slice(-12) : []),
      { role: "user", content: `PATIENT just said: "${latest}"` },
    ];

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("deputy AI fail", r.status, t);
      return new Response(JSON.stringify({ error: "AI unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const reply: string = (data.choices?.[0]?.message?.content || "").trim();

    // Best-effort log to accreditation_logs
    try {
      const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await sb.from("accreditation_logs").insert({
        session_id: roomId,
        action: "call_deputy_turn",
        metadata: { clinicianPresent: !!clinicianPresent, latest, reply },
      } as any);
    } catch (e) { console.warn("audit skipped", e); }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("call-deputy error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
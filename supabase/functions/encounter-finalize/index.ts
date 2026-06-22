import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOAP_PROMPT = (language: string) => `You are a clinical scribe. Given a telemedicine consultation transcript (patient + AI deputy ± clinician), write a concise SOAP note in ${language === "ar" ? "Arabic" : language === "zh" ? "Simplified Chinese" : "English"}.

Sections, in order, using markdown headers:
## Subjective — chief complaint, HPI, relevant PMH/meds/allergies if disclosed.
## Objective — only what was directly observed or stated. Do NOT invent vitals; if camera-based vitals were not captured, state "Vitals: not captured".
## Assessment — differential considerations with brief reasoning.
## Plan — recommended next steps, red-flag warnings, follow-up. Include "Refer to attending physician for review" line.

Footer line: "🏅 TELsTP Co-Accreditation: Telemedicine Encounter — AI Deputy mode".
Keep under 400 words.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { roomId, encounterId, transcript, language } = await req.json();
    if (!roomId || !Array.isArray(transcript)) {
      return new Response(JSON.stringify({ error: "roomId and transcript[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcriptText = transcript
      .map((t: any) => `${String(t.role).toUpperCase()}: ${t.text}`)
      .join("\n");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SOAP_PROMPT(language || "en") },
          { role: "user", content: `Room ${roomId}\n\nTranscript:\n\n${transcriptText}` },
        ],
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("SOAP gen fail", r.status, t);
      return new Response(JSON.stringify({ error: "AI unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const soap: string = (data.choices?.[0]?.message?.content || "").trim();

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (encounterId) {
      await sb.from("encounters").update({ soap_note: soap, summary_sent_at: new Date().toISOString() }).eq("id", encounterId);
    } else {
      await sb.from("encounters").insert({ room_id: roomId, transcript, soap_note: soap, summary_sent_at: new Date().toISOString() });
    }
    try {
      await sb.from("accreditation_logs").insert({
        session_id: roomId,
        action: "encounter_finalized",
        metadata: { language, turns: transcript.length },
      } as any);
    } catch (e) { console.warn("audit skipped", e); }

    return new Response(JSON.stringify({ soap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("encounter-finalize error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
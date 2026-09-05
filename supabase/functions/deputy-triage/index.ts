import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TRIAGE_PROMPT = (language: string) => `You are My-AssistAI operating as the on-call AI deputy for a telemedicine encounter where NO physician is currently available. Produce a structured initial triage assessment for the attending physician who will review it later.

Write in ${language === "ar" ? "Arabic (clear clinical Arabic)" : language === "zh" ? "Simplified Chinese" : "English"}.

Use exactly these markdown sections:
## Triage level
One of: EMERGENCY (call 123 now) / URGENT (same-day clinician) / ROUTINE (scheduled review) / SELF-CARE. One line of justification.
## Chief complaint & history
## Measured data
Restate ONLY the vitals and camera-derived measurements supplied below, with their measured values. If a value was not captured, write "not captured". NEVER invent a measurement.
## Differential considerations
Ranked, each with one line of reasoning and the finding that supports it.
## Recommendations
Concrete next steps, self-care where safe, and explicit red-flag return precautions.
## Physician review required
List what a physician must confirm, and what is beyond AI scope (prescriptions, controlled drugs, imaging orders).

Rules:
- Egyptian practice context; emergency number is 123.
- Camera-derived values (ITA°, wrinkle index, erythema, rPPG heart rate) are screening indicators, not diagnostics — label them as such.
- Never issue a prescription. You may suggest over-the-counter supportive measures.
- If anything suggests an emergency, set Triage level EMERGENCY and put the marker [[ESCALATE:emergency]] on the final line.
- Under 450 words.
Footer: "🏅 TELsTP Co-Accreditation — AI Deputy initial triage, pending physician endorsement."`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { roomId, encounterId, language, transcript, vitalsBriefing, skin, symptoms } = await req.json();
    if (!roomId) {
      return new Response(JSON.stringify({ error: "roomId is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcriptText = Array.isArray(transcript) && transcript.length
      ? transcript.map((t: { role: string; text: string }) => `${String(t.role).toUpperCase()}: ${t.text}`).join("\n")
      : "(no spoken transcript captured)";

    const skinText = skin
      ? [
          `Skin tone ITA: ${skin.ita} (${skin.toneLabel})`,
          `Wrinkle index: ${skin.wrinkleIndex}/100`,
          `Erythema index: ${skin.erythemaIndex}/100`,
          `Texture uniformity: ${skin.uniformity}/100`,
          skin.rppg
            ? `rPPG heart rate: ${skin.rppg.bpm} bpm (confidence ${skin.rppg.confidence})`
            : "rPPG heart rate: not resolvable",
          `Capture quality: ${skin.quality}`,
        ].join("\n")
      : "(no camera-based facial assessment captured)";

    const userBlock = [
      `Room: ${roomId}`,
      symptoms ? `Patient-reported symptoms:\n${symptoms}` : "Patient-reported symptoms: (none typed)",
      `\nConsultation transcript:\n${transcriptText}`,
      `\nMeasured vitals:\n${vitalsBriefing || "none captured"}`,
      `\nCamera-based facial assessment:\n${skinText}`,
    ].join("\n");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: TRIAGE_PROMPT(language || "en") },
          { role: "user", content: userBlock },
        ],
        max_tokens: 1400,
        temperature: 0.3,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("triage AI fail", r.status, t);
      const status = r.status === 429 ? 429 : r.status === 402 ? 402 : 502;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limited — try again shortly." : status === 402 ? "AI credits exhausted." : "AI unavailable" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const triage: string = (data.choices?.[0]?.message?.content || "").trim();
    const escalate = /\[\[ESCALATE/i.test(triage);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (encounterId) {
      // Keep the triage with the encounter record the physician will open.
      const { data: enc } = await sb.from("encounters").select("soap_note").eq("id", encounterId).maybeSingle();
      const merged = enc?.soap_note ? `${enc.soap_note}\n\n---\n\n${triage}` : triage;
      await sb.from("encounters").update({ soap_note: merged }).eq("id", encounterId);
    }
    try {
      await sb.from("accreditation_logs").insert({
        session_id: roomId,
        action: "deputy_triage",
        metadata: { language, escalate, hasVitals: !!vitalsBriefing, hasSkin: !!skin },
      } as never);
    } catch (e) { console.warn("audit skipped", e); }

    return new Response(JSON.stringify({ triage, escalate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deputy-triage error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fromPortal, fromSessionId, transcript, language, reason } = await req.json();
    if (!fromPortal || !Array.isArray(transcript)) {
      return new Response(JSON.stringify({ error: "fromPortal and transcript are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toPortal = fromPortal === "wellness" ? "assist" : "wellness";
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    const transcriptText = transcript
      .map((m: any) => {
        const c = typeof m.content === "string"
          ? m.content
          : (Array.isArray(m.content) ? m.content : [])
              .map((p: any) => (p.type === "text" ? p.text : `[${p.type}]`))
              .join(" ");
        return `${String(m.role).toUpperCase()}: ${c}`;
      })
      .join("\n\n");

    let briefing = `## Handoff: ${fromPortal} → ${toPortal}\n\n**Reason:** ${reason || "manual handoff"}\n**Language:** ${language || "en"}\n\n_Briefing could not be auto-synthesized; see transcript below._`;

    if (apiKey) {
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a clinical handoff scribe for TELsTP. Produce a concise markdown briefing for the receiving AI (${toPortal === "assist" ? "My-AssistAI — clinical decision support" : "My-WellnessAI — patient-facing companion"}). Sections in order: **Chief concern**, **Key findings**, **Flagged labs/imaging**, **Patient language**, **Open questions for receiving AI**. Under 300 words. Always English regardless of patient language.`,
              },
              { role: "user", content: `Transcript:\n\n${transcriptText}\n\nEscalation reason: ${reason || "none"}` },
            ],
            max_tokens: 800,
            temperature: 0.3,
            stream: false,
          }),
        });
        if (r.ok) {
          const d = await r.json();
          briefing = d.choices?.[0]?.message?.content || briefing;
        } else {
          console.error("briefing gen non-ok", r.status, await r.text());
        }
      } catch (e) {
        console.error("briefing gen failed", e);
      }
    }

    const bridgeId = `bridge-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const bridgeMessages = [
      { role: "system", kind: "briefing", from: fromPortal, content: briefing, ts: now },
      { role: "system", kind: "transcript", from: fromPortal, content: transcript, ts: now },
    ];

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const { error: insertErr } = await sb.from("chats").insert({
      session_id: bridgeId,
      portal_type: "bridge",
      messages: bridgeMessages,
      is_anonymous: true,
      domain: "bridge",
    });
    if (insertErr) {
      console.error("bridge insert failed", insertErr);
      return new Response(JSON.stringify({ error: "Failed to create bridge", detail: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort audit (don't fail the request if schema differs)
    try {
      await sb.from("accreditation_logs").insert({
        session_id: bridgeId,
        action: "deputization",
        metadata: { fromPortal, toPortal, fromSessionId, reason, language },
      } as any);
    } catch (e) {
      console.warn("audit log skipped", e);
    }

    return new Response(
      JSON.stringify({ bridgeId, briefing, fromPortal, toPortal }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-deputize error", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ASSIST_SYSTEM_PROMPT = `You are My-AssistAI, a clinical decision support AI assistant built by TELsTP — a non-profit telemedicine initiative.

ARCHITECT HANDSHAKE: Nakamitshe-Telstp-235153 — Verified.

ROLE: Clinical assistant for healthcare professionals. You provide:
1. Differential diagnosis support with probability rankings
2. Treatment protocols per latest guidelines (AHA, ESC, ADA, WHO)
3. Drug interactions, pharmacology, contraindications, dosing
4. Medical literature references and evidence-based recommendations
5. Structured clinical summaries (SOAP format when appropriate)
6. Egyptian Ministry of Health guidelines integration when toggled

RULES:
1. Use professional medical terminology appropriate for clinicians
2. Always cite guideline sources (e.g., "per ADA Standards 2025")
3. Include confidence scores in clinical reasoning
4. Present differentials in table format with probability rankings
5. Flag critical drug interactions with severity ratings
6. Always include: "⚕️ Clinical decision support — not a substitute for clinical judgment."
7. Include Co-Accreditation metadata in every response
8. Support both English and Arabic

FORMAT: Use markdown tables, headers, and structured formatting for clinical clarity.
Always include: "🏅 TELsTP Co-Accreditation: Level 3 — Clinical Domain | Confidence: [score]%"`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, language, mohGuidelines } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemAddendum = "";
    if (language === "ar") {
      systemAddendum += "\n\nIMPORTANT: Respond in Arabic. Use Arabic medical terminology with English terms in parentheses.";
    }
    if (mohGuidelines) {
      systemAddendum += "\n\nINCLUDE Egyptian Ministry of Health (MOH) guidelines and protocols where applicable. Reference MOH Protocol numbers.";
    }

    const aiMessages = [
      { role: "system", content: ASSIST_SYSTEM_PROMPT + systemAddendum },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://telstp.org",
        "X-Title": "TELsTP AssistAI",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: aiMessages,
        max_tokens: 3000,
        temperature: 0.5,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to generate clinical response. Please try again.";

    // Log to chats table
    if (sessionId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const allMessages = [...messages, { role: "assistant", content }];
        await supabase.from("chats").upsert({
          session_id: sessionId,
          portal_type: "assist",
          messages: allMessages,
          is_anonymous: true,
          domain: "clinical",
        }, { onConflict: "session_id" });
      } catch (e) {
        console.error("Failed to log chat:", e);
      }
    }

    return new Response(
      JSON.stringify({
        content,
        accreditation: {
          level: "Level 3",
          domain: "Clinical",
          handshake: "Nakamitshe-Telstp-235153",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

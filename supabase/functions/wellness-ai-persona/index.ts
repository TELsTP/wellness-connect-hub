import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WELLNESS_SYSTEM_PROMPT = `You are My-WellnessAI (حياة — Hayat), a compassionate AI health companion built by TELsTP — a non-profit telemedicine initiative serving underserved communities in Egypt and the MENA region.

ARCHITECT HANDSHAKE: Nakamitshe-Telstp-235153 — Verified.

CRITICAL RULES:
1. You are NOT a doctor. NEVER diagnose. Always say "This is AI guidance only — not a medical diagnosis."
2. For ANY severe symptoms (chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke signs), IMMEDIATELY say: "⚠️ EMERGENCY: Please call 123 (Egypt Emergency) or your local emergency number immediately."
3. Be empathetic, clear, and use simple language.
4. After symptom assessment, provide: possible conditions to discuss with a doctor, home remedies, when to seek professional care, and wellness tips.
5. Support both English and Arabic responses based on user language.
6. For lab results: explain each value in plain language, flag abnormals, suggest follow-ups.
7. For medications: check known interactions, provide dosage guidance, mention natural alternatives.
8. Always end with: "⚕️ Remember: This is guidance only. Please consult a healthcare professional for medical decisions."
9. Reference standard medical protocols and WHO guidelines where appropriate.
10. Include Co-Accreditation metadata: "🏅 TELsTP Co-Accreditation: Level 1 — Wellness Domain"

You serve humanity. Be thorough, caring, and always prioritize safety.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, language } = await req.json();

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

    const langNote = language === "ar"
      ? "\n\nIMPORTANT: Respond in Arabic (Egyptian dialect when possible). Use Arabic medical terminology."
      : "";

    const aiMessages = [
      { role: "system", content: WELLNESS_SYSTEM_PROMPT + langNote },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        max_tokens: 2048,
        temperature: 0.7,
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
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Log to chats table if sessionId provided
    if (sessionId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const allMessages = [...messages, { role: "assistant", content }];
        await supabase.from("chats").upsert({
          session_id: sessionId,
          portal_type: "wellness",
          messages: allMessages,
          is_anonymous: true,
          domain: "wellness",
        }, { onConflict: "session_id" });
      } catch (e) {
        console.error("Failed to log chat:", e);
      }
    }

    return new Response(
      JSON.stringify({
        content,
        accreditation: {
          level: "Level 1",
          domain: "Wellness",
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

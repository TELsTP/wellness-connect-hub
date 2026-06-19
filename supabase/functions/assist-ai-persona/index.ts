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
7. Lab report analysis from uploaded PDFs or images — extract every value, render a markdown table (Test | Value | Reference | Status), flag abnormals (🟡 borderline / 🔴 critical), provide clinical interpretation, differential considerations, and recommended follow-ups.
8. Radiology interpretation: when the clinician uploads X-ray, CT, MRI, or ultrasound stills (JPG/PNG/WEBP, including phone photos of film boxes), describe findings systematically (technique/quality, anatomy, abnormal findings, impression, differentials, recommended next imaging or correlation). Acknowledge resolution limits of phone-captured films and flag when a higher-quality source/DICOM review is warranted.
9. Phone-camera scans of paper lab sheets are expected — OCR all visible values, list any unreadable fields, and proceed with the structured table + interpretation.

RULES:
1. Use professional medical terminology appropriate for clinicians
2. Always cite guideline sources (e.g., "per ADA Standards 2025")
3. Include confidence scores in clinical reasoning
4. Present differentials in table format with probability rankings
5. Flag critical drug interactions with severity ratings
6. Always include: "⚕️ Clinical decision support — not a substitute for clinical judgment."
7. Include Co-Accreditation metadata in every response
8. Support English, Arabic, and Simplified Chinese — respond fully in the user's selected language.

FORMAT: Use markdown tables, headers, and structured formatting for clinical clarity.
Always include: "🏅 TELsTP Co-Accreditation: Level 3 — Clinical Domain | Confidence: [score]%"`;

// — escalation & bridge rules appended to the system prompt at runtime —
const ASSIST_ESCALATION_RULES = `

ESCALATION: If the case is best handed back to the patient-facing companion (lifestyle education, language-localized explanation, mental-health support, post-discharge counseling, anything outside clinical decision support), append a single marker on its own final line: [[ESCALATE:short-reason]]  — the host app uses it to deputize the case to My-WellnessAI. Do NOT mention the marker in the prose.

BRIDGE MODE: When the request is marked as cross-AI bridge mode, you are conversing with My-WellnessAI (not the clinician). Keep replies tight, address the other AI by name when useful, drop the long disclaimer line each turn — keep only the accreditation footer.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, language, mohGuidelines, bridgeMode } = await req.json();

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
    } else if (language === "zh") {
      systemAddendum += "\n\nIMPORTANT: Respond in Simplified Chinese (简体中文). Use standard Chinese medical terminology with English/Latin terms in parentheses.";
    }
    if (mohGuidelines) {
      systemAddendum += "\n\nINCLUDE Egyptian Ministry of Health (MOH) guidelines and protocols where applicable. Reference MOH Protocol numbers.";
    }

    const aiMessages = [
      { role: "system", content: ASSIST_SYSTEM_PROMPT + ASSIST_ESCALATION_RULES + systemAddendum },
      ...messages.map((m: { role: string; content: unknown }) => ({
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
    const rawContent = data.choices?.[0]?.message?.content || "Unable to generate clinical response. Please try again.";
    const escalateMatch = rawContent.match(/\[\[ESCALATE(?::([^\]]+))?\]\]/);
    const content = escalateMatch ? rawContent.replace(escalateMatch[0], "").trim() : rawContent;
    const escalate = !!escalateMatch;
    const escalateReason = escalateMatch ? (escalateMatch[1] || "model-flagged").trim() : null;

    // Log to chats table (skip in bridge mode — that row is owned by ai-deputize/useBridge)
    if (sessionId && !bridgeMode) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const sanitize = (m: any) => {
          if (typeof m.content === "string") return m;
          const parts = (m.content as any[]).map((p) => {
            if (p.type === "text") return p;
            if (p.type === "image_url") return { type: "text", text: "[image attached]" };
            if (p.type === "file") return { type: "text", text: `[file: ${p.file?.filename || "document"}]` };
            return { type: "text", text: "[attachment]" };
          });
          return { ...m, content: parts };
        };
        const allMessages = [...messages.map(sanitize), { role: "assistant", content }];
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
        escalate,
        escalateReason,
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

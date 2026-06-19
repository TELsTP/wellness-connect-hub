// Lightweight client-side red-flag detector — fallback when the model didn't
// emit a [[ESCALATE:reason]] marker. Used by the portals to optionally
// auto-deputize WellnessAI → AssistAI.

const EMERGENCY = [
  "chest pain", "can't breathe", "cannot breathe", "difficulty breathing",
  "shortness of breath", "unconscious", "passed out", "severe bleeding",
  "stroke", "heart attack", "suicidal", "anaphylaxis",
  "ألم في الصدر", "لا أستطيع التنفس", "نزيف", "إغماء",
  "胸痛", "呼吸困难", "昏迷",
];

const CRITICAL_LAB = [
  /\bcreatinine\s*[:=]?\s*[3-9](\.\d+)?\b/i,
  /\btroponin\s*(I|T)?\s*[:=]?\s*[0-9.]+/i,
  /\bpotassium\s*[:=]?\s*([67]\.\d+|[7-9])/i,
  /\bhemoglobin\s*[:=]?\s*([1-6](\.\d+)?)\b/i,
  /\binr\s*[:=]?\s*([4-9](\.\d+)?)/i,
];

export function detectRedFlag(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const k of EMERGENCY) if (lower.includes(k.toLowerCase())) return `emergency keyword: ${k}`;
  for (const re of CRITICAL_LAB) if (re.test(text)) return `critical lab value: ${re.source}`;
  return null;
}

// Parse [[ESCALATE:reason]] marker emitted by the edge function AI.
export function parseEscalateMarker(content: string): { reason: string | null; cleaned: string } {
  const m = content.match(/\[\[ESCALATE(?::([^\]]+))?\]\]/);
  if (!m) return { reason: null, cleaned: content };
  return { reason: (m[1] || "model-flagged").trim(), cleaned: content.replace(m[0], "").trim() };
}
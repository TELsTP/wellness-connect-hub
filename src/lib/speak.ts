// Browser-native TTS — fast, offline, supports AR/EN/ZH. Used to read AI
// answers aloud for hands-free / emergency users who can't read the screen.

let currentUtter: SpeechSynthesisUtterance | null = null;

export function speak(text: string, language: "en" | "ar" | "zh") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text) return;
  // Strip markdown / accreditation footer for clean speech
  const clean = text
    .replace(/\[\[ESCALATE[^\]]*\]\]/g, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = language === "ar" ? "ar-EG" : language === "zh" ? "zh-CN" : "en-US";
  u.rate = 1;
  u.pitch = 1;
  currentUtter = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  currentUtter = null;
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.speaking;
}
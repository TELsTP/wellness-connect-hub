import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ChatInterface, { ChatMessage } from "@/components/shared/ChatInterface";
import ConsentBanner from "@/components/shared/ConsentBanner";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import LanguageToggle from "@/components/shared/LanguageToggle";
import {
  ArrowLeft, ArrowRight, Heart, Phone, FlaskConical, Pill,
  MessageCircle, BookmarkPlus, Send
} from "lucide-react";

const WELLNESS_SYSTEM_PROMPT = `You are My-WellnessAI, a compassionate AI health companion built by TELsTP — a non-profit telemedicine initiative serving underserved communities in Egypt and the MENA region.

CRITICAL RULES:
1. You are NOT a doctor. NEVER diagnose. Always say "This is AI guidance only — not a medical diagnosis."
2. For ANY severe symptoms (chest pain, difficulty breathing, severe bleeding, loss of consciousness, stroke signs), IMMEDIATELY say: "⚠️ EMERGENCY: Please call 123 (Egypt Emergency) or your local emergency number immediately. Do not wait."
3. Be empathetic, clear, and use simple language anyone can understand.
4. After symptom assessment, provide: possible conditions to discuss with a doctor, home remedies, when to seek professional care, and wellness tips.
5. Support both English and Arabic responses based on user language.
6. For lab results: explain each value in plain language, flag abnormals, suggest follow-ups.
7. For medications: check known interactions, provide dosage guidance, mention natural alternatives.
8. Always end with: "⚕️ Remember: This is guidance only. Please consult a healthcare professional for medical decisions."
9. Reference standard medical protocols and WHO guidelines where appropriate.

You serve humanity. Be thorough, caring, and always prioritize safety.`;

const WellnessPortal = () => {
  const { t, isRtl } = useLanguage();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const [consented, setConsented] = useState(() => localStorage.getItem("telstp-wellness-consent") === "true");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triageLevel, setTriageLevel] = useState<string | null>(null);
  const [labInput, setLabInput] = useState("");
  const [labMessages, setLabMessages] = useState<ChatMessage[]>([]);
  const [labLoading, setLabLoading] = useState(false);
  const [medSearch, setMedSearch] = useState("");
  const [medMessages, setMedMessages] = useState<ChatMessage[]>([]);
  const [medLoading, setMedLoading] = useState(false);

  const handleConsent = () => {
    localStorage.setItem("telstp-wellness-consent", "true");
    setConsented(true);
  };

  const sendMessage = useCallback(async (content: string, msgs: ChatMessage[], setMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, systemContext?: string) => {
    const userMsg: ChatMessage = { role: "user", content };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);
    setLoading(true);

    // For MVP, provide a meaningful local response since AI backend isn't connected yet
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: generateWellnessResponse(content, systemContext),
      };
      setMsgs(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleChatSend = (msg: string) => {
    const triageContext = triageLevel ? `Patient reports severity: ${triageLevel}. ` : "";
    sendMessage(msg, messages, setMessages, setIsLoading, triageContext);
  };

  const handleLabInterpret = () => {
    if (!labInput.trim()) return;
    sendMessage(`Please interpret these lab results:\n\n${labInput}`, labMessages, setLabMessages, setLabLoading, "Lab interpretation mode.");
    setLabInput("");
  };

  const handleMedSearch = () => {
    if (!medSearch.trim()) return;
    sendMessage(`Tell me about this medication: ${medSearch}. Include interactions, dosage, and natural alternatives.`, medMessages, setMedMessages, setMedLoading, "Medication info mode.");
    setMedSearch("");
  };

  const suggestions = [
    t("wellness.suggestion1"),
    t("wellness.suggestion2"),
    t("wellness.suggestion3"),
    t("wellness.suggestion4"),
  ];

  if (!consented) {
    return <ConsentBanner onAccept={handleConsent} portalType="wellness" />;
  }

  return (
    <div className="min-h-screen bg-gradient-wellness flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <BackArrow className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.back")}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-wellness flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-wellness-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-sm">{t("wellness.title")}</span>
                <span className="text-xs text-muted-foreground block leading-none">{t("wellness.subtitle")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href="tel:123">
              <Button variant="ghost" size="sm" className="text-emergency gap-1 text-xs">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">123</span>
              </Button>
            </a>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Triage selector */}
      {!triageLevel && (
        <div className="bg-card border-b p-4">
          <div className="container mx-auto max-w-lg">
            <p className="text-sm font-medium text-center mb-3">{t("wellness.triage_title")}</p>
            <div className="flex gap-2 justify-center">
              {[
                { level: "mild", label: t("wellness.triage_mild"), color: "bg-success/10 text-success border-success/30 hover:bg-success/20" },
                { level: "moderate", label: t("wellness.triage_moderate"), color: "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20" },
                { level: "severe", label: t("wellness.triage_severe"), color: "bg-emergency/10 text-emergency border-emergency/30 hover:bg-emergency/20" },
              ].map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => setTriageLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 container mx-auto max-w-3xl flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-3">
            <TabsTrigger value="chat" className="gap-1 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              {t("wellness.tab_chat")}
            </TabsTrigger>
            <TabsTrigger value="lab" className="gap-1 text-xs">
              <FlaskConical className="w-3.5 h-3.5" />
              {t("wellness.tab_lab")}
            </TabsTrigger>
            <TabsTrigger value="meds" className="gap-1 text-xs">
              <Pill className="w-3.5 h-3.5" />
              {t("wellness.tab_meds")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:flex">
            <ChatInterface
              messages={messages}
              onSend={handleChatSend}
              isLoading={isLoading}
              placeholder={t("wellness.chat_placeholder")}
              suggestions={suggestions}
              onNewChat={() => { setMessages([]); setTriageLevel(null); }}
              accentColor="wellness"
            />
          </TabsContent>

          <TabsContent value="lab" className="flex-1 flex flex-col mt-0 p-4 space-y-4">
            <div className="space-y-3">
              <Textarea
                value={labInput}
                onChange={(e) => setLabInput(e.target.value)}
                placeholder={t("wellness.lab_paste")}
                className="min-h-[120px]"
              />
              <Button onClick={handleLabInterpret} disabled={!labInput.trim() || labLoading} className="bg-wellness hover:bg-wellness/90 text-white gap-2">
                <FlaskConical className="w-4 h-4" />
                {t("wellness.lab_interpret")}
              </Button>
            </div>
            {labMessages.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {labMessages.filter(m => m.role === "assistant").map((msg, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 text-sm prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                  </div>
                ))}
              </div>
            )}
            <MedicalDisclaimer variant="inline" />
          </TabsContent>

          <TabsContent value="meds" className="flex-1 flex flex-col mt-0 p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={medSearch}
                onChange={(e) => setMedSearch(e.target.value)}
                placeholder={t("wellness.med_search")}
                onKeyDown={(e) => e.key === "Enter" && handleMedSearch()}
              />
              <Button onClick={handleMedSearch} disabled={!medSearch.trim() || medLoading} size="icon" className="bg-wellness hover:bg-wellness/90 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {medMessages.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {medMessages.filter(m => m.role === "assistant").map((msg, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 text-sm prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                  </div>
                ))}
              </div>
            )}
            <MedicalDisclaimer variant="inline" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Local response generator for MVP (will be replaced by AI edge function)
function generateWellnessResponse(input: string, context?: string): string {
  const lower = input.toLowerCase();

  // Emergency detection
  const emergencyKeywords = ["chest pain", "can't breathe", "difficulty breathing", "unconscious", "severe bleeding", "stroke", "heart attack", "ألم في الصدر", "لا أستطيع التنفس"];
  if (emergencyKeywords.some(k => lower.includes(k))) {
    return `## ⚠️ EMERGENCY ALERT

**This sounds like it could be a medical emergency.** Please:

1. **Call 123** (Egypt Emergency) or your local emergency number **immediately**
2. Do not wait — seek emergency medical care right now
3. If someone is with you, ask them to help

---

While waiting for help:
- Stay calm and try to rest
- Do not eat or drink anything
- Keep the person lying down if unconscious
- Note the time symptoms started

⚕️ *This is AI guidance only — not a diagnosis. In emergencies, always call professional emergency services.*`;
  }

  // Headache/fever
  if (lower.includes("headache") || lower.includes("fever") || lower.includes("صداع") || lower.includes("حمى")) {
    return `## Headache & Fever Assessment

Based on your symptoms, here are some **possibilities to discuss with your doctor**:

### Possible Conditions
- **Common cold or flu** — Most likely if accompanied by runny nose, body aches
- **Tension headache** — Often stress-related, usually responds to rest
- **Sinusitis** — If accompanied by facial pressure and nasal congestion
- **Viral infection** — Common cause of combined headache and fever

### Home Remedies 🏠
- **Rest** in a quiet, dark room
- **Stay hydrated** — drink plenty of water, herbal teas, and clear broths
- **Cool compress** on forehead may help
- **Paracetamol** (as directed on packaging) for fever and pain relief
- **Ginger tea** with honey can be soothing

### When to Seek Professional Care 🏥
- Fever above **39°C (102°F)** lasting more than 3 days
- **Severe headache** that is the worst you've ever had
- **Stiff neck** with fever (could indicate meningitis)
- **Vision changes** or confusion
- Symptoms **worsening** despite home treatment

### Wellness Tips 💚
- Get 7-8 hours of sleep
- Wash hands frequently
- Maintain a balanced diet rich in vitamin C

⚕️ *Remember: This is guidance only. Please consult a healthcare professional for medical decisions.*`;
  }

  // Lab results
  if (lower.includes("lab") || lower.includes("blood test") || lower.includes("تحليل")) {
    return `## Lab Result Interpretation

I'd be happy to help interpret your lab results! To provide the most accurate guidance, please share the specific values from your report.

### Common Blood Test Values I Can Explain:
- **CBC** (Complete Blood Count) — Red cells, white cells, platelets
- **Blood Sugar** (Glucose, HbA1c) — Diabetes screening
- **Lipid Panel** — Cholesterol, triglycerides
- **Liver Function** — ALT, AST, Bilirubin
- **Kidney Function** — Creatinine, BUN, eGFR
- **Thyroid** — TSH, T3, T4

### How to Share Results
Simply type or paste the test name and its value, for example:
- "Hemoglobin: 12.5 g/dL"
- "Glucose fasting: 110 mg/dL"

I'll explain each value in plain language and flag any that need attention.

⚕️ *Remember: This is guidance only. Please consult a healthcare professional for medical decisions.*`;
  }

  // Default
  return `## Health Guidance

Thank you for reaching out. I'm here to help you understand your health concern.

Based on what you've shared, here's my guidance:

### General Recommendations
1. **Monitor your symptoms** — Note when they started, how severe they are, and if anything makes them better or worse
2. **Stay hydrated** and maintain a balanced diet
3. **Rest** if you're feeling unwell
4. **Keep a symptom diary** to share with a healthcare provider

### When to Seek Professional Care
- If symptoms persist for more than **3-5 days**
- If symptoms are **getting worse** instead of better
- If you experience any **severe or unusual symptoms**
- If you have **underlying health conditions**

### Need Emergency Help?
🚨 Call **123** (Egypt Emergency) for any life-threatening situation.

Would you like me to:
- Assess specific symptoms in more detail?
- Explain any lab results?
- Check medication information?

⚕️ *Remember: This is guidance only — not a medical diagnosis. Please consult a healthcare professional for medical decisions.*`;
}

export default WellnessPortal;

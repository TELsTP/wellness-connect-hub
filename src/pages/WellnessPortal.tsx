import { useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import MultimediaChat, { ChatMessage } from "@/components/shared/MultimediaChat";
import ConsentBanner from "@/components/shared/ConsentBanner";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import LanguageToggle from "@/components/shared/LanguageToggle";
import ArchitectHandshake from "@/components/shared/ArchitectHandshake";
import HayatPersona from "@/components/shared/HayatPersona";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Heart, Phone, FlaskConical, Pill,
  MessageCircle, Send
} from "lucide-react";

const WellnessPortal = () => {
  const { t, isRtl, language } = useLanguage();
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
  const sessionId = useRef(`wellness-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const handleConsent = () => {
    localStorage.setItem("telstp-wellness-consent", "true");
    setConsented(true);
  };

  const callEdgeFunction = useCallback(async (
    content: string,
    msgs: ChatMessage[],
    setMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    extraContext?: string
  ) => {
    const userMsg: ChatMessage = { role: "user", content: extraContext ? `${extraContext}\n\n${content}` : content };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("wellness-ai-persona", {
        body: {
          messages: updatedMsgs.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionId.current,
          language,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "I'm sorry, please try again.",
      };
      setMsgs(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Wellness AI error:", err);
      toast.error("AI service temporarily unavailable. Using offline guidance.");
      // Fallback to local response
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: getFallbackResponse(content),
      };
      setMsgs(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  const handleChatSend = (msg: string) => {
    const triageContext = triageLevel ? `Patient reports severity: ${triageLevel}.` : "";
    callEdgeFunction(msg, messages, setMessages, setIsLoading, triageContext || undefined);
  };

  const handleLabInterpret = () => {
    if (!labInput.trim()) return;
    callEdgeFunction(
      `Please interpret these lab results:\n\n${labInput}`,
      labMessages, setLabMessages, setLabLoading
    );
    setLabInput("");
  };

  const handleMedSearch = () => {
    if (!medSearch.trim()) return;
    callEdgeFunction(
      `Tell me about this medication: ${medSearch}. Include interactions, dosage, and natural alternatives.`,
      medMessages, setMedMessages, setMedLoading
    );
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
      <ArchitectHandshake />

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
            <MultimediaChat
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

      <HayatPersona portalType="wellness" />
    </div>
  );
};

function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase();
  const emergencyKeywords = ["chest pain", "can't breathe", "difficulty breathing", "unconscious", "severe bleeding", "stroke", "heart attack", "ألم في الصدر", "لا أستطيع التنفس"];
  if (emergencyKeywords.some(k => lower.includes(k))) {
    return `## ⚠️ EMERGENCY ALERT\n\n**This sounds like it could be a medical emergency.** Please:\n\n1. **Call 123** (Egypt Emergency) immediately\n2. Do not wait — seek emergency medical care right now\n\n⚕️ *This is AI guidance only — not a diagnosis.*`;
  }
  return `## Health Guidance\n\nThank you for reaching out. I'm currently operating in offline mode. For the best experience, please try again in a moment.\n\n### General Recommendations\n1. **Monitor your symptoms** carefully\n2. **Stay hydrated** and rest\n3. If symptoms persist or worsen, **seek professional care**\n\n🚨 For emergencies, call **123** (Egypt Emergency)\n\n⚕️ *This is guidance only. Please consult a healthcare professional.*\n🏅 TELsTP Co-Accreditation: Level 1 — Wellness Domain`;
}

export default WellnessPortal;

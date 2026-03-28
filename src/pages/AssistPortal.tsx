import { useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import MultimediaChat, { ChatMessage } from "@/components/shared/MultimediaChat";
import ConsentBanner from "@/components/shared/ConsentBanner";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import LanguageToggle from "@/components/shared/LanguageToggle";
import ArchitectHandshake from "@/components/shared/ArchitectHandshake";
import HayatPersona from "@/components/shared/HayatPersona";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Stethoscope, MessageCircle,
  BookOpen, Pill, FileText, Send, Award
} from "lucide-react";

const AssistPortal = () => {
  const { t, isRtl, language } = useLanguage();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;
  const [consented, setConsented] = useState(() => localStorage.getItem("telstp-assist-consent") === "true");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [litSearch, setLitSearch] = useState("");
  const [litMessages, setLitMessages] = useState<ChatMessage[]>([]);
  const [litLoading, setLitLoading] = useState(false);
  const [drugSearch, setDrugSearch] = useState("");
  const [drugMessages, setDrugMessages] = useState<ChatMessage[]>([]);
  const [drugLoading, setDrugLoading] = useState(false);
  const [patientData, setPatientData] = useState("");
  const [summaryMessages, setSummaryMessages] = useState<ChatMessage[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mohGuidelines, setMohGuidelines] = useState(true);
  const sessionId = useRef(`assist-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const handleConsent = () => {
    localStorage.setItem("telstp-assist-consent", "true");
    setConsented(true);
  };

  const callEdgeFunction = useCallback(async (
    content: string,
    msgs: ChatMessage[],
    setMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    const userMsg: ChatMessage = { role: "user", content };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("assist-ai-persona", {
        body: {
          messages: updatedMsgs.map(m => ({ role: m.role, content: m.content })),
          sessionId: sessionId.current,
          language,
          mohGuidelines,
        },
      });

      if (error) throw error;

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "Unable to generate clinical response. Please try again.",
      };
      setMsgs(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Assist AI error:", err);
      toast.error("AI service temporarily unavailable. Using offline mode.");
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: `## Clinical Decision Support\n\n⚠️ AI service is temporarily offline. Please try again shortly.\n\nFor urgent clinical decisions, consult your institution's protocols directly.\n\n---\n*⚕️ Clinical decision support — not a substitute for clinical judgment.*\n*🏅 TELsTP Co-Accreditation: Offline Mode*`,
      };
      setMsgs(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  }, [language, mohGuidelines]);

  const handleChatSend = (msg: string) => {
    callEdgeFunction(msg, messages, setMessages, setIsLoading);
  };

  const handleLitSearch = () => {
    if (!litSearch.trim()) return;
    callEdgeFunction(`Search medical literature: ${litSearch}`, litMessages, setLitMessages, setLitLoading);
    setLitSearch("");
  };

  const handleDrugSearch = () => {
    if (!drugSearch.trim()) return;
    callEdgeFunction(`Drug reference query: ${drugSearch}. Include pharmacology, interactions, contraindications, and dosing.`, drugMessages, setDrugMessages, setDrugLoading);
    setDrugSearch("");
  };

  const handleSummary = () => {
    if (!patientData.trim()) return;
    callEdgeFunction(`Generate a structured clinical summary from this patient data:\n\n${patientData}`, summaryMessages, setSummaryMessages, setSummaryLoading);
    setPatientData("");
  };

  const suggestions = [
    t("assist.suggestion1"),
    t("assist.suggestion2"),
    t("assist.suggestion3"),
    t("assist.suggestion4"),
  ];

  if (!consented) {
    return <ConsentBanner onAccept={handleConsent} portalType="clinical" />;
  }

  return (
    <div className="min-h-screen bg-gradient-clinical flex flex-col">
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
              <div className="w-7 h-7 rounded-lg bg-clinical flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5 text-clinical-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-sm">{t("assist.title")}</span>
                <span className="text-xs text-muted-foreground block leading-none">{t("assist.subtitle")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t("assist.moh_toggle")}</span>
              <Switch checked={mohGuidelines} onCheckedChange={setMohGuidelines} />
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 container mx-auto max-w-3xl flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="chat" className="gap-1 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("assist.tab_chat")}</span>
            </TabsTrigger>
            <TabsTrigger value="literature" className="gap-1 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("assist.tab_literature")}</span>
            </TabsTrigger>
            <TabsTrigger value="drugs" className="gap-1 text-xs">
              <Pill className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("assist.tab_drugs")}</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1 text-xs">
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("assist.tab_summary")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 data-[state=active]:flex">
            <MultimediaChat
              messages={messages}
              onSend={handleChatSend}
              isLoading={isLoading}
              placeholder={t("assist.chat_placeholder")}
              suggestions={suggestions}
              onNewChat={() => setMessages([])}
              accentColor="clinical"
            />
          </TabsContent>

          <TabsContent value="literature" className="flex-1 flex flex-col mt-0 p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={litSearch}
                onChange={(e) => setLitSearch(e.target.value)}
                placeholder={t("assist.literature_search")}
                onKeyDown={(e) => e.key === "Enter" && handleLitSearch()}
              />
              <Button onClick={handleLitSearch} disabled={!litSearch.trim() || litLoading} size="icon" className="bg-clinical hover:bg-clinical/90 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {litMessages.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {litMessages.filter(m => m.role === "assistant").map((msg, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 text-sm prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                  </div>
                ))}
              </div>
            )}
            <MedicalDisclaimer variant="inline" />
          </TabsContent>

          <TabsContent value="drugs" className="flex-1 flex flex-col mt-0 p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                value={drugSearch}
                onChange={(e) => setDrugSearch(e.target.value)}
                placeholder={t("assist.drug_search")}
                onKeyDown={(e) => e.key === "Enter" && handleDrugSearch()}
              />
              <Button onClick={handleDrugSearch} disabled={!drugSearch.trim() || drugLoading} size="icon" className="bg-clinical hover:bg-clinical/90 text-white shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {drugMessages.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {drugMessages.filter(m => m.role === "assistant").map((msg, i) => (
                  <div key={i} className="bg-card border rounded-xl p-4 text-sm prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                  </div>
                ))}
              </div>
            )}
            <MedicalDisclaimer variant="inline" />
          </TabsContent>

          <TabsContent value="summary" className="flex-1 flex flex-col mt-0 p-4 space-y-4">
            <Textarea
              value={patientData}
              onChange={(e) => setPatientData(e.target.value)}
              placeholder={t("assist.patient_data")}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleSummary} disabled={!patientData.trim() || summaryLoading} className="bg-clinical hover:bg-clinical/90 text-white gap-2">
                <FileText className="w-4 h-4" />
                {t("assist.generate_summary")}
              </Button>
              <Button variant="outline" className="gap-2 border-clinical/30 text-clinical">
                <Award className="w-4 h-4" />
                {t("assist.generate_cert")}
              </Button>
            </div>
            {summaryMessages.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {summaryMessages.filter(m => m.role === "assistant").map((msg, i) => (
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

      <HayatPersona portalType="clinical" />
    </div>
  );
};

export default AssistPortal;

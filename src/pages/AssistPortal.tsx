import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ChatInterface, { ChatMessage } from "@/components/shared/ChatInterface";
import ConsentBanner from "@/components/shared/ConsentBanner";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import LanguageToggle from "@/components/shared/LanguageToggle";
import {
  ArrowLeft, ArrowRight, Stethoscope, MessageCircle,
  BookOpen, Pill, FileText, Send, Award
} from "lucide-react";

const AssistPortal = () => {
  const { t, isRtl } = useLanguage();
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
  const [darkTheme, setDarkTheme] = useState(false);

  const handleConsent = () => {
    localStorage.setItem("telstp-assist-consent", "true");
    setConsented(true);
  };

  const sendMessage = useCallback((content: string, msgs: ChatMessage[], setMsgs: React.Dispatch<React.SetStateAction<ChatMessage[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, systemContext?: string) => {
    const userMsg: ChatMessage = { role: "user", content };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: generateClinicalResponse(content, systemContext, mohGuidelines),
      };
      setMsgs(prev => [...prev, assistantMsg]);
      setLoading(false);
    }, 1800);
  }, [mohGuidelines]);

  const handleChatSend = (msg: string) => {
    sendMessage(msg, messages, setMessages, setIsLoading, "Clinical decision support mode.");
  };

  const handleLitSearch = () => {
    if (!litSearch.trim()) return;
    sendMessage(`Search medical literature: ${litSearch}`, litMessages, setLitMessages, setLitLoading, "Literature search mode.");
    setLitSearch("");
  };

  const handleDrugSearch = () => {
    if (!drugSearch.trim()) return;
    sendMessage(`Drug reference query: ${drugSearch}. Include pharmacology, interactions, contraindications, and dosing.`, drugMessages, setDrugMessages, setDrugLoading, "Drug reference mode.");
    setDrugSearch("");
  };

  const handleSummary = () => {
    if (!patientData.trim()) return;
    sendMessage(`Generate a structured clinical summary from this patient data:\n\n${patientData}`, summaryMessages, setSummaryMessages, setSummaryLoading, "Patient summary generator mode.");
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
    <div className={`min-h-screen bg-gradient-clinical flex flex-col ${darkTheme ? "dark" : ""}`}>
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
            <ChatInterface
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
    </div>
  );
};

function generateClinicalResponse(input: string, context?: string, mohGuidelines?: boolean): string {
  const lower = input.toLowerCase();

  if (lower.includes("chest pain") || lower.includes("ألم في الصدر") || lower.includes("dyspnea")) {
    return `## Clinical Decision Support — Chest Pain with Dyspnea

**🔬 Co-Accreditation: Level 3 — Clinical Reasoning Domain | Confidence: 87%**

### Differential Diagnosis (Ranked by Probability)

| # | Condition | Probability | Key Discriminators |
|---|-----------|-------------|-------------------|
| 1 | **Acute Coronary Syndrome** | High | ECG changes, troponin elevation, risk factors |
| 2 | **Pulmonary Embolism** | Moderate-High | D-dimer, Wells score, CT-PA |
| 3 | **Pneumonia** | Moderate | Fever, productive cough, consolidation |
| 4 | **Pneumothorax** | Low-Moderate | Sudden onset, decreased breath sounds |
| 5 | **Musculoskeletal** | Low | Reproducible on palpation, positional |

### Recommended Workup
1. **Immediate**: 12-lead ECG, Troponin (serial q3h), CXR, SpO2
2. **Labs**: CBC, BMP, BNP/NT-proBNP, D-dimer (if PE suspected)
3. **Imaging**: CT-PA if Wells >4, Echo if hemodynamically unstable
4. **Risk Scores**: HEART Score, Wells Score for PE

### Treatment Protocol (per AHA/ESC Guidelines)
- **ACS Protocol**: Aspirin 325mg, Heparin, Morphine PRN, Nitro if SBP>90
- **PE Protocol**: LMWH, consider thrombolytics if massive PE
- **Supportive**: O2 to maintain SpO2 >94%, IV access, continuous monitoring

${mohGuidelines ? `### 🇪🇬 Egyptian MOH Guidelines Note
Per Egyptian Ministry of Health Protocol (2024): Initial assessment should follow the National ACS pathway. Transfer to PCI-capable facility within 120 minutes if STEMI confirmed.` : ""}

---
*⚕️ This is AI-generated clinical decision support — not a substitute for clinical judgment. The treating physician retains full responsibility for patient care.*
*🏅 TELsTP Co-Accreditation ID: CDS-2025-${Math.random().toString(36).slice(2, 8).toUpperCase()}*`;
  }

  if (lower.includes("diabetes") || lower.includes("dm") || lower.includes("سكري")) {
    return `## Clinical Decision Support — Type 2 Diabetes Mellitus

**🔬 Co-Accreditation: Level 2 — Treatment Protocols Domain | Confidence: 92%**

### Latest Treatment Protocols (ADA Standards 2025)

#### First-Line Therapy
- **Metformin** remains first-line unless contraindicated (eGFR <30)
- Starting dose: 500mg BID with meals, titrate to max 2000mg/day
- HbA1c target: <7% for most adults, individualize for elderly/comorbid

#### Second-Line Agents (Based on Comorbidities)
| Comorbidity | Preferred Agent | Evidence Level |
|------------|----------------|----------------|
| **ASCVD** | GLP-1 RA (Semaglutide, Liraglutide) | Grade A |
| **Heart Failure** | SGLT2i (Empagliflozin, Dapagliflozin) | Grade A |
| **CKD** | SGLT2i or Finerenone | Grade A |
| **Obesity** | GLP-1 RA or Tirzepatide | Grade A |
| **Cost concern** | Sulfonylurea or TZD | Grade B |

#### Monitoring Schedule
- HbA1c every **3 months** until stable, then every **6 months**
- Annual: Lipid panel, renal function, urine albumin, eye exam, foot exam
- Blood pressure target: <130/80 mmHg

${mohGuidelines ? `### 🇪🇬 Egyptian MOH Guidelines
Egypt National Diabetes Program recommends screening all adults >45 years. Community health workers in rural areas should perform annual HbA1c screening per MOH Protocol 2024.` : ""}

---
*⚕️ Clinical decision support — not a substitute for clinical judgment.*
*🏅 TELsTP Co-Accreditation ID: CDS-2025-${Math.random().toString(36).slice(2, 8).toUpperCase()}*`;
  }

  if (lower.includes("drug") || lower.includes("interaction") || lower.includes("metformin") || lower.includes("تفاعل")) {
    return `## Drug Reference — Metformin + Lisinopril Interaction Analysis

**🔬 Co-Accreditation: Level 2 — Pharmacology Domain | Confidence: 95%**

### Interaction Summary
| Parameter | Assessment |
|-----------|-----------|
| **Severity** | Low — Generally safe combination |
| **Evidence** | Well-established in clinical practice |
| **Mechanism** | No direct pharmacokinetic interaction |
| **Clinical Significance** | Monitor renal function (both renally cleared) |

### Metformin (Biguanide)
- **MOA**: Decreases hepatic glucose production, increases insulin sensitivity
- **Dose**: 500-2000mg/day in divided doses
- **Key Monitoring**: Renal function (hold if eGFR <30), B12 levels annually
- **Contraindications**: Severe renal impairment, metabolic acidosis, contrast dye procedures

### Lisinopril (ACE Inhibitor)
- **MOA**: Inhibits angiotensin-converting enzyme, reduces afterload
- **Dose**: 5-40mg/day
- **Key Monitoring**: K+, creatinine, BP
- **Contraindications**: Pregnancy, bilateral renal artery stenosis, angioedema history

### Clinical Recommendations
1. **Safe to combine** — commonly prescribed together in diabetic patients
2. **Renal monitoring**: Creatinine and eGFR at baseline, then every 3-6 months
3. **Potassium**: Monitor K+ especially if adding other agents
4. **Benefit**: Lisinopril provides renal protection in diabetic nephropathy (GRADE A evidence)

---
*⚕️ Clinical decision support — always verify with current formulary.*
*🏅 TELsTP Co-Accreditation ID: PHARM-2025-${Math.random().toString(36).slice(2, 8).toUpperCase()}*`;
  }

  // Default clinical response
  return `## Clinical Decision Support

**🔬 Co-Accreditation: Level 2 — General Clinical Domain**

Thank you for your clinical query. Here's my analysis:

### Assessment Framework
Based on your question, I recommend the following systematic approach:

1. **History**: Comprehensive patient history including:
   - Chief complaint and HPI (onset, duration, severity, associated symptoms)
   - Past medical/surgical history
   - Medications and allergies
   - Family and social history

2. **Physical Examination**: Focused exam based on presenting complaint

3. **Investigations**: Guided by clinical suspicion
   - Basic labs: CBC, BMP, LFTs
   - Specific tests based on differential

4. **Differential Diagnosis**: Systematic approach using clinical reasoning

### Available Support
I can help you with:
- **Differential diagnosis** for specific presentations
- **Treatment protocols** per latest guidelines (AHA, ESC, ADA, WHO)
- **Drug interactions** and dosing guidance
- **Literature search** for evidence-based recommendations
- **Patient summaries** in structured clinical format

${mohGuidelines ? "🇪🇬 Egyptian MOH guidelines integration is **enabled** for this session." : ""}

Please provide more specific clinical details for a targeted analysis.

---
*⚕️ Clinical decision support — not a substitute for clinical judgment.*
*🏅 TELsTP Co-Accreditation ID: CDS-2025-${Math.random().toString(36).slice(2, 8).toUpperCase()}*`;
}

export default AssistPortal;

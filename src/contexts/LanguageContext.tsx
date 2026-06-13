import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Hub
    "hub.title": "TELsTP Telemedicine Hub",
    "hub.subtitle": "Built by AI • For Humanity",
    "hub.mission": "Democratizing accredited AI-powered care in MENA and beyond",
    "hub.wellness_portal": "My-WellnessAI",
    "hub.wellness_desc": "AI-powered health guidance for everyone",
    "hub.assist_portal": "My-AssistAI",
    "hub.assist_desc": "Clinical decision support for healthcare professionals",
    "hub.how_it_works": "How It Works",
    "hub.features": "Features",
    "hub.impact": "Our Impact",
    "hub.impact_stat": "78% global AI adoption gap closed in MENA",
    "hub.about": "About",
    "hub.contact": "Contact",
    "hub.powered_by": "Powered by TELsTP AI Co-Accreditation",
    "hub.enter_portal": "Enter Portal",
    "hub.step1_title": "Describe Your Concern",
    "hub.step1_desc": "Tell our AI about your symptoms or medical question in your own words",
    "hub.step2_title": "Receive AI Guidance",
    "hub.step2_desc": "Get accredited, evidence-based guidance with clear medical disclaimers",
    "hub.step3_title": "Take Action",
    "hub.step3_desc": "Follow recommendations, save results, or connect with emergency services",
    "hub.feature1_title": "Symptom Assessment",
    "hub.feature1_desc": "AI-powered symptom analysis with severity triage",
    "hub.feature2_title": "Lab Interpreter",
    "hub.feature2_desc": "Upload lab results for plain-language explanations",
    "hub.feature3_title": "Clinical Support",
    "hub.feature3_desc": "Differential diagnosis and treatment protocols for doctors",
    "hub.feature4_title": "Drug Reference",
    "hub.feature4_desc": "Medication interactions and dosage guidance",
    "hub.disclaimer_title": "Medical Disclaimer",
    "hub.disclaimer_text": "This platform provides AI-generated guidance only, not medical diagnoses. Always consult a qualified healthcare professional for medical decisions. In emergencies, call 123 (Egypt) or your local emergency number immediately.",
    "hub.privacy_note": "HIPAA-compliant design • Egyptian Data Protection Law (151/2020) • No personal health data stored",

    // Wellness Portal
    "wellness.title": "My-WellnessAI",
    "wellness.subtitle": "Your AI Health Companion",
    "wellness.chat_placeholder": "Describe your symptoms or health concern...",
    "wellness.tab_chat": "Wellness Chat",
    "wellness.tab_lab": "Lab Interpreter",
    "wellness.tab_meds": "Medication Info",
    "wellness.triage_title": "How are you feeling?",
    "wellness.triage_mild": "Mild",
    "wellness.triage_moderate": "Moderate",
    "wellness.triage_severe": "Severe / Emergency",
    "wellness.suggestion1": "I have a headache and fever",
    "wellness.suggestion2": "What does my blood test mean?",
    "wellness.suggestion3": "Natural remedies for cold and flu",
    "wellness.suggestion4": "Can I take ibuprofen with aspirin?",
    "wellness.save_profile": "Save to My TELsTP Profile",
    "wellness.emergency_call": "Call 123 — Egypt Emergency",
    "wellness.lab_paste": "Paste your lab results here...",
    "wellness.lab_interpret": "Interpret Results",
    "wellness.med_search": "Search medication name...",
    "wellness.consent_title": "Privacy & Consent",
    "wellness.consent_text": "By using this AI you agree your data stays anonymous and is not stored for training unless you opt-in for research (non-profit only).",
    "wellness.consent_agree": "I Understand & Agree",

    // Assist Portal
    "assist.title": "My-AssistAI",
    "assist.subtitle": "Clinical Decision Support",
    "assist.chat_placeholder": "Describe the clinical case or question...",
    "assist.tab_chat": "Clinical Chat",
    "assist.tab_literature": "Literature Search",
    "assist.tab_drugs": "Drug Reference",
    "assist.tab_summary": "Patient Summary",
    "assist.suggestion1": "Differential diagnosis for chest pain with dyspnea",
    "assist.suggestion2": "Latest treatment protocols for Type 2 DM",
    "assist.suggestion3": "Drug interactions for metformin + lisinopril",
    "assist.suggestion4": "Generate clinical summary from patient data",
    "assist.generate_cert": "Generate Co-Accreditation Certificate",
    "assist.literature_search": "Search medical literature...",
    "assist.drug_search": "Search drug name or interaction...",
    "assist.patient_data": "Enter patient data for summary...",
    "assist.generate_summary": "Generate Summary",
    "assist.moh_toggle": "Include Egyptian MOH Guidelines",
    "assist.accreditation_level": "Accreditation Level",

    // Common
    "common.send": "Send",
    "common.back": "Back to Hub",
    "common.loading": "Thinking...",
    "common.disclaimer": "⚕️ This is AI guidance only — not a diagnosis. Seek professional care for emergencies.",
    "common.dark_mode": "Dark Mode",
    "common.light_mode": "Light Mode",
    "common.language": "العربية",
    "common.privacy_policy": "Privacy Policy",
    "common.terms": "Terms of Service",
    "common.new_chat": "New Chat",
    "common.language_next": "中文",
    "chat.upload_hint": "Upload lab report (PDF/image) and ask for interpretation",
    "chat.lab_received": "Lab report received — analyzing...",
  },
  ar: {
    "hub.title": "مركز TELsTP للطب عن بُعد",
    "hub.subtitle": "بُني بالذكاء الاصطناعي • من أجل الإنسانية",
    "hub.mission": "نشر الرعاية الصحية المعتمدة بالذكاء الاصطناعي في منطقة الشرق الأوسط وشمال أفريقيا وما بعدها",
    "hub.wellness_portal": "My-WellnessAI",
    "hub.wellness_desc": "إرشادات صحية مدعومة بالذكاء الاصطناعي للجميع",
    "hub.assist_portal": "My-AssistAI",
    "hub.assist_desc": "دعم القرارات السريرية للمهنيين الصحيين",
    "hub.how_it_works": "كيف يعمل",
    "hub.features": "المميزات",
    "hub.impact": "تأثيرنا",
    "hub.impact_stat": "سد 78٪ من فجوة تبني الذكاء الاصطناعي عالميًا في منطقة الشرق الأوسط",
    "hub.about": "حول المشروع",
    "hub.contact": "اتصل بنا",
    "hub.powered_by": "مدعوم بالاعتماد المشترك لـ TELsTP AI",
    "hub.enter_portal": "دخول البوابة",
    "hub.step1_title": "صف مشكلتك الصحية",
    "hub.step1_desc": "أخبر ذكاءنا الاصطناعي عن أعراضك أو سؤالك الطبي بكلماتك الخاصة",
    "hub.step2_title": "احصل على إرشادات الذكاء الاصطناعي",
    "hub.step2_desc": "احصل على إرشادات معتمدة مبنية على الأدلة مع إخلاء مسؤولية طبي واضح",
    "hub.step3_title": "اتخذ إجراءً",
    "hub.step3_desc": "اتبع التوصيات أو احفظ النتائج أو تواصل مع خدمات الطوارئ",
    "hub.feature1_title": "تقييم الأعراض",
    "hub.feature1_desc": "تحليل الأعراض بالذكاء الاصطناعي مع تصنيف الخطورة",
    "hub.feature2_title": "تفسير التحاليل",
    "hub.feature2_desc": "ارفع نتائج التحاليل للحصول على شرح مبسط",
    "hub.feature3_title": "الدعم السريري",
    "hub.feature3_desc": "التشخيص التفريقي وبروتوكولات العلاج للأطباء",
    "hub.feature4_title": "مرجع الأدوية",
    "hub.feature4_desc": "تفاعلات الأدوية وإرشادات الجرعات",
    "hub.disclaimer_title": "إخلاء مسؤولية طبي",
    "hub.disclaimer_text": "توفر هذه المنصة إرشادات مُنشأة بالذكاء الاصطناعي فقط وليس تشخيصات طبية. استشر دائمًا متخصص رعاية صحية مؤهل للقرارات الطبية. في حالات الطوارئ اتصل بـ 123 (مصر) أو رقم الطوارئ المحلي فورًا.",
    "hub.privacy_note": "تصميم متوافق مع HIPAA • قانون حماية البيانات المصري (151/2020) • لا يتم تخزين بيانات صحية شخصية",

    "wellness.title": "My-WellnessAI",
    "wellness.subtitle": "رفيقك الصحي الذكي",
    "wellness.chat_placeholder": "صف أعراضك أو مشكلتك الصحية...",
    "wellness.tab_chat": "محادثة صحية",
    "wellness.tab_lab": "تفسير التحاليل",
    "wellness.tab_meds": "معلومات الأدوية",
    "wellness.triage_title": "كيف تشعر؟",
    "wellness.triage_mild": "خفيف",
    "wellness.triage_moderate": "متوسط",
    "wellness.triage_severe": "شديد / طوارئ",
    "wellness.suggestion1": "أعاني من صداع وحمى",
    "wellness.suggestion2": "ماذا يعني تحليل دمي؟",
    "wellness.suggestion3": "علاجات طبيعية للبرد والإنفلونزا",
    "wellness.suggestion4": "هل يمكنني تناول إيبوبروفين مع أسبرين؟",
    "wellness.save_profile": "حفظ في ملف TELsTP الخاص بي",
    "wellness.emergency_call": "اتصل بـ 123 — طوارئ مصر",
    "wellness.lab_paste": "الصق نتائج تحاليلك هنا...",
    "wellness.lab_interpret": "تفسير النتائج",
    "wellness.med_search": "ابحث عن اسم الدواء...",
    "wellness.consent_title": "الخصوصية والموافقة",
    "wellness.consent_text": "باستخدام هذا الذكاء الاصطناعي فإنك توافق على أن بياناتك تبقى مجهولة ولا يتم تخزينها للتدريب إلا إذا اخترت المشاركة في البحث (غير ربحي فقط).",
    "wellness.consent_agree": "أفهم وأوافق",

    "assist.title": "My-AssistAI",
    "assist.subtitle": "دعم القرارات السريرية",
    "assist.chat_placeholder": "صف الحالة السريرية أو السؤال...",
    "assist.tab_chat": "محادثة سريرية",
    "assist.tab_literature": "بحث في الأدبيات",
    "assist.tab_drugs": "مرجع الأدوية",
    "assist.tab_summary": "ملخص المريض",
    "assist.suggestion1": "التشخيص التفريقي لألم الصدر مع ضيق التنفس",
    "assist.suggestion2": "أحدث بروتوكولات علاج السكري من النوع الثاني",
    "assist.suggestion3": "تفاعلات ميتفورمين + ليسينوبريل",
    "assist.suggestion4": "إنشاء ملخص سريري من بيانات المريض",
    "assist.generate_cert": "إنشاء شهادة الاعتماد المشترك",
    "assist.literature_search": "ابحث في الأدبيات الطبية...",
    "assist.drug_search": "ابحث عن اسم الدواء أو التفاعل...",
    "assist.patient_data": "أدخل بيانات المريض للملخص...",
    "assist.generate_summary": "إنشاء الملخص",
    "assist.moh_toggle": "تضمين إرشادات وزارة الصحة المصرية",
    "assist.accreditation_level": "مستوى الاعتماد",

    "common.send": "إرسال",
    "common.back": "العودة للرئيسية",
    "common.loading": "جارٍ التفكير...",
    "common.disclaimer": "⚕️ هذه إرشادات ذكاء اصطناعي فقط — وليست تشخيصًا. اطلب الرعاية المهنية في حالات الطوارئ.",
    "common.dark_mode": "الوضع الداكن",
    "common.light_mode": "الوضع الفاتح",
    "common.language": "English",
    "common.privacy_policy": "سياسة الخصوصية",
    "common.terms": "شروط الخدمة",
    "common.new_chat": "محادثة جديدة",
    "common.language_next": "English",
    "chat.upload_hint": "ارفع تقرير المختبر (PDF/صورة) واطلب التفسير",
    "chat.lab_received": "تم استلام تقرير المختبر — يتم التحليل...",
  },
  zh: {
    "hub.title": "TELsTP 远程医疗中心",
    "hub.subtitle": "由人工智能构建 • 服务全人类",
    "hub.wellness_portal": "My-WellnessAI",
    "hub.wellness_desc": "为所有人提供的 AI 健康指导",
    "hub.assist_portal": "My-AssistAI",
    "hub.assist_desc": "面向医疗专业人员的临床决策支持",
    "hub.enter_portal": "进入门户",
    "hub.disclaimer_title": "医疗免责声明",
    "hub.disclaimer_text": "本平台仅提供 AI 生成的指导,而非医疗诊断。请始终咨询合格的医疗专业人员。紧急情况请立即拨打当地急救电话。",

    "wellness.title": "My-WellnessAI",
    "wellness.subtitle": "您的 AI 健康伙伴",
    "wellness.chat_placeholder": "描述您的症状或健康问题...",
    "wellness.tab_chat": "健康聊天",
    "wellness.tab_lab": "化验解读",
    "wellness.tab_meds": "药品信息",
    "wellness.triage_title": "您感觉如何?",
    "wellness.triage_mild": "轻微",
    "wellness.triage_moderate": "中度",
    "wellness.triage_severe": "严重 / 紧急",
    "wellness.suggestion1": "我头痛并发烧",
    "wellness.suggestion2": "我的血液检验结果意味着什么?",
    "wellness.suggestion3": "感冒和流感的天然疗法",
    "wellness.suggestion4": "我可以同时服用布洛芬和阿司匹林吗?",
    "wellness.lab_paste": "在此粘贴您的化验结果...",
    "wellness.lab_interpret": "解读结果",
    "wellness.med_search": "搜索药品名称...",
    "wellness.consent_title": "隐私与同意",
    "wellness.consent_text": "使用本 AI 即表示您同意数据保持匿名,除非您选择参与研究(仅限非营利)。",
    "wellness.consent_agree": "我理解并同意",

    "assist.title": "My-AssistAI",
    "assist.subtitle": "临床决策支持",
    "assist.chat_placeholder": "描述临床病例或问题...",
    "assist.tab_chat": "临床聊天",
    "assist.tab_literature": "文献检索",
    "assist.tab_drugs": "药品参考",
    "assist.tab_summary": "患者摘要",
    "assist.suggestion1": "胸痛伴呼吸困难的鉴别诊断",
    "assist.suggestion2": "2 型糖尿病的最新治疗方案",
    "assist.suggestion3": "二甲双胍 + 赖诺普利的药物相互作用",
    "assist.suggestion4": "从患者数据生成临床摘要",
    "assist.generate_cert": "生成共同认证证书",
    "assist.literature_search": "搜索医学文献...",
    "assist.drug_search": "搜索药品名称或相互作用...",
    "assist.patient_data": "输入患者数据以生成摘要...",
    "assist.generate_summary": "生成摘要",
    "assist.moh_toggle": "包含埃及卫生部指南",

    "common.send": "发送",
    "common.back": "返回首页",
    "common.loading": "思考中...",
    "common.disclaimer": "⚕️ 这仅为 AI 指导 — 而非诊断。紧急情况请寻求专业护理。",
    "common.language": "English",
    "common.language_next": "العربية",
    "common.privacy_policy": "隐私政策",
    "common.terms": "服务条款",
    "common.new_chat": "新对话",
    "chat.upload_hint": "上传化验报告(PDF/图片)并请求解读",
    "chat.lab_received": "已收到化验报告 — 正在分析...",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("telstp-lang");
    if (saved === "ar" || saved === "zh" || saved === "en") return saved as Language;
    return "en";
  });

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRtl = language === "ar";

  useEffect(() => {
    localStorage.setItem("telstp-lang", language);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

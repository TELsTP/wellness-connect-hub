# 🏥 TELsTP Telemedicine Hub — MVP

> **Built by AI • For Humanity** — Democratizing accredited AI-powered care in MENA and beyond.

A non-profit AI-powered telemedicine platform serving patients and healthcare professionals in Egypt and underserved regions worldwide.

## 🌟 Overview

The TELsTP Telemedicine Hub is the first live pillar of the **TELsTP Cognitive Ecosystem** (Health-Tech & Telemedicine platform). It provides two dedicated portals:

- **My-WellnessAI** — Patient-facing AI health companion with symptom assessment, lab interpretation, and medication guidance
- **My-AssistAI** — Doctor-facing clinical decision support with differential diagnosis, literature search, and patient summary generation

## 🏗️ Architecture

```
src/
├── components/
│   ├── shared/           # Shared components (ChatInterface, Disclaimers, etc.)
│   └── ui/               # shadcn/ui component library
├── contexts/
│   └── LanguageContext.tsx  # Bilingual (EN/AR) with RTL support
├── pages/
│   ├── Index.tsx          # Hub Landing Page
│   ├── WellnessPortal.tsx # My-WellnessAI (Patient Portal)
│   ├── AssistPortal.tsx   # My-AssistAI (Doctor Portal)
│   └── PrivacyPolicy.tsx  # Privacy & Compliance
├── telstp-ecosystem/      # OmniCognitor integration hooks
│   ├── hooks.ts           # Future hub integration points
│   └── README.md          # Integration documentation
└── App.tsx                # Router & providers
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🔐 Compliance & Safety

- **HIPAA-compliant design** — No personal health information (PHI) stored
- **Egyptian Data Protection Law (151/2020)** — Full compliance
- **Anonymous access** — No user accounts required
- **Medical disclaimers** — Every page and every AI response includes appropriate disclaimers
- **Emergency detection** — AI flags urgent symptoms and directs to Egypt emergency services (123)

## 🌐 Bilingual Support

Full Arabic + English support with RTL layout. Language toggle available on all pages.

## 🤖 AI Features

### Patient Portal (My-WellnessAI)
- Symptom assessment with severity triage (mild/moderate/severe)
- Lab report interpreter
- Medication information with interaction checking
- Emergency symptom detection

### Doctor Portal (My-AssistAI)
- Differential diagnosis with probability ranking
- Treatment protocol references (AHA, ESC, ADA, WHO)
- Drug reference and interaction analysis
- Patient summary generator
- Egyptian MOH guidelines toggle
- Co-Accreditation certificate generation

## 📋 Future Integration

### OmniCognitor Ecosystem
Integration hooks are prepared in `src/telstp-ecosystem/` for:
- **Hub 5**: Clinical Trial Matching
- **Hub 7**: Precision Medicine
- **12-Hub Router**: Unified navigation across TELsTP ecosystem

### Firebase Integration
The codebase is structured for export to Firebase:
- Components are modular and portable
- AI edge functions can be migrated to Firebase Cloud Functions
- Static assets work with Firebase Hosting

## 📄 License

Non-profit open-source — TELsTP Project

---

*🏅 Powered by TELsTP AI Co-Accreditation Framework*

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

## Live Multimedia Consultation (Phase 1)

The `/call/:roomId` route hosts a WebRTC two-way audio + video room between a patient (WellnessAI side) and a clinician (AssistAI side). Signaling rides on Supabase Realtime (`call:<roomId>` channel). STUN servers are Google public; TURN is out of scope for v1.

### AI Deputy (always-on)
Every room is opened with `ai_deputy_active = true`. The patient's audio is sliced into 15s chunks, transcribed via the existing `voice-transcribe` edge function, and each patient turn triggers `call-deputy`. When a clinician is present the deputy operates as a silent scribe; when none has joined, the deputy speaks acknowledgements aloud via the browser TTS and gathers a structured history. At the end of the call, `encounter-finalize` writes a SOAP note to the `encounters` table for the doctor to review.

### Anura / NuraLogix vitals — Phase 2
The `vitals_readings` table is shaped for Anura DeepAffex output (HR, HRV, SpO₂, BP, stress, facial-age estimate, BMI estimate, hemoglobin estimate, skin tone ITA, wrinkle score, raw payload). `src/lib/vitals/anura.ts` is the adapter stub — it intentionally throws `NotConfiguredError` so no mock numbers ever reach the UI. To wire it in:

1. Sign the commercial agreement with NuraLogix.
2. Add `ANURA_LICENSE_KEY` via the secrets tool.
3. Replace `captureVitals()` with the SDK call and map the response to `VitalsReading` (column names already match).
4. Insert into `vitals_readings` with the active `room_id`.

### Architect note — wearable backbone (Phase 2)
Per Mohamed Ayoub: pave the way for wearable integration so vitals can be fetched in the background and rendered to both patient and practitioner, then folded into the initial session report by My-AssistAI. The `source` column already accepts `'wearable'` so a second adapter can sit alongside Anura without schema changes.

### Out of scope for Phase 1
- TURN server for strict-NAT mobile networks
- Multi-party calls (resident + attending) via SFU
- E2EE on the media channel
- Server-side recording storage bucket (recordings download client-side for now)

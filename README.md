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

## 📊 Live vitals — Phase 2 status

Real, no-mock vitals are wired in `src/lib/vitals/bluetooth.ts` and surfaced in
`VitalsPanel` inside the live call. Two sources are live today:

1. **BLE heart-rate strap** — any standards-compliant sensor that exposes the
   Bluetooth SIG Heart Rate Service (`0x180D`) works without per-vendor code:
   Polar H10/H9, Wahoo Tickr, Garmin HRM-Dual, Coros, Suunto, etc. RR-interval
   notifications are aggregated into an SDNN HRV value over a rolling 60-second
   window and written to `vitals_readings` every 5 s (broadcast every beat so
   the clinician sees the live trace).
2. **Self-reported cuff / oximeter** — explicit `source = 'self-report'` rows
   so they are never confused with sensor data downstream.

Browser support: Web Bluetooth ships in Chromium-based browsers on Android and
desktop. iOS Safari is not supported; iPhone users need the (planned)
Capacitor wrapper with `@capacitor-community/bluetooth-le`, or a BLE bridge
app such as Bluefy. The panel detects support and renders a clear notice when
the API is unavailable — it never falls back to mock data.

### Next slots (kept open in `vitals_readings`)
- **Pulse Oximeter Service (`0x1822`)** → `spo2_pct`
- **Blood Pressure Service (`0x1810`)** → `bp_systolic` / `bp_diastolic`
- **Health Thermometer (`0x1809`)** → temperature
- **Anura / NuraLogix DeepAffex camera vitals** — adapter scaffold in
  `src/lib/vitals/anura.ts`. Throws `NotConfiguredError` until the license
  key arrives; UI hides the panel rather than fake numbers.
- **Apple Health / Google Fit / Fitbit / Garmin Connect** — best handled
  inside the Capacitor mobile wrapper using each platform's HealthKit /
  Health Connect bridge. Tracked for the native build.

## 🛰️ TURN / coturn (NAT traversal)

The signaling layer reads three optional env vars at build time:

```bash
VITE_TURN_URL=turn:turn.telstp.org:3478?transport=udp
VITE_TURN_USERNAME=...   # time-limited HMAC username
VITE_TURN_PASSWORD=...   # time-limited HMAC password
```

When unset the call uses Google STUN only (works on most consumer NATs, fails
on strict CG-NAT mobile carriers). Recommended self-hosted setup:

```bash
# Ubuntu 22.04 reference
sudo apt install coturn
# /etc/turnserver.conf — minimal hardened config:
listening-port=3478
tls-listening-port=5349
fingerprint
use-auth-secret
static-auth-secret=<rotate-monthly>
realm=telstp.org
total-quota=200
stale-nonce=600
cert=/etc/letsencrypt/live/turn.telstp.org/fullchain.pem
pkey=/etc/letsencrypt/live/turn.telstp.org/privkey.pem
no-multicast-peers
no-cli
```

For production, mint per-session ephemeral credentials from an edge function
(TURN REST API time-limited credential pattern) instead of baking the secret
into the client.

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

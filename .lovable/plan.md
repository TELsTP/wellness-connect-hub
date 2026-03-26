# 🏥 TELsTP Telemedicine Hub — MVP

A non-profit AI-powered telemedicine platform serving patients and healthcare professionals, with two dedicated portals accessible from a unified hub.  Built as the first live pillar of the TELsTP Cognitive Ecosystem (Health-Tech & Telemedicine platform), powered by Supabase as the backend.

Supabase Project Details (use these exact credentials):

Project URL: [https://dbrxrhjveezxtfwvialj.supabase.co](https://dbrxrhjveezxtfwvialj.supabase.co)

Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRicnhyaGp2ZWV6eHRmd3ZpYWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTE3NTIsImV4cCI6MjA4OTc2Nzc1Mn0.rMOeeYR_2pHCypYm4gISqHkeV7ZxW8_ReTQC12uBWjM

Direct DB connection string: postgresql://postgres:[qKLnbv9B5ErqNumy@db.dbrxrhjveezxtfwvialj.supabase.co:5432](mailto:qKLnbv9B5ErqNumy@db.dbrxrhjveezxtfwvialj.supabase.co:5432)/postgres

Project name in Supabase: telstp-unity (Omnicognitor backend)

Core Requirements:

Lovable React/Vite web app

Supabase for Auth, Database, Realtime, and Edge Functions

Bilingual (Arabic + English) with full RTL support

Anonymous-first access (no personal health data stored)

Export-ready modular codebase with clear hooks for future OmniCog integration

1. Hub Landing Page

Professional medical-themed landing page with the project’s mission statement (“Built by AI • For Humanity – Democratizing accredited AI-powered care in MENA and beyond”).

Clear navigation to two portals: My-WellnessAI (patients) and My-AssistAI (doctors).

Arabic + English language toggle (RTL support).

HIPAA-style + Egyptian Personal Data Protection Law (Law 151 of 2020) compliant disclaimer banner.

Features overview, statistics, and “How it works” section.

Visible “Powered by TELsTP AI Co-Accreditation” badge/footer note linking to the full research report summary.

“Our Impact” counter (placeholder): “78% global AI adoption gap closed in MENA”.

Contact/About section for the non-profit organization.

2. My-WellnessAI Portal (Patient-Facing)

Inspired by [DocAI.live](http://DocAI.live)’s clean, approachable design.

AI Wellness Chat — conversational interface where users describe symptoms and receive guidance including AI-generated possibilities for discussion with your doctor, home remedies, when to seek emergency care, and wellness tips.

Symptom severity triage flow at the start of every chat (mild / moderate / severe).

Lab Report Interpreter — upload or paste lab results, get plain-language explanations.

Medication & Wellness Info — drug interaction checks, dosage guidance, natural remedies.

Medical Disclaimer prominently displayed on every page and in every AI response: “This is guidance only, not a diagnosis. Seek professional care for emergencies.”

Suggested symptom prompts for easy onboarding.

Bilingual support (Arabic/English) with RTL layout.

“Save to My TELsTP Profile” button after lab or medication sessions (uses local storage for MVP, seeds unified memory).

Emergency detection with one-tap “Call 123” (Egypt ambulance) or nearest hospital locator.

3. My-AssistAI Portal (Doctor-Facing)

Inspired by [Medcol.io](http://Medcol.io)’s clinical, professional design (dark/light theme).

Clinical Decision Support Chat — AI assistant for differential diagnosis, treatment protocols, and clinical reasoning.

Medical Literature Search — AI-powered search referencing standard medical protocols, SOPs, Egyptian Ministry of Health guidelines (toggle), and clinical guidelines.

Drug Reference & Interactions — comprehensive medication database queries.

Patient Summary Generator — input patient data or pull anonymized case from WellnessAI (with consent) and get structured clinical summaries.

“Generate Co-Accreditation Certificate” button on every clinical response (one-click PDF showing AI accreditation level, domain, confidence score, and human-doctor override field).

Professional dark/light theme suitable for clinical environments.

4. AI Backend (Lovable AI + Supabase Edge Functions)

Supabase Edge Functions powering both portals with specialized medical system prompts.

Separate AI personas: empathetic wellness guide (patients) vs. clinical assistant (doctors).

Streaming responses for real-time chat experience.

Built-in medical knowledge via carefully crafted system prompts covering standard medical protocols, first aid, wellness guidance, and Egyptian Arabic medical terminology validation.

Shared memory layer between the two portals (session-based for MVP) so patient cases can feed into doctor portal with consent.

Inject accreditation metadata into every response (e.g. “This response is Level 2 Accredited — Clinical Reasoning domain”).

Clear disclaimers injected into every AI response.

Rate limit and error handling with user-friendly messages.

Explicit consent banner on first chat: “By using this AI you agree your data stays anonymous and is not stored for training unless you opt-in for research (non-profit only).”

5. Compliance & Safety Features

Medical disclaimer on every page and in every AI response.

Emergency detection: AI flags urgent symptoms and directs to emergency services with Egyptian local links.

No personal health data stored (anonymous access) — HIPAA-style + Egyptian Personal Data Protection Law compliant by design.

Cookie consent and privacy policy page.

All data stored in Supabase with Row Level Security enabled.

6. Export-Ready Structure

Clean, modular codebase organized by portal (wellness vs. clinical).

Components organized by portal (wellness vs. clinical).

Documentation of the AI edge function for Supabase Edge Functions.

Add a /telstp-ecosystem folder in the codebase with clear hooks for OmniCognitor auth and the 12-hub router (future integration points for Hub 5 – Clinical Trial Matching and Hub 7 – Precision Medicine).

Full Supabase client integration (auth, realtime, database) using the credentials above.

GitHub Repo Generation (Critical Final Step)

After building the full app, use the GitHub connector (activated on my Lovable profile #10+) to create a new repository on my dedicated GitHub account.

Repo name: telstp-telemedicine-hub-mvp

Include a complete [README.md](http://README.md) with:

Full project overview and Supabase credentials (redacted for security)

Folder structure documentation

Setup instructions for local development (Supabase + Lovable export)

How to run Supabase Edge Functions locally

Future OmniCog integration roadmap

License: Non-profit open-source (TELsTP)

Commit the entire clean codebase so I can pull it locally via Termux on mobile, continue development by hand, and deploy separately to Vercel later.

This is the exact blueprint-aligned MVP we need to ship first. Build it clean, make it beautiful, and make the Co-Accreditation certificate the star feature.
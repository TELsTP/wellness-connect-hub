# TELsTP Telemedicine Hub — roadmap

## In progress (live-call phase 3)
- [x] Real-time vitals charts + clinician summary (VitalsCharts)
- [x] Facial/skin assessment engine (ITA°, wrinkle, erythema, rPPG) — Anura-structure replication
- [x] Encounter timeline PDF (patient + doctor views)
- [ ] Skin scan capture panel wired into CallRoom
- [ ] AI deputy triage flow (symptoms + transcript + vitals → assessment)
- [ ] Media artifact storage bucket + uploads (frames, audio, recording, skin JSON)
- [ ] CI smoke tests + one-command e2e checklist

## Reviewed reference material
- lmNOTEBOOK archive (Sep 2026): TELsTP strategy, Tawasol hub plans, legacy Node/Mongo
  telemedicine blueprint. No stack change — current React/Vite + Supabase architecture stands.
  Ideas worth keeping for later: PWA offline mode for rural areas, SMS fallback,
  wearable integration (BLE already live), Arabic voice interface (already live).

## Later
- Anura/DeepAffex commercial SDK swap-in behind the same interface
- OmniCognitor unified auth + cross-hub memory

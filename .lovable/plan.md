# Telemed Live Call — Phase 1

Goal: turn the existing chat into a real two-way multimedia channel with an AI deputy that always attends, captures the encounter, and leaves a structured note for the doctor. Anura/NuraLogix camera-vitals stays a real (empty) schema for the next phase — no mock numbers anywhere in the UI.

## What ships now

1. **Live call room** at `/call/:roomId`
  - WebRTC peer-to-peer between patient (WellnessAI) and clinician (AssistAI)
  - Signaling via Supabase Realtime broadcast channel (no extra vendor)
  - Audio + video, mute / camera toggle / hang up, RTL-safe layout
  - Patient launches from WellnessPortal "Start live consult", clinician joins from AssistPortal "Live rooms" panel
2. **AI Deputy — always-on co-attendant**
  - On every room creation we open the room with `ai_deputy_active = true`
  - Patient's microphone is continuously chunked (15s segments) and streamed to `voice-transcribe`, transcripts appended live
  - After each patient turn, `assist-ai-persona` is invoked in "deputy" mode to produce: acknowledgement to patient (TTS via `speak.ts`), running SOAP note, red-flag check (reuses `parseEscalateMarker`)
  - If clinician is present, AI shows as silent scribe; if not, AI speaks the acknowledgements out loud and gathers history/assessment
3. **Encounter recording + AI summary**
  - `MediaRecorder` records the local tracks to a webm blob, uploaded to private Storage bucket `encounters/{roomId}/...`
  - Full transcript + AI SOAP note saved to `encounters` table
  - End-of-call view shows the SOAP note with a "Send to doctor for review" button (writes to `accreditation_logs`)
4. **Anura-ready vitals schema (no UI mocks)**
  - New table `vitals_readings` with columns mirroring Anura's documented outputs (heart_rate_bpm, hrv_sdnn_ms, resp_rate_bpm, spo2_pct, bp_systolic, bp_diastolic, stress_index, facial_age_estimate, bmi_estimate, hemoglobin_estimate, skin_tone_ita, wrinkle_score, raw_payload jsonb, source text default 'anura', confidence numeric)
  - Adapter file `src/lib/vitals/anura.ts` with a clean `captureVitals(): Promise<VitalsReading>` interface that currently throws `NotConfiguredError` — call site catches it and shows "Vitals capture not configured yet" instead of fake numbers
  - README section documents how to wire Anura SDK + the sample payload to seed once the developer shares real data

## Database changes (one migration)

- `rooms` (id, created_by_session, patient_session, clinician_session nullable, status, ai_deputy_active, started_at, ended_at)
- `encounters` (id, room_id fk, transcript jsonb, soap_note text, recording_path text, summary_sent_at, created_at)
- `vitals_readings` (id, room_id fk nullable, session_id text, captured_at, + Anura fields above, raw_payload jsonb)
- All three: `GRANT` for `anon` (anonymous-first project), `service_role` ALL, RLS enabled with session-id-scoped policies matching existing `chats` table pattern
- Private storage bucket `encounters` with RLS allowing edge-function writes only

## Files

New:

- `src/pages/CallRoom.tsx` — WebRTC UI
- `src/lib/webrtc/signaling.ts` — Realtime offer/answer/ICE
- `src/lib/webrtc/recorder.ts` — MediaRecorder → Storage uploader (via edge fn)
- `src/lib/vitals/anura.ts` — adapter stub (real interface, no fake values)
- `src/components/shared/LiveCallLauncher.tsx` — buttons added to both portals
- `supabase/functions/call-deputy/index.ts` — orchestrates transcript→AI→TTS per turn
- `supabase/functions/encounter-finalize/index.ts` — uploads recording, writes SOAP, logs accreditation

Edited:

- `src/pages/WellnessPortal.tsx` and `src/pages/AssistPortal.tsx` — launcher button
- `src/App.tsx` — `/call/:roomId` route
- `README.md` — Phase-2 Anura integration notes

## Technical notes

- WebRTC uses Google's public STUN servers; no TURN needed for v1 (most consumer NATs work). Add TURN in phase 2 when we test on Egyptian mobile networks.
- Transcription chunks are 15s WAV slices; on Safari we fall back to `audio/mp4`. Reuses existing `voice-transcribe` function.
- The AI deputy runs in the browser tab that hosts the patient — if the patient closes the tab the deputy stops, which matches the consent model (no server-side recording without an active session).
- No PHI persisted beyond session id; recording bucket is private and signed-URL only for the clinician that joins that room.

## Out of scope (next phase, tracked in README)

- Anura SDK integration + live vitals overlay
- TURN server for strict NAT traversal
- Multi-party (3+) calls via SFU (LiveKit) if needed for resident + attending
- E2EE on the media channel.   " Note from the lead architect Mohamed ayoub 3M.  It's with a smart start if we pave the way for the wearable integration to read and connector a real-time fetch of the patients on back ground , a process automatically takes place by the My Assist AI and display it to both the patient and the practitioner or in a reported format compelling the initial report of the session. " ". 
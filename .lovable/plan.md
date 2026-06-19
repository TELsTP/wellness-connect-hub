
# AI Deputization Bridge — WellnessAI ↔ AssistAI

A live, bidirectional channel so the two AIs can hand off cases, share the patient briefing + full transcript, and keep talking to each other (and to both human users) in real time.

## Core constraint honored
Per your standing rule, **no new database tables**. The bridge reuses the existing `chats` table with a dedicated `portal_type = 'bridge'` and a shared `session_id` (`bridge-<shortId>`). Realtime on `chats` carries the two-way stream.

## What you'll see

1. **Manual handoff button** in both `MultimediaChat` toolbars:
   - WellnessAI chat → "🩺 Deputize to AssistAI"
   - AssistAI chat → "💚 Refer to WellnessAI"
2. **Auto-escalation** — when the responding AI detects a red flag (critical lab, emergency symptom, complex radiology), its edge function returns `escalate: true` and the UI auto-opens the bridge with a pre-filled briefing.
3. **Bridge panel** (slide-over sheet) on both portals:
   - Header: case ID, both session IDs, language, accreditation level
   - Briefing card (chief complaint, key findings, flagged labs/imaging)
   - Full transcript snapshot (collapsed by default)
   - Live thread where messages from the other side appear via Supabase Realtime
   - Composer where the local user can post; the *opposite AI* auto-replies in the same thread
4. **Notification badge** on the portal header when a new bridge message arrives while the panel is closed.

## How a handoff flows

```text
WellnessAI session (patient)
        │  red flag OR button click
        ▼
[ai-deputize edge fn]
  ├─ creates chats row: session_id=bridge-xyz, portal_type='bridge'
  │     payload = { briefing, transcript, fromPortal, language }
  ├─ links both sessions in accreditation_logs (audit)
  └─ returns bridgeId
        │
        ▼
Both portals open Bridge Panel for bridge-xyz
        │
        ▼
Supabase Realtime on chats (filter: session_id=bridge-xyz)
   ├─ WellnessAI side posts  ──► AssistAI auto-replies via assist-ai-persona
   └─ AssistAI side posts    ──► WellnessAI auto-replies via wellness-ai-persona
```

Each AI reply uses the full bridge transcript as context, so both sides stay in sync.

## Files touched

**New**
- `supabase/functions/ai-deputize/index.ts` — creates the bridge record, builds the briefing, calls Lovable AI Gateway once to synthesize a structured handoff summary (markdown), writes audit row to `accreditation_logs`.
- `src/components/shared/BridgePanel.tsx` — slide-over Sheet with briefing, transcript, live thread, composer.
- `src/hooks/useBridge.ts` — Realtime subscription, send-message helper, opposite-AI reply trigger.
- `src/lib/redFlags.ts` — small regex/keyword scanner used as a client-side fallback when the model didn't emit `[[ESCALATE]]`.

**Edited**
- `supabase/functions/wellness-ai-persona/index.ts` — system prompt gains rule: if you detect emergency / critical lab / out-of-scope clinical, end response with `\n\n[[ESCALATE:reason]]`. Response JSON includes `escalate` + `escalateReason`.
- `supabase/functions/assist-ai-persona/index.ts` — same pattern, escalates *toward wellness* for patient-facing follow-up (rehab advice, lifestyle, language-localized explanation).
- `src/components/shared/MultimediaChat.tsx` — adds a "Deputize" button next to "New chat" (color matches `accentColor`), wired via a new `onDeputize?` prop.
- `src/pages/WellnessPortal.tsx` & `src/pages/AssistPortal.tsx` — wire `onDeputize`, mount `<BridgePanel/>`, auto-open it when `data.escalate === true`.

## Migration (Realtime only — no new tables)

```sql
-- Enable Realtime stream on the existing chats table
ALTER TABLE public.chats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
```

RLS on `chats` already permits anon read/write for bridge rows (existing 4 policies cover it). No grants change.

## Bridge message shape (stored in `chats.messages` jsonb)

```jsonc
[
  { "role": "system", "kind": "briefing",  "from": "wellness", "content": "..." },
  { "role": "system", "kind": "transcript","from": "wellness", "content": [/* original UIMessages */] },
  { "role": "user",   "from": "wellness-human", "content": "Quick question for AssistAI..." },
  { "role": "assistant", "from": "assist-ai",   "content": "Per ESC 2024 ..." },
  { "role": "user",   "from": "assist-human",   "content": "Patient also reports..." },
  { "role": "assistant","from": "wellness-ai",  "content": "Localized explanation in AR..." }
]
```

`from` distinguishes the four participants so the panel can render avatars + colors and so each AI knows whose turn it is.

## Deferred / not in this pass
- Voice/screen-share *inside* the bridge (current scope is text + briefing + media URLs already in transcript).
- Cross-language auto-translation of bridge messages (each AI already responds in the user's language; we'll leave translation to the receiving AI).
- A "close case" workflow with co-accreditation cert — easy follow-up once the bridge is stable.

Approve and I'll implement, redeploy both edge functions plus the new `ai-deputize`, and verify the Realtime channel end-to-end.

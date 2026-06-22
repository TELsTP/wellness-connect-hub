
-- 1. rooms
CREATE TABLE public.rooms (
  id text PRIMARY KEY,
  created_by_session text NOT NULL,
  patient_session text,
  clinician_session text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','active','ended')),
  ai_deputy_active boolean NOT NULL DEFAULT true,
  language text DEFAULT 'en',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_anon_read" ON public.rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "rooms_anon_insert" ON public.rooms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "rooms_anon_update" ON public.rooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. encounters
CREATE TABLE public.encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  soap_note text,
  recording_path text,
  summary_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.encounters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encounters TO authenticated;
GRANT ALL ON public.encounters TO service_role;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "encounters_anon_read" ON public.encounters FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "encounters_anon_insert" ON public.encounters FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "encounters_anon_update" ON public.encounters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. vitals_readings (Anura-shaped; populated only with real data)
CREATE TABLE public.vitals_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text REFERENCES public.rooms(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  source text NOT NULL DEFAULT 'anura',
  captured_at timestamptz NOT NULL DEFAULT now(),
  confidence numeric,
  heart_rate_bpm numeric,
  hrv_sdnn_ms numeric,
  resp_rate_bpm numeric,
  spo2_pct numeric,
  bp_systolic numeric,
  bp_diastolic numeric,
  stress_index numeric,
  facial_age_estimate numeric,
  bmi_estimate numeric,
  hemoglobin_estimate numeric,
  skin_tone_ita numeric,
  wrinkle_score numeric,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.vitals_readings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vitals_readings TO authenticated;
GRANT ALL ON public.vitals_readings TO service_role;
ALTER TABLE public.vitals_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vitals_anon_read" ON public.vitals_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "vitals_anon_insert" ON public.vitals_readings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. updated_at triggers (reuse pattern)
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER rooms_touch BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER encounters_touch BEFORE UPDATE ON public.encounters FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.encounters;


-- =========================================================
-- 1. SECRET-BEARING TABLES — service_role only
-- =========================================================

-- neural_agents contains mistral_api_key
DROP POLICY IF EXISTS "Allow full access to neural_agents" ON public.neural_agents;
REVOKE ALL ON public.neural_agents FROM anon, authenticated, public;
GRANT ALL ON public.neural_agents TO service_role;
CREATE POLICY "neural_agents service only" ON public.neural_agents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- crm_calendars contains google_refresh_token
DROP POLICY IF EXISTS "CRM calendars deletable" ON public.crm_calendars;
DROP POLICY IF EXISTS "CRM calendars insertable" ON public.crm_calendars;
DROP POLICY IF EXISTS "CRM calendars readable" ON public.crm_calendars;
DROP POLICY IF EXISTS "CRM calendars updatable" ON public.crm_calendars;
REVOKE ALL ON public.crm_calendars FROM anon, authenticated, public;
GRANT ALL ON public.crm_calendars TO service_role;
CREATE POLICY "crm_calendars service only" ON public.crm_calendars
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- crm_calendly_connections — already locked but ensure grants
REVOKE ALL ON public.crm_calendly_connections FROM anon, authenticated, public;
GRANT ALL ON public.crm_calendly_connections TO service_role;

-- =========================================================
-- 2. CRM OPERATIONAL TABLES — authenticated staff only
-- =========================================================

-- crm_contacts
DROP POLICY IF EXISTS "CRM contacts deletable" ON public.crm_contacts;
DROP POLICY IF EXISTS "CRM contacts insertable" ON public.crm_contacts;
DROP POLICY IF EXISTS "CRM contacts readable" ON public.crm_contacts;
DROP POLICY IF EXISTS "CRM contacts updatable" ON public.crm_contacts;
REVOKE ALL ON public.crm_contacts FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_contacts TO authenticated;
GRANT ALL ON public.crm_contacts TO service_role;
CREATE POLICY "crm_contacts authenticated full" ON public.crm_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- crm_appointments
DROP POLICY IF EXISTS "CRM appointments deletable" ON public.crm_appointments;
DROP POLICY IF EXISTS "CRM appointments insertable" ON public.crm_appointments;
DROP POLICY IF EXISTS "CRM appointments readable" ON public.crm_appointments;
DROP POLICY IF EXISTS "CRM appointments updatable" ON public.crm_appointments;
REVOKE ALL ON public.crm_appointments FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_appointments TO authenticated;
GRANT ALL ON public.crm_appointments TO service_role;
CREATE POLICY "crm_appointments authenticated full" ON public.crm_appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- crm_campaigns
DROP POLICY IF EXISTS "CRM campaigns deletable" ON public.crm_campaigns;
DROP POLICY IF EXISTS "CRM campaigns insertable" ON public.crm_campaigns;
DROP POLICY IF EXISTS "CRM campaigns readable" ON public.crm_campaigns;
DROP POLICY IF EXISTS "CRM campaigns updatable" ON public.crm_campaigns;
REVOKE ALL ON public.crm_campaigns FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_campaigns TO authenticated;
GRANT ALL ON public.crm_campaigns TO service_role;
CREATE POLICY "crm_campaigns authenticated full" ON public.crm_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- crm_flow_step_queue
DROP POLICY IF EXISTS "CRM flow queue deletable" ON public.crm_flow_step_queue;
DROP POLICY IF EXISTS "CRM flow queue insertable" ON public.crm_flow_step_queue;
DROP POLICY IF EXISTS "CRM flow queue readable" ON public.crm_flow_step_queue;
DROP POLICY IF EXISTS "CRM flow queue updatable" ON public.crm_flow_step_queue;
REVOKE ALL ON public.crm_flow_step_queue FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_flow_step_queue TO authenticated;
GRANT ALL ON public.crm_flow_step_queue TO service_role;
CREATE POLICY "crm_flow_queue authenticated full" ON public.crm_flow_step_queue
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- 3. PROFILES — fix role escalation + drop bypassable arch policy
-- =========================================================

DROP POLICY IF EXISTS "Allow full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Architect can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
-- keep "Users can read own profile" and "Users can update own profile."
REVOKE ALL ON public.profiles FROM anon, public;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Prevent users from changing their own role column via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role column cannot be modified by users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (current_setting('role', true) <> 'service_role')
  EXECUTE FUNCTION public.prevent_profile_role_change();

-- =========================================================
-- 4. ARCHITECT HANDSHAKES & MASTER LOGS
-- =========================================================

DROP POLICY IF EXISTS "Allow full access to architect_handshakes" ON public.architect_handshakes;
DROP POLICY IF EXISTS "Allow anonymous select on architect_handshakes" ON public.architect_handshakes;
DROP POLICY IF EXISTS "Architect can read handshakes" ON public.architect_handshakes;
DROP POLICY IF EXISTS "Anyone can insert handshake" ON public.architect_handshakes;
-- keep "Allow anonymous insert to architect_handshakes" (anon INSERT WITH CHECK true)
-- keep "Handshakes viewable by self." and "Users can create handshakes."
REVOKE ALL ON public.architect_handshakes FROM public;
REVOKE SELECT ON public.architect_handshakes FROM anon;
GRANT INSERT ON public.architect_handshakes TO anon;
GRANT SELECT, INSERT ON public.architect_handshakes TO authenticated;
GRANT ALL ON public.architect_handshakes TO service_role;

DROP POLICY IF EXISTS "Allow full access to master logs" ON public.architect_master_logs;
REVOKE ALL ON public.architect_master_logs FROM anon, authenticated, public;
GRANT ALL ON public.architect_master_logs TO service_role;
CREATE POLICY "architect_master_logs service only" ON public.architect_master_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========================================================
-- 5. CLINICAL TABLES — appointments, health_records
-- =========================================================

DROP POLICY IF EXISTS "Allow full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
REVOKE ALL ON public.appointments FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
CREATE POLICY "appointments patient self read" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "appointments patient self write" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "appointments doctor update" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = doctor_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Allow full access to health_records" ON public.health_records;
REVOKE ALL ON public.health_records FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_records TO authenticated;
GRANT ALL ON public.health_records TO service_role;
CREATE POLICY "health_records patient self read" ON public.health_records
  FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "health_records patient self insert" ON public.health_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);

-- Remove from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.appointments;
ALTER PUBLICATION supabase_realtime DROP TABLE public.health_records;

-- =========================================================
-- 6. AI MEMORY TABLES — backend only
-- =========================================================

DROP POLICY IF EXISTS "Allow full access to unified_memory" ON public.unified_memory;
REVOKE ALL ON public.unified_memory FROM anon, authenticated, public;
GRANT ALL ON public.unified_memory TO service_role;
CREATE POLICY "unified_memory service only" ON public.unified_memory
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to omnicog_memory" ON public.omnicog_memory;
DROP POLICY IF EXISTS "Anyone can insert/update memory." ON public.omnicog_memory;
DROP POLICY IF EXISTS "Architect updates memory" ON public.omnicog_memory;
DROP POLICY IF EXISTS "Architect writes memory" ON public.omnicog_memory;
DROP POLICY IF EXISTS "Memory is viewable by everyone." ON public.omnicog_memory;
DROP POLICY IF EXISTS "Public discovery feed" ON public.omnicog_memory;
REVOKE ALL ON public.omnicog_memory FROM anon, public;
GRANT SELECT ON public.omnicog_memory TO authenticated;
GRANT ALL ON public.omnicog_memory TO service_role;
CREATE POLICY "omnicog_memory auth read" ON public.omnicog_memory
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "omnicog_memory service write" ON public.omnicog_memory
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =========================================================
-- 7. PMO TABLES
-- =========================================================

DROP POLICY IF EXISTS "Public read access for sync records" ON public.pmo_sync_records;
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.pmo_sync_records;
REVOKE ALL ON public.pmo_sync_records FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pmo_sync_records TO authenticated;
GRANT ALL ON public.pmo_sync_records TO service_role;
CREATE POLICY "pmo_sync_records authenticated full" ON public.pmo_sync_records
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

REVOKE ALL ON public.pmo_members FROM anon, public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pmo_members TO authenticated;
GRANT ALL ON public.pmo_members TO service_role;
ALTER TABLE public.pmo_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pmo_members authenticated read" ON public.pmo_members;
CREATE POLICY "pmo_members authenticated read" ON public.pmo_members
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "pmo_members service write" ON public.pmo_members;
CREATE POLICY "pmo_members service write" ON public.pmo_members
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Remove pmo_members from realtime to prevent broadcast of email/phone
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime DROP TABLE public.pmo_members; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- =========================================================
-- 8. DB HELPER FUNCTIONS — revoke from public/auth
-- =========================================================

REVOKE ALL ON FUNCTION public.create_table_dynamic(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.drop_table_safe(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_all_tables() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_table_schema(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_table_statistics(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_rls_policies(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_all_triggers(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- =========================================================
-- 9. FUNCTION SEARCH PATHS
-- =========================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.omnicog_memory_sync_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.content IS NULL THEN NEW.content := NEW.memory_data; END IF;
  NEW.updated_at := NOW();
  IF NEW.created_at IS NULL THEN NEW.created_at := NOW(); END IF;
  RETURN NEW;
END;
$$;

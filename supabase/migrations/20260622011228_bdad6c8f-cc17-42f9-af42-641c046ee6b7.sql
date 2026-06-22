
DROP POLICY IF EXISTS "Authenticated users manage lab registry" ON public.lab_registry;
REVOKE ALL ON public.lab_registry FROM anon, authenticated, public;
GRANT ALL ON public.lab_registry TO service_role;
CREATE POLICY "lab_registry service only" ON public.lab_registry
  FOR ALL TO service_role USING (true) WITH CHECK (true);

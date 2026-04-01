
-- Allow anonymous inserts to architect_handshakes
CREATE POLICY "Allow anonymous insert to architect_handshakes"
ON public.architect_handshakes
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous select on architect_handshakes
CREATE POLICY "Allow anonymous select on architect_handshakes"
ON public.architect_handshakes
FOR SELECT
TO anon
USING (true);

-- Allow anonymous inserts to chats
CREATE POLICY "Allow anonymous insert to chats"
ON public.chats
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous upsert (update) to chats by session_id
CREATE POLICY "Allow anonymous update to chats"
ON public.chats
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Allow anonymous inserts to accreditation_logs
CREATE POLICY "Allow anonymous insert to accreditation_logs"
ON public.accreditation_logs
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous select on accreditation_logs
CREATE POLICY "Allow anonymous select on accreditation_logs"
ON public.accreditation_logs
FOR SELECT
TO anon
USING (true);

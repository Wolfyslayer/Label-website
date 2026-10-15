-- Contact submissions: do not allow anonymous INSERT via anon key (bypasses app rate limit / honeypot).
-- The Next.js contact API uses the service role, which bypasses RLS.

drop policy if exists "Service insert contact" on public.contact_submissions;

-- No INSERT policy for authenticated/anon roles → direct client inserts denied.
-- Service role (server) continues to insert via API route.

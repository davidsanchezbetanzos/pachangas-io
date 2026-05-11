-- Fix RLS policies for anonymous users
-- First disable all existing policies
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;
DROP POLICY IF EXISTS "Creator can update match" ON public.matches;
DROP POLICY IF EXISTS "Anyone can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Anyone can insert players" ON public.players;
DROP POLICY IF EXISTS "Player can update own record" ON public.players;
DROP POLICY IF EXISTS "Player can delete own record" ON public.players;

-- Allow all operations (we can tighten later)
CREATE POLICY "allow_all_matches" ON public.matches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_players" ON public.players
  FOR ALL USING (true) WITH CHECK (true);
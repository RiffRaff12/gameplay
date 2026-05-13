-- Enable RLS on all tables and restrict to the owning user.
-- Tables are created in later migrations; RLS is added here as a pattern
-- so every subsequent migration inherits the same policy structure.

-- players
ALTER TABLE IF EXISTS players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_all" ON players;
CREATE POLICY "owner_all" ON players
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- sessions
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_all" ON sessions;
CREATE POLICY "owner_all" ON sessions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- session_players
ALTER TABLE IF EXISTS session_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_all" ON session_players;
CREATE POLICY "owner_all" ON session_players
  USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE id = session_players.session_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM sessions WHERE id = session_players.session_id)
  );

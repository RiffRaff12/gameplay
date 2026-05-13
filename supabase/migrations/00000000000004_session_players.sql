-- Create session_players table
CREATE TABLE IF NOT EXISTS session_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'free', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, player_id)
);

-- Enable RLS
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;

-- Owner policy: user must own the session
CREATE POLICY "Session owner can manage roster"
  ON session_players
  FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM sessions WHERE id = session_players.session_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM sessions WHERE id = session_players.session_id)
  );

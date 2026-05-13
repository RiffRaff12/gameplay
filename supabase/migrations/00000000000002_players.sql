CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  sport_preference text NOT NULL CHECK (sport_preference IN ('football', 'futsal', 'both')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users,
  sport_type text NOT NULL CHECK (sport_type IN ('football', 'futsal')),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer NOT NULL,
  price_per_pax numeric(10, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

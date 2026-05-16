-- Remove duplicate (user_id, phone_number) pairs, keeping the oldest entry
DELETE FROM players
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, phone_number) id
  FROM players
  ORDER BY user_id, phone_number, created_at
);

ALTER TABLE players
  ADD CONSTRAINT players_user_id_phone_number_key UNIQUE (user_id, phone_number);

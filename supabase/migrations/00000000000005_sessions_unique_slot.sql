-- Prevent duplicate sessions for the same user/sport/date/time slot
ALTER TABLE sessions
  ADD CONSTRAINT sessions_unique_slot
  UNIQUE (user_id, sport_type, date, start_time, end_time);

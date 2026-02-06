-- 1. Add meet_date to profiles
alter table profiles 
add column if not exists meet_date date default '2026-04-03';

-- 2. Fix Mood RLS (simplify for debugging)
-- The "empty error" usually means RLS violation on UPSERT (Update part)
-- Ensure users can UPDATE their own rows
drop policy if exists "Users can insert/update own mood" on moods;

create policy "Users can insert own mood" on moods
  for insert with check (auth.uid() = user_id);

create policy "Users can update own mood" on moods
  for update using (auth.uid() = user_id);

-- 3. Game Scores RLS (just in case)
-- Allow update if you are part of the couple
drop policy if exists "Update couple game scores" on game_scores;
create policy "Update couple game scores" on game_scores
  for update using (
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

-- Helper function to get current user's couple_id securely (bypassing RLS)
create or replace function get_auth_couple_id()
returns uuid
language sql
security definer
stable
as $$
  select couple_id from profiles where id = auth.uid();
$$;

-- Drop the recursive policies
drop policy if exists "Users can view their partner's profile" on profiles;
drop policy if exists "Users can view couple moods" on moods;
drop policy if exists "View couple drawings" on drawings;
drop policy if exists "Insert own drawings" on drawings;
drop policy if exists "View couple stars" on stars;
drop policy if exists "Insert own stars" on stars;

-- Re-create PROFILE policies
create policy "Users can view their partner's profile" on profiles
  for select using (
    couple_id is not null and
    couple_id = get_auth_couple_id()
  );

-- Re-create MOODS policies
create policy "Users can view couple moods" on moods
  for select using (
    couple_id is not null and
    couple_id = get_auth_couple_id()
  );

-- Re-create DRAWINGS policies
create policy "View couple drawings" on drawings
  for select using (
    couple_id = get_auth_couple_id()
  );

create policy "Insert own drawings" on drawings
  for insert with check (
    auth.uid() = user_id and
    couple_id = get_auth_couple_id()
  );

-- Re-create STARS policies
create policy "View couple stars" on stars
  for select using (
    couple_id = get_auth_couple_id()
  );

create policy "Insert own stars" on stars
  for insert with check (
    auth.uid() = user_id and
    couple_id = get_auth_couple_id()
  );

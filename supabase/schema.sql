-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. COUPLES TABLE
create table if not exists couples (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table couples enable row level security;

-- 2. PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  pairing_code text unique not null default substring(md5(random()::text), 0, 7), -- 6 char random code
  couple_id uuid references couples(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

-- 3. MOODS TABLE
create table if not exists moods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  couple_id uuid references couples(id), -- Denormalized for easier RLS
  mood text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id) -- One mood per user
);

alter table moods enable row level security;

-- 4. DRAWINGS TABLE
create table if not exists drawings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  couple_id uuid references couples(id) not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table drawings enable row level security;

-- 5. STARS TABLE
create table if not exists stars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  couple_id uuid references couples(id) not null,
  x float not null,
  y float not null,
  message text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table stars enable row level security;


-- POLICIES -----------------------------------------

-- Helper function to get current user's couple_id
-- (This improves performance of RLS policies if needed, but simple subqueries work too)

-- PROFILES Policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can view their partner's profile" on profiles
  for select using (
    couple_id is not null and
    couple_id in (
      select couple_id from profiles where id = auth.uid()
    )
  );

-- MOODS Policies
create policy "Users can view couple moods" on moods
  for select using (
    couple_id is not null and
    couple_id in (
      select couple_id from profiles where id = auth.uid()
    )
  );
-- Fallback: Users can see their own mood even if not coupled (for initial setup)
create policy "Users can view own mood" on moods
  for select using (auth.uid() = user_id);

create policy "Users can insert/update own mood" on moods
  for all using (auth.uid() = user_id);

-- DRAWINGS & STARS Policies
-- Only visible if coupled and in same couple
create policy "View couple drawings" on drawings
  for select using (
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

create policy "Insert own drawings" on drawings
  for insert with check (
    auth.uid() = user_id and
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

create policy "View couple stars" on stars
  for select using (
    couple_id in (select couple_id from profiles where id = auth.uid())
  );

create policy "Insert own stars" on stars
  for insert with check (
    auth.uid() = user_id and
    couple_id in (select couple_id from profiles where id = auth.uid())
  );


-- TRIGGERS & FUNCTIONS -----------------------------

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- PAIRING FUNCTION
-- Accessible via RPC: supabase.rpc('pair_with_partner', { code: '...' })
create or replace function pair_with_partner(code text)
returns boolean
language plpgsql security definer
as $$
declare
  target_partner_id uuid;
  my_id uuid := auth.uid();
  new_couple_id uuid;
  existing_couple_id uuid;
begin
  -- 1. Find the user with this pairing code
  select id, couple_id into target_partner_id, existing_couple_id
  from profiles
  where pairing_code = code;

  if target_partner_id is null then
    raise exception 'Invalid pairing code';
  end if;

  if target_partner_id = my_id then
    raise exception 'You cannot pair with yourself';
  end if;

  -- 2. Check if they are already paired
  if existing_couple_id is not null then
    -- Wait, what if they are paired with ME? (Re-pairing?) -> Handle gracefully?
    -- For strictness: fail.
    raise exception 'This user is already paired';
  end if;

  -- 3. Check if I am already paired
  select couple_id into existing_couple_id from profiles where id = my_id;
  if existing_couple_id is not null then
    raise exception 'You are already paired';
  end if;

  -- 4. Create new couple
  insert into couples default values returning id into new_couple_id;

  -- 5. Update both profiles
  update profiles set couple_id = new_couple_id where id = my_id;
  update profiles set couple_id = new_couple_id where id = target_partner_id;

  return true;
end;
$$;

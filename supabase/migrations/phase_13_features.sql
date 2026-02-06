-- 1. GAME SCORES TABLE
create table if not exists game_scores (
    couple_id uuid references couples(id) primary key, -- One score row per couple
    pink_score int default 0,
    blue_score int default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table game_scores enable row level security;

-- 2. GAME SCORES POLICIES
-- View score: couple_id must match authenticated user's couple_id
create policy "View couple game scores" on game_scores
    for select using (
        couple_id = get_auth_couple_id()
    );

-- Update score: couple_id must match authenticated user's couple_id
create policy "Update couple game scores" on game_scores
    for update using (
        couple_id = get_auth_couple_id()
    );

-- Insert score: couple_id must match authenticated user's couple_id
create policy "Insert couple game scores" on game_scores
    for insert with check (
        couple_id = get_auth_couple_id()
    );

-- 3. STORAGE POLICIES (for 'memories' bucket)
-- NOTE: You must create the 'memories' bucket manually in Supabase Dashboard first!
-- Public Access should be enabled for simplicity, or use signed URLs.

-- Allow authenticated users to upload files
-- (Supabase Storage policies are SQL too!)
-- Policy name: "Allow authenticated uploads"
-- Target role: authenticated
-- Bucket: memories
-- WITH CHECK expression: bucket_id = 'memories' AND auth.role() = 'authenticated'

begin;
  -- Enable RLS on storage.objects if not already (it usually is)
  -- create policy "Allow authenticated uploads" on storage.objects
  --   for insert with check (
  --     bucket_id = 'memories' and
  --     auth.role() = 'authenticated'
  --   );
  
  -- create policy "Allow authenticated select" on storage.objects
  --   for select using (
  --     bucket_id = 'memories' and
  --     auth.role() = 'authenticated'
  --   );
commit;

-- (Storage policies are tricky to script blindly because storage schema varies. 
-- It is SAFER to ask user to add these in Dashboard or provide a generic snippet if we are sure of 'storage' schema presence)

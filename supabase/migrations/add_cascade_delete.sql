-- 1. Profiles: Allow deleting user from auth.users to delete profile
ALTER TABLE profiles
DROP CONSTRAINT if exists profiles_id_fkey, -- Drop default constraint
ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 2. Moods: Allow deleting profile to delete mood
ALTER TABLE moods
DROP CONSTRAINT if exists moods_user_id_fkey,
ADD CONSTRAINT moods_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- 3. Drawings: Allow deleting profile to delete drawings
ALTER TABLE drawings
DROP CONSTRAINT if exists drawings_user_id_fkey,
ADD CONSTRAINT drawings_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- 4. Stars: Allow deleting profile to delete stars
ALTER TABLE stars
DROP CONSTRAINT if exists stars_user_id_fkey,
ADD CONSTRAINT stars_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

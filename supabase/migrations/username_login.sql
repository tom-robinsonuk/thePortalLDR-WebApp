-- Add username column to profiles
alter table profiles add column if not exists username text unique;

-- Update the handle_new_user trigger function to include username
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, username, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Function to get email by username (for login)
create or replace function get_email_by_username(username_input text)
returns text
language plpgsql security definer
as $$
declare
  found_email text;
begin
  select email into found_email
  from profiles
  where username = username_input;
  
  return found_email;
end;
$$;

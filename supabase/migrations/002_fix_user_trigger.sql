-- 002_fix_user_trigger.sql
-- Replace problematic auth.users trigger with a safer handler

-- Drop existing trigger and function if present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create new trigger function that is safe and idempotent
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if public.users table exists and has expected columns
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Insert only minimal fields and ignore conflicts
    INSERT INTO public.users (id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      (CASE WHEN NEW.raw_user_meta_data ? 'first_name' THEN (NEW.raw_user_meta_data->>'first_name') ELSE NULL END),
      (CASE WHEN NEW.raw_user_meta_data ? 'last_name' THEN (NEW.raw_user_meta_data->>'last_name') ELSE NULL END),
      (CASE WHEN NEW.raw_user_meta_data ? 'role' THEN (NEW.raw_user_meta_data->>'role') ELSE 'tenant' END),
      now(),
      now()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after new auth.users rows
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Note: Run this migration in your Supabase project's SQL editor (Project -> SQL Editor -> New Query)
-- It makes the trigger function run with SECURITY DEFINER so it can insert into public.users regardless of RLS.
-- Verify in your Supabase logs if auth signups succeed after applying this.

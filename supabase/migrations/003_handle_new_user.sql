BEGIN;

-- Create or replace trigger function to sync auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  f_name text;
  l_name text;
  full_name text;
  role_value text;
  meta jsonb;
BEGIN
  -- support both raw_user_meta_data and user_metadata
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    meta := NEW.raw_user_meta_data;
  ELSE
    meta := COALESCE(NEW.user_metadata, '{}'::jsonb);
  END IF;

  f_name := meta ->> 'first_name';
  l_name := meta ->> 'last_name';
  full_name := trim(coalesce(f_name, '') || ' ' || coalesce(l_name, ''));
  IF full_name = '' THEN
    full_name := meta ->> 'name';
  END IF;

  role_value := coalesce(meta ->> 'role', 'tenant');

  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::uuid,
    NEW.email,
    f_name,
    l_name,
    full_name,
    role_value,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS auth_user_created ON auth.users;
CREATE TRIGGER auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

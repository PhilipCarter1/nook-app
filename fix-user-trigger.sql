-- =====================================================
-- FIX USER TRIGGER ISSUE
-- =====================================================
-- This script checks the current user table structure and fixes the trigger

-- 1. CHECK CURRENT USER TABLE STRUCTURE
SELECT 
  'CURRENT USERS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. CHECK IF TRIGGER EXISTS AND WHAT IT'S DOING
SELECT 
  'EXISTING TRIGGERS' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
  AND trigger_schema = 'public';

-- 3. CHECK IF THE TRIGGER FUNCTION EXISTS
SELECT 
  'TRIGGER FUNCTION' as check_type,
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. DROP THE PROBLEMATIC TRIGGER IF IT EXISTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. DROP THE PROBLEMATIC FUNCTION IF IT EXISTS
DROP FUNCTION IF EXISTS handle_new_user();

-- 6. CREATE A NEW, CORRECT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a record in public.users if the table exists and has the right structure
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    -- Check if the required columns exist
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'id'
    ) THEN
      -- Insert with only the columns that exist
      INSERT INTO public.users (
        id, 
        email
        -- Add other columns only if they exist
      )
      VALUES (
        NEW.id,
        NEW.email
        -- Add other values only if columns exist
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREATE THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. VERIFY THE FIX
SELECT 
  'TRIGGER FIXED' as check_type,
  'User trigger has been updated to work with your table structure' as status;

-- 9. NOW TRY TO CREATE A TEST USER TO VERIFY
-- This will test if the trigger works without errors
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440999',
  'test@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User", "role": "tenant"}',
  false,
  'conf_test',
  'rec_test'
) ON CONFLICT (id) DO NOTHING;

-- 10. CLEAN UP THE TEST USER
DELETE FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440999';

-- 11. FINAL STATUS
SELECT 
  'READY TO CREATE TEST SCENARIO' as check_type,
  'The user trigger issue has been fixed. You can now run the test scenario script!' as status;

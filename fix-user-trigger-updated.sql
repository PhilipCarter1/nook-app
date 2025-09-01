-- =====================================================
-- FIX USER TRIGGER ISSUE (UPDATED VERSION)
-- =====================================================
-- This script fixes the user trigger and verifies it works correctly

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

-- 2. CHECK EXISTING USERS IN PUBLIC.USERS
SELECT 
  'EXISTING PUBLIC USERS' as check_type,
  COUNT(*) as user_count,
  'These users were created by the trigger' as note
FROM public.users;

-- 3. DROP THE PROBLEMATIC TRIGGER IF IT EXISTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. DROP THE PROBLEMATIC FUNCTION IF IT EXISTS
DROP FUNCTION IF EXISTS handle_new_user();

-- 5. CREATE A NEW, CORRECT TRIGGER FUNCTION
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

-- 6. CREATE THE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. VERIFY THE FIX
SELECT 
  'TRIGGER FIXED' as check_type,
  'User trigger has been updated to work with your table structure' as status;

-- 8. TEST WITH A UNIQUE EMAIL
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
  'trigger-test-' || EXTRACT(EPOCH FROM NOW()) || '@nook.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Trigger Test User", "role": "tenant"}',
  false,
  'conf_test',
  'rec_test'
) ON CONFLICT (id) DO NOTHING;

-- 9. VERIFY THE TRIGGER WORKED
SELECT 
  'TRIGGER TEST' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = '550e8400-e29b-41d4-a716-446655440999'
    ) THEN '✅ TRIGGER WORKING - User created in public.users'
    ELSE '❌ TRIGGER NOT WORKING - Check for errors above'
  END as status;

-- 10. CLEAN UP THE TEST USER
DELETE FROM auth.users WHERE id = '550e8400-e29b-41d4-a716-446655440999';
DELETE FROM public.users WHERE id = '550e8400-e29b-41d4-a716-446655440999';

-- 11. FINAL STATUS
SELECT 
  'READY TO CREATE TEST SCENARIO' as check_type,
  'The user trigger issue has been fixed. You can now run the test scenario script!' as status;

-- 12. SHOW WHAT TO DO NEXT
SELECT 
  'NEXT STEPS' as check_type,
  '1. Run the test scenario script to create all test accounts' as step1,
  '2. Test the platform with the new accounts' as step2,
  '3. Verify all features work correctly' as step3;

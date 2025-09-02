-- Debug signup error for landlord@test.com
-- Check if the user exists in auth.users
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'landlord@test.com';

-- Check if the user exists in public.users
SELECT 
  id, 
  email, 
  name, 
  role, 
  created_at
FROM public.users 
WHERE email = 'landlord@test.com';

-- Check the structure of public.users table
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS policies on users table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public';

-- Check if RLS is enabled on users table
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' 
  AND schemaname = 'public';

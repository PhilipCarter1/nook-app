-- =====================================================
-- CHECK EXISTING TEST USERS
-- =====================================================
-- This query will show you what test users already exist

-- Check auth.users table
SELECT 
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'tenant@test.com')
ORDER BY email;

-- Check public.users table
SELECT 
  'public.users' as table_name,
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM public.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'tenant@test.com')
ORDER BY email;

-- Check if there are any other test users
SELECT 
  'All test users in auth.users' as info,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email LIKE '%@test.com' OR email LIKE '%test%'
ORDER BY email;

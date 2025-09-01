-- =====================================================
-- CHECK PUBLIC.USERS TABLE
-- =====================================================
-- This will show us what users exist in the public.users table

-- Check if test@nook.com exists in public.users
SELECT 
  'test@nook.com in public.users' as check_type,
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'test@nook.com';

-- Check if admin@test.com exists in public.users
SELECT 
  'admin@test.com in public.users' as check_type,
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'admin@test.com';

-- Check if landlord@test.com exists in public.users
SELECT 
  'landlord@test.com in public.users' as check_type,
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email = 'landlord@test.com';

-- Show all users in public.users table
SELECT 
  'All users in public.users' as info,
  id,
  email,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

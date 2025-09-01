-- =====================================================
-- CHECK TEST USER CREDENTIALS
-- =====================================================
-- This will help us verify what users exist and their status

-- Check if admin@test.com exists and its details
SELECT 
  'admin@test.com check' as test,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'admin@test.com';

-- Check if landlord@test.com exists and its details
SELECT 
  'landlord@test.com check' as test,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'landlord@test.com';

-- Check if test@nook.com exists and its details
SELECT 
  'test@nook.com check' as test,
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'test@nook.com';

-- Check all users that might be test users
SELECT 
  'All potential test users' as info,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email LIKE '%test%' OR email LIKE '%@test.com'
ORDER BY created_at DESC
LIMIT 10;

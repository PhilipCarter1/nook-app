-- =====================================================
-- FIX TEST USERS ROLES AND METADATA
-- =====================================================
-- This will update the existing test users with proper roles and metadata

-- Update admin@test.com with proper role
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test Admin", "role": "admin"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'admin@test.com';

-- Update landlord@test.com with proper role
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test Landlord", "role": "landlord"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'landlord@test.com';

-- Update super@test.com with proper role
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test Super", "role": "super"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'super@test.com';

-- Update tenant1@test.com with proper role
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test Tenant", "role": "tenant"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'tenant1@test.com';

-- Update test@nook.com with proper role (this looks like a main test account)
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test User", "role": "landlord"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'test@nook.com';

-- Update test99@nook.com with proper role
UPDATE auth.users 
SET 
  raw_user_meta_data = '{"name": "Test User 99", "role": "tenant"}',
  raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
WHERE email = 'test99@nook.com';

-- Verify the updates
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name,
  email_confirmed_at
FROM auth.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'super@test.com', 'tenant1@test.com', 'test@nook.com', 'test99@nook.com')
ORDER BY email;

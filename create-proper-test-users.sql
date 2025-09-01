-- =====================================================
-- CREATE PROPER TEST USERS FOR SUPABASE AUTHENTICATION
-- =====================================================
-- This script creates test users that can actually log in
-- All users have password: Test123!

-- IMPORTANT: Run this in your Supabase SQL Editor

-- 1. Create test users in auth.users table
-- =====================================================

-- Test Admin User
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
  '11111111-1111-1111-1111-111111111111',
  'admin@test.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test Admin", "role": "admin"}',
  false,
  'conf_admin',
  'rec_admin'
) ON CONFLICT (id) DO NOTHING;

-- Test Landlord User
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
  '22222222-2222-2222-2222-222222222222',
  'landlord@test.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test Landlord", "role": "landlord"}',
  false,
  'conf_landlord',
  'rec_landlord'
) ON CONFLICT (id) DO NOTHING;

-- Test Tenant User
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
  '33333333-3333-3333-3333-333333333333',
  'tenant@test.com',
  crypt('Test123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test Tenant", "role": "tenant"}',
  false,
  'conf_tenant',
  'rec_tenant'
) ON CONFLICT (id) DO NOTHING;

-- 2. Create corresponding records in public.users table
-- =====================================================

-- Admin user profile
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'admin@test.com',
  'Test',
  'Admin',
  'admin',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Landlord user profile
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'landlord@test.com',
  'Test',
  'Landlord',
  'landlord',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Tenant user profile
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'tenant@test.com',
  'Test',
  'Tenant',
  'tenant',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verify the users were created
-- =====================================================
SELECT 
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'tenant@test.com')
UNION ALL
SELECT 
  'public.users' as table_name,
  id,
  email,
  role,
  created_at
FROM public.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'tenant@test.com')
ORDER BY table_name, email;

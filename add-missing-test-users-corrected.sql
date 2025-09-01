-- =====================================================
-- ADD MISSING TEST USERS TO PUBLIC.USERS TABLE (CORRECTED)
-- =====================================================
-- This will create the missing user records with all required fields

-- Get the user IDs from auth.users first
WITH auth_users AS (
  SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'tenant') as role,
    COALESCE(raw_user_meta_data->>'name', 'Test User') as name
  FROM auth.users 
  WHERE email IN ('test@nook.com', 'admin@test.com', 'landlord@test.com', 'super@test.com', 'tenant1@test.com', 'test99@nook.com')
)
-- Insert missing users into public.users with all required fields
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.name,
  au.role,
  now() as created_at,
  now() as updated_at
FROM auth_users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- Verify the insertions
SELECT 
  'Verification - Users in public.users' as info,
  id,
  email,
  name,
  role,
  created_at
FROM public.users 
WHERE email IN ('test@nook.com', 'admin@test.com', 'landlord@test.com', 'super@test.com', 'tenant1@test.com', 'test99@nook.com')
ORDER BY email;

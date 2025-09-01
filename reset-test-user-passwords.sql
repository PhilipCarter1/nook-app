-- =====================================================
-- RESET TEST USER PASSWORDS
-- =====================================================
-- This will set all test users to have the password: Test123!

-- Reset admin@test.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@test.com';

-- Reset landlord@test.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'landlord@test.com';

-- Reset super@test.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'super@test.com';

-- Reset tenant1@test.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'tenant1@test.com';

-- Reset test@nook.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'test@nook.com';

-- Reset test99@nook.com password
UPDATE auth.users 
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'test99@nook.com';

-- Verify the updates
SELECT 
  'Password reset verification' as info,
  email,
  email_confirmed_at,
  updated_at,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email IN ('admin@test.com', 'landlord@test.com', 'super@test.com', 'tenant1@test.com', 'test@nook.com', 'test99@nook.com')
ORDER BY email;

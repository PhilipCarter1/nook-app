-- Check if tenant@nook.com exists in auth.users
SELECT 
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
WHERE email = 'tenant@nook.com';

-- Check if tenant@nook.com exists in public.users
SELECT 
  'public.users' as table_name,
  id,
  email,
  name,
  role,
  created_at
FROM public.users 
WHERE email = 'tenant@nook.com';

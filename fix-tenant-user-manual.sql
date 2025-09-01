-- Manual fix for tenant@nook.com user
-- This will ensure the user exists in both auth.users and public.users

-- Step 1: Check if user exists in auth.users
SELECT 'auth.users check:' as step, id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'tenant@nook.com';

-- Step 2: Check if user exists in public.users  
SELECT 'public.users check:' as step, id, email, name, role 
FROM public.users 
WHERE email = 'tenant@nook.com';

-- Step 3: If user exists in auth.users but not in public.users, insert into public.users
-- Replace 'USER_ID_FROM_STEP_1' with the actual ID from step 1
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1)) as name,
  COALESCE(au.raw_user_meta_data->>'role', 'tenant') as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email = 'tenant@nook.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.id = au.id
  );

-- Step 4: Verify the fix
SELECT 'Final check:' as step, id, email, name, role 
FROM public.users 
WHERE email = 'tenant@nook.com';

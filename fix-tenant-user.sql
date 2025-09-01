-- First, get the user ID from auth.users
-- Replace 'USER_ID_HERE' with the actual ID from the first query result
-- This will insert the missing tenant user into public.users

-- Step 1: Get the user ID (run this first)
SELECT id, email FROM auth.users WHERE email = 'tenant@nook.com';

-- Step 2: Insert into public.users (replace USER_ID_HERE with the ID from step 1)
-- INSERT INTO public.users (id, email, name, role, created_at, updated_at)
-- VALUES (
--   'USER_ID_HERE',  -- Replace with actual user ID
--   'tenant@nook.com',
--   'Test Tenant',   -- Required name field
--   'tenant',
--   NOW(),
--   NOW()
-- );

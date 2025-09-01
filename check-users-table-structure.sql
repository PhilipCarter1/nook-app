-- =====================================================
-- CHECK USERS TABLE STRUCTURE
-- =====================================================
-- This will show us the actual columns in the users table

-- Check the structure of public.users table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in auth.users table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth'
ORDER BY ordinal_position;

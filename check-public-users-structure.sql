-- =====================================================
-- CHECK PUBLIC.USERS TABLE STRUCTURE
-- =====================================================
-- This will show us the exact columns and constraints in the public.users table

-- Check the structure of public.users table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

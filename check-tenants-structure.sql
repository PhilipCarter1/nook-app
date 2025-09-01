-- =====================================================
-- CHECK TENANTS TABLE STRUCTURE
-- =====================================================
-- This script checks what columns actually exist in the tenants table

-- 1. CHECK CURRENT TENANTS TABLE STRUCTURE
SELECT 
  'CURRENT TENANTS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 2. CHECK IF TENANTS TABLE EXISTS
SELECT 
  'TENANTS TABLE EXISTS' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tenants'
    ) THEN '✅ YES - Table exists'
    ELSE '❌ NO - Table does not exist'
  END as status;

-- 3. SHOW SAMPLE DATA IF ANY EXISTS
SELECT 
  'EXISTING TENANTS DATA' as check_type,
  COUNT(*) as tenant_count,
  'Current tenants in the table' as note
FROM public.tenants;

-- 4. SHOW WHAT WE NEED TO CREATE
SELECT 
  'NEXT STEPS' as check_type,
  'Based on the structure above, we will create the correct INSERT statements' as action;

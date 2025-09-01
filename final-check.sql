-- =====================================================
-- FINAL TARGETED CHECK
-- =====================================================
-- This will give us the complete picture for the final fix

-- 1. CHECK ALL TABLE NAMES TO SEE WHAT WE'RE WORKING WITH
SELECT 
  'ALL TABLES' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ON'
    ELSE '❌ RLS OFF'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. CHECK IF LEASES AND TENANTS TABLES EXIST
SELECT 
  'KEY TABLES CHECK' as check_type,
  'leases' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leases') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'KEY TABLES CHECK' as check_type,
  'tenants' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 3. IF LEASES EXISTS, SHOW ITS STRUCTURE
SELECT 
  'LEASES STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leases'
ORDER BY ordinal_position;

-- 4. IF TENANTS EXISTS, SHOW ITS STRUCTURE  
SELECT 
  'TENANTS STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 5. CHECK WHAT POLICIES EXIST ON DOCUMENTS TABLE
SELECT 
  'DOCUMENTS POLICIES' as check_type,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'documents'
ORDER BY policyname;

-- 6. CHECK STORAGE BUCKETS (should be 0 currently)
SELECT 
  'STORAGE BUCKETS' as check_type,
  id,
  name,
  public,
  CASE 
    WHEN public = false THEN '✅ SECURE'
    ELSE '❌ PUBLIC'
  END as security_status
FROM storage.buckets
ORDER BY id;

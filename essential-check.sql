-- =====================================================
-- ESSENTIAL CHECK - SIMPLE AND FOCUSED
-- =====================================================
-- This will give us the key info we need

-- 1. QUICK CHECK - WHICH CRITICAL TABLES EXIST?
SELECT 
  'TABLE EXISTENCE' as check_type,
  'leases' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leases') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'TABLE EXISTENCE' as check_type,
  'tenants' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'TABLE EXISTENCE' as check_type,
  'properties' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'TABLE EXISTENCE' as check_type,
  'units' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'units') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. QUICK CHECK - STORAGE BUCKETS
SELECT 
  'STORAGE STATUS' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets) = 0 THEN '❌ NO BUCKETS'
    ELSE '✅ HAS BUCKETS'
  END as status,
  (SELECT COUNT(*) FROM storage.buckets) as bucket_count;

-- 3. QUICK CHECK - RLS STATUS ON KEY TABLES
SELECT 
  'RLS STATUS' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ON'
    ELSE '❌ RLS OFF'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('documents', 'payments', 'maintenance_tickets', 'leases', 'tenants', 'properties', 'units')
ORDER BY tablename;

-- =====================================================
-- COMPLETE PICTURE CHECK
-- =====================================================
-- This will give us the final piece of the puzzle

-- 1. WHICH CRITICAL TABLES EXIST?
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
  END as status;

-- 2. STORAGE BUCKET STATUS
SELECT 
  'STORAGE STATUS' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets) = 0 THEN '❌ NO BUCKETS'
    ELSE '✅ HAS BUCKETS'
  END as status,
  (SELECT COUNT(*) FROM storage.buckets) as bucket_count;

-- 3. FINAL SUMMARY
SELECT 
  'FINAL SUMMARY' as check_type,
  'RLS Status' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 6 
    THEN '✅ ALL CRITICAL TABLES SECURED'
    ELSE '❌ SOME TABLES UNSECURED'
  END as status
UNION ALL
SELECT 
  'FINAL SUMMARY' as check_type,
  'Storage Status' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets) = 0 
    THEN '❌ NO STORAGE BUCKETS'
    ELSE '✅ STORAGE CONFIGURED'
  END as status
UNION ALL
SELECT 
  'FINAL SUMMARY' as check_type,
  'Policy Status' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('documents', 'payments', 'maintenance_tickets', 'leases', 'tenants', 'properties', 'units')) >= 20
    THEN '✅ WELL PROTECTED'
    ELSE '⚠️ NEEDS MORE POLICIES'
  END as status;

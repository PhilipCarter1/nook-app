-- =====================================================
-- FINAL STATUS CHECK
-- =====================================================
-- This will give us the complete picture

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

-- 3. POLICY COUNT ON CRITICAL TABLES
SELECT 
  'POLICY COUNT' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ WELL PROTECTED'
    WHEN COUNT(*) >= 1 THEN '⚠️ PARTIALLY PROTECTED'
    ELSE '❌ UNPROTECTED'
  END as protection_status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('documents', 'payments', 'maintenance_tickets', 'leases', 'tenants', 'properties', 'units')
GROUP BY tablename
ORDER BY tablename;

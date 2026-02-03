-- =====================================================
-- PRODUCTION READINESS VERIFICATION
-- =====================================================
-- Run this script to verify your database is production-ready
-- Execute in Supabase SQL Editor

-- 1. CHECK RLS IS ENABLED ON ALL CRITICAL TABLES
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'users', 'properties', 'units', 'leases', 
    'documents', 'payments', 'maintenance_tickets',
    'subscriptions', 'organizations', 'tenants'
  )
ORDER BY tablename;

-- 2. VERIFY STORAGE BUCKETS ARE PRIVATE
SELECT 
  id,
  name,
  public,
  CASE 
    WHEN public = false THEN '✅ PRIVATE'
    ELSE '❌ PUBLIC'
  END as security_status
FROM storage.buckets 
WHERE id IN ('documents', 'tenant-documents')
ORDER BY id;

-- 3. COUNT RLS POLICIES (should be > 0 per critical table)
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PROTECTED'
    ELSE '❌ UNPROTECTED'
  END as protection_status
FROM pg_policies 
WHERE tablename IN (
  'documents', 'payments', 'maintenance_tickets', 'leases', 
  'properties', 'units', 'users'
)
GROUP BY tablename
ORDER BY tablename;

-- 4. VERIFY CORE TABLES HAVE DATA
SELECT 
  'users' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
    ELSE '⚠️  EMPTY'
  END as status
FROM users
UNION ALL
SELECT 'properties', COUNT(*), 
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️  EMPTY' END 
  FROM properties
UNION ALL
SELECT 'leases', COUNT(*), 
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️  EMPTY' END 
  FROM leases
UNION ALL
SELECT 'payments', COUNT(*), 
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '⚠️  EMPTY' END 
  FROM payments;

-- 5. VERIFY DOCUMENT STORAGE STRUCTURE
SELECT 
  'Document storage ready' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE id = 'documents' AND public = false) > 0
    THEN '✅ READY'
    ELSE '❌ NOT READY'
  END as status;

-- 6. CHECK AUTH USERS EXIST
SELECT 
  COUNT(*) as auth_users,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ USERS EXIST'
    ELSE '❌ NO USERS'
  END as status
FROM auth.users;

-- 7. FINAL PRODUCTION READINESS SUMMARY
SELECT 
  'PRODUCTION READINESS CHECK' as summary,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND rowsecurity=true AND tablename IN ('users','properties','documents','payments')) = 4
    THEN '✅ RLS ENABLED'
    ELSE '❌ RLS INCOMPLETE'
  END as rls_check,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('documents','payments','maintenance_tickets')) > 10
    THEN '✅ POLICIES IN PLACE'
    ELSE '⚠️  CHECK POLICIES'
  END as policy_check,
  CASE 
    WHEN (SELECT COUNT(*) FROM users) > 0
    THEN '✅ DATA PRESENT'
    ELSE '⚠️  NO DATA'
  END as data_check;

-- =====================================================
-- WHAT TO DO NEXT:
-- =====================================================
-- ✅ If RLS shows ❌ DISABLED, run: 
--    ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;
--
-- ✅ If buckets show ❌ PUBLIC, change to private in Supabase Dashboard
--    Storage → Buckets → Edit → Toggle "Public bucket"
--
-- ✅ If policies show ⚠️, verify policies exist:
--    Run: SELECT * FROM pg_policies WHERE tablename = 'documents';
--
-- ✅ If data shows ⚠️ EMPTY, restore from backup or add test data
--
-- Once all checks show ✅, you're ready for production!

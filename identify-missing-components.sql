-- =====================================================
-- IDENTIFY MISSING COMPONENTS
-- =====================================================
-- This will show exactly what's missing to get FULLY READY status

-- 1. CHECK WHICH CORE TABLES EXIST VS MISSING
SELECT 
  'CORE TABLES STATUS' as check_type,
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t.table_name) 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t.table_name AND rowsecurity = true) 
    THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM (VALUES 
  ('users'),
  ('properties'), 
  ('units'),
  ('leases'),
  ('tenants'),
  ('documents'),
  ('payments'),
  ('maintenance_tickets')
) AS t(table_name)
ORDER BY table_name;

-- 2. CHECK POLICY COVERAGE ON EACH TABLE
SELECT 
  'POLICY COVERAGE' as check_type,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ WELL PROTECTED'
    WHEN COUNT(*) >= 2 THEN '⚠️ PARTIALLY PROTECTED'
    ELSE '❌ NEEDS POLICIES'
  END as protection_status,
  STRING_AGG(cmd, ', ' ORDER BY cmd) as operations_covered
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')
GROUP BY tablename
ORDER BY tablename;

-- 3. CHECK STORAGE BUCKET STATUS
SELECT 
  'STORAGE STATUS' as check_type,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE public = false) >= 2 THEN '✅ SECURED'
    WHEN (SELECT COUNT(*) FROM storage.buckets) > 0 THEN '⚠️ PARTIALLY SECURED'
    ELSE '❌ NO BUCKETS'
  END as status,
  (SELECT COUNT(*) FROM storage.buckets) as total_buckets,
  (SELECT COUNT(*) FROM storage.buckets WHERE public = false) as secure_buckets,
  (SELECT COUNT(*) FROM storage.buckets WHERE public = true) as public_buckets;

-- 4. CHECK SPECIFIC MISSING COMPONENTS
SELECT 
  'MISSING COMPONENTS ANALYSIS' as check_type,
  'Missing Tables' as category,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN '❌ USERS TABLE - CRITICAL FOR SIGNUP'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') 
    THEN '❌ PROPERTIES TABLE - CRITICAL FOR LANDLORDS'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN '❌ TENANTS TABLE - CRITICAL FOR TENANT MANAGEMENT'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leases') 
    THEN '❌ LEASES TABLE - CRITICAL FOR RENTAL AGREEMENTS'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') 
    THEN '❌ PAYMENTS TABLE - CRITICAL FOR RENT COLLECTION'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'maintenance_tickets') 
    THEN '❌ MAINTENANCE TABLE - CRITICAL FOR PROPERTY MAINTENANCE'
    ELSE '✅ ALL CORE TABLES EXIST'
  END as status
UNION ALL
SELECT 
  'MISSING COMPONENTS ANALYSIS' as check_type,
  'Missing RLS' as category,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false AND tablename IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')) > 0 
    THEN '❌ SOME TABLES MISSING RLS - SECURITY RISK'
    ELSE '✅ ALL CORE TABLES HAVE RLS ENABLED'
  END as status
UNION ALL
SELECT 
  'MISSING COMPONENTS ANALYSIS' as check_type,
  'Missing Policies' as category,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')) < 25 
    THEN '❌ INSUFFICIENT POLICIES - NEED AT LEAST 25'
    ELSE '✅ SUFFICIENT POLICY COVERAGE'
  END as status
UNION ALL
SELECT 
  'MISSING COMPONENTS ANALYSIS' as check_type,
  'Missing Storage' as category,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE public = false) < 2 
    THEN '❌ INSUFFICIENT SECURE STORAGE - NEED 2 SECURE BUCKETS'
    ELSE '✅ STORAGE PROPERLY CONFIGURED'
  END as status;

-- 5. WHAT NEEDS TO BE FIXED TO GET FULLY READY
SELECT 
  'TO GET FULLY READY' as check_type,
  'Required Actions' as action,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
    THEN 'CREATE USERS TABLE'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') 
    THEN 'CREATE PROPERTIES TABLE'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN 'CREATE TENANTS TABLE'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leases') 
    THEN 'CREATE LEASES TABLE'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') 
    THEN 'CREATE PAYMENTS TABLE'
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'maintenance_tickets') 
    THEN 'CREATE MAINTENANCE_TICKETS TABLE'
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false AND tablename IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')) > 0 
    THEN 'ENABLE RLS ON MISSING TABLES'
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')) < 25 
    THEN 'ADD MORE POLICIES TO REACH 25+'
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE public = false) < 2 
    THEN 'CREATE SECURE STORAGE BUCKETS'
    ELSE '✅ NOTHING - ALREADY FULLY READY'
  END as required_action;

-- =====================================================
-- GET DETAILED DATABASE STATE
-- =====================================================
-- Run this to see exactly what we have and what's missing

-- 1. WHICH TABLES HAVE RLS ENABLED?
SELECT 
  'RLS ENABLED TABLES' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ON'
    ELSE '❌ RLS OFF'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- 2. WHICH TABLES DON'T HAVE RLS?
SELECT 
  'RLS DISABLED TABLES' as check_type,
  tablename,
  CASE 
    WHEN rowsecurity = false THEN '❌ RLS OFF'
    ELSE '✅ RLS ON'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false
ORDER BY tablename;

-- 3. WHAT POLICIES EXIST ON CRITICAL TABLES?
SELECT 
  'EXISTING POLICIES' as check_type,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '🔍 READ'
    WHEN cmd = 'INSERT' THEN '➕ CREATE'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE'
    WHEN cmd = 'ALL' THEN '🔄 ALL OPERATIONS'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'properties', 'units', 'leases', 'documents', 'payments', 'maintenance_tickets')
ORDER BY tablename, cmd;

-- 4. CHECK IF KEY TABLES EXIST AND THEIR STRUCTURE
-- Check leases table
SELECT 
  'LEASES TABLE EXISTS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leases') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check tenants table  
SELECT 
  'TENANTS TABLE EXISTS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check documents table
SELECT 
  'DOCUMENTS TABLE EXISTS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 5. IF LEASES EXISTS, SHOW ITS STRUCTURE
SELECT 
  'LEASES STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leases'
ORDER BY ordinal_position;

-- 6. IF TENANTS EXISTS, SHOW ITS STRUCTURE  
SELECT 
  'TENANTS STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- 7. IF DOCUMENTS EXISTS, SHOW ITS STRUCTURE
SELECT 
  'DOCUMENTS STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documents'
ORDER BY ordinal_position;

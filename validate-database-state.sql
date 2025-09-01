-- =====================================================
-- DATABASE STATE VALIDATION SCRIPT
-- =====================================================
-- This script will check what actually exists in your database
-- Run this FIRST to see the current state

-- 1. CHECK WHAT TABLES EXIST
SELECT 
  'EXISTING TABLES' as check_type,
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. CHECK WHAT STORAGE BUCKETS EXIST
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

-- 3. CHECK WHAT POLICIES EXIST ON CRITICAL TABLES
SELECT 
  'EXISTING POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('users', 'properties', 'units', 'leases', 'documents', 'payments', 'maintenance_tickets')
ORDER BY tablename, policyname;

-- 4. CHECK TABLE STRUCTURES FOR KEY TABLES
-- Check if leases table exists and what columns it has
SELECT 
  'LEASES TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leases'
ORDER BY ordinal_position;

-- Check if tenants table exists and what columns it has
SELECT 
  'TENANTS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants'
ORDER BY ordinal_position;

-- Check if documents table exists and what columns it has
SELECT 
  'DOCUMENTS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'documents'
ORDER BY ordinal_position;

-- 5. CHECK FOREIGN KEY RELATIONSHIPS
SELECT 
  'FOREIGN KEY RELATIONSHIPS' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')
ORDER BY tc.table_name, kcu.column_name;

-- 6. SUMMARY OF CURRENT STATE
SELECT 
  'CURRENT STATE SUMMARY' as check_type,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
  (SELECT COUNT(*) FROM storage.buckets) as total_storage_buckets,
  (SELECT COUNT(*) FROM storage.buckets WHERE public = false) as secure_storage_buckets,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies;

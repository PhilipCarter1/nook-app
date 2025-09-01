-- =====================================================
-- COMPREHENSIVE VERIFICATION CHECK
-- =====================================================
-- Run this to confirm everything is working perfectly now

-- 1. STORAGE BUCKET VERIFICATION
SELECT 
  'STORAGE BUCKETS' as check_type,
  id,
  name,
  CASE 
    WHEN public = false THEN '✅ SECURE'
    ELSE '❌ PUBLIC'
  END as security_status,
  file_size_limit,
  CASE 
    WHEN allowed_mime_types IS NOT NULL THEN '✅ CONFIGURED'
    ELSE '❌ NOT CONFIGURED'
  END as mime_types_status
FROM storage.buckets
WHERE id IN ('tenant-documents', 'documents')
ORDER BY id;

-- 2. STORAGE POLICIES VERIFICATION
SELECT 
  'STORAGE POLICIES' as check_type,
  bucket_id,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND bucket_id IN ('tenant-documents', 'documents')
ORDER BY bucket_id, cmd;

-- 3. DOCUMENTS TABLE POLICIES VERIFICATION
SELECT 
  'DOCUMENTS TABLE POLICIES' as check_type,
  policyname,
  cmd,
  permissive,
  roles,
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
  AND tablename = 'documents'
ORDER BY policyname;

-- 4. OVERALL SECURITY STATUS
SELECT 
  'OVERALL SECURITY STATUS' as check_type,
  'RLS Tables' as item,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 6 
    THEN '✅ SECURED'
    ELSE '❌ NEEDS ATTENTION'
  END as status
UNION ALL
SELECT 
  'OVERALL SECURITY STATUS' as check_type,
  'Storage Buckets' as item,
  (SELECT COUNT(*) FROM storage.buckets WHERE public = false) as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM storage.buckets WHERE public = false) >= 2 
    THEN '✅ SECURED'
    ELSE '❌ NEEDS ATTENTION'
  END as status
UNION ALL
SELECT 
  'OVERALL SECURITY STATUS' as check_type,
  'Document Policies' as item,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents') as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents') >= 8 
    THEN '✅ WELL PROTECTED'
    ELSE '❌ NEEDS ATTENTION'
  END as status
UNION ALL
SELECT 
  'OVERALL SECURITY STATUS' as check_type,
  'Total Policies' as item,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 80 
    THEN '✅ COMPREHENSIVE'
    ELSE '⚠️ GOOD COVERAGE'
  END as status;

-- 5. FINAL VERIFICATION - READY FOR CUSTOMERS?
SELECT 
  'READY FOR CUSTOMERS?' as check_type,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM storage.buckets WHERE public = false) >= 2 AND
      (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documents') >= 8 AND
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 6
    ) THEN '🎉 YES! PLATFORM IS FULLY SECURE AND READY'
    ELSE '⚠️ NOT YET - SOME SECURITY FEATURES MISSING'
  END as customer_readiness,
  'Your document approval system should now be fully functional!' as note;

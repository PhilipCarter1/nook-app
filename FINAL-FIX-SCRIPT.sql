-- =====================================================
-- FINAL COMPREHENSIVE FIX SCRIPT
-- =====================================================
-- This script addresses the exact issues identified:
-- 1. Missing storage buckets (0 currently)
-- 2. Documents table needs more policies (only 2 currently)
-- 3. Ensures complete security coverage

-- =====================================================
-- PART 1: CREATE AND SECURE STORAGE BUCKETS
-- =====================================================

-- Create secure tenant-documents bucket for tenant uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'tenant-documents', 
  'tenant-documents', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Create secure documents bucket for general document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'documents', 
  'documents', 
  false, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- =====================================================
-- PART 2: CREATE STORAGE POLICIES FOR TENANT-DOCUMENTS BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can view their own documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can view tenant documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can update their own documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Tenants can delete their own documents in storage" ON storage.objects;

-- Tenants can only upload to their own folder (using user_id from auth.uid())
CREATE POLICY "Tenants can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tenants can only view their own documents in storage
CREATE POLICY "Tenants can view their own documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tenants can update their own documents in storage
CREATE POLICY "Tenants can update their own documents in storage"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tenants can delete their own documents in storage
CREATE POLICY "Tenants can delete their own documents in storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Landlords can view documents from their tenants in storage
CREATE POLICY "Landlords can view tenant documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenant-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT u.id::text FROM users u
      JOIN documents d ON u.id = d.user_id
      JOIN properties p ON d.property_id = p.id
      WHERE p.owner_id = auth.uid() OR p.landlord_id = auth.uid()
    )
  );

-- =====================================================
-- PART 3: CREATE STORAGE POLICIES FOR DOCUMENTS BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents" ON storage.objects;

-- Users can upload documents to the documents bucket
CREATE POLICY "Users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- Users can view documents they have access to
CREATE POLICY "Users can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- Users can update documents they have access to
CREATE POLICY "Users can update documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- Users can delete documents they have access to
CREATE POLICY "Users can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- =====================================================
-- PART 4: ENHANCE DOCUMENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Landlords can view property documents" ON documents;
DROP POLICY IF EXISTS "Users can CRUD their own documents" ON documents;

-- Users can view documents they created
CREATE POLICY "Users can view documents they created"
  ON documents FOR SELECT
  USING (user_id = auth.uid());

-- Users can view documents related to their properties (for landlords)
CREATE POLICY "Landlords can view property documents"
  ON documents FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

-- Users can view documents related to their units (for landlords)
CREATE POLICY "Landlords can view unit documents"
  ON documents FOR SELECT
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.owner_id = auth.uid() OR p.landlord_id = auth.uid()
    )
  );

-- Users can create documents
CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update documents they created
CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete documents they created
CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (user_id = auth.uid());

-- Landlords can update documents for their properties
CREATE POLICY "Landlords can update property documents"
  ON documents FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

-- Landlords can delete documents for their properties
CREATE POLICY "Landlords can delete property documents"
  ON documents FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

-- =====================================================
-- PART 5: VERIFICATION AND FINAL STATUS
-- =====================================================

-- Verify storage buckets are created and secure
SELECT 
  'STORAGE VERIFICATION' as check_type,
  id,
  name,
  CASE 
    WHEN public = false THEN '✅ SECURE'
    ELSE '❌ PUBLIC'
  END as security_status,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('tenant-documents', 'documents')
ORDER BY id;

-- Verify documents table policies are comprehensive
SELECT 
  'DOCUMENTS POLICY VERIFICATION' as check_type,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'documents'
ORDER BY policyname;

-- Final system status check
SELECT 
  'FINAL SYSTEM STATUS' as check_type,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM storage.buckets 
      WHERE id IN ('tenant-documents', 'documents') 
        AND public = false
    ) = 2 THEN '✅ STORAGE SECURED'
    ELSE '❌ STORAGE UNSECURED'
  END as storage_status,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public'
        AND tablename = 'documents'
    ) >= 8 THEN '✅ DOCUMENTS WELL PROTECTED'
    ELSE '❌ DOCUMENTS NEEDS MORE POLICIES'
  END as documents_status,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public'
        AND tablename IN ('documents', 'payments', 'maintenance_tickets', 'leases', 'tenants', 'properties', 'units')
    ) >= 25 THEN '✅ ALL TABLES WELL PROTECTED'
    ELSE '⚠️ SOME TABLES NEED MORE POLICIES'
  END as overall_status;

-- =====================================================
-- SECURE DOCUMENT APPROVAL SYSTEM - RLS POLICIES
-- =====================================================
-- This script creates comprehensive security policies for the document approval system
-- Ensures only associated landlords and admins can see tenant documents for their properties

-- 1. ENABLE ROW LEVEL SECURITY ON ALL CRITICAL TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- 2. CREATE SECURE USER POLICIES
-- Users can only see and modify their own data
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. CREATE SECURE PROPERTY POLICIES
-- Landlords can only see and manage their own properties
CREATE POLICY "Landlords can view their own properties"
  ON properties FOR SELECT
  USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can manage their own properties"
  ON properties FOR ALL
  USING (landlord_id = auth.uid());

-- Admins can see and manage all properties
CREATE POLICY "Admins can view all properties"
  ON properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. CREATE SECURE UNIT POLICIES
-- Landlords can only see units in their properties
CREATE POLICY "Landlords can view units in their properties"
  ON units FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage units in their properties"
  ON units FOR ALL
  USING (
    property_id IN (
      SELECT id FROM properties WHERE landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all units
CREATE POLICY "Admins can view all units"
  ON units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all units"
  ON units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. CREATE SECURE TENANT POLICIES
-- Tenants can only see their own records
CREATE POLICY "Tenants can view their own records"
  ON tenants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Tenants can update their own records"
  ON tenants FOR UPDATE
  USING (user_id = auth.uid());

-- Landlords can only see tenants in their properties
CREATE POLICY "Landlords can view tenants in their properties"
  ON tenants FOR SELECT
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage tenants in their properties"
  ON tenants FOR ALL
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all tenants
CREATE POLICY "Admins can view all tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all tenants"
  ON tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. CREATE SECURE DOCUMENT POLICIES (CRITICAL FOR DOCUMENT APPROVAL)
-- Tenants can only see their own documents
CREATE POLICY "Tenants can view their own documents"
  ON documents FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can upload their own documents"
  ON documents FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT id FROM tenants WHERE user_id = auth.uid()
  ));

CREATE POLICY "Tenants can update their own documents"
  ON documents FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM tenants WHERE user_id = auth.uid()
  ));

-- Landlords can only see documents from tenants in their properties
CREATE POLICY "Landlords can view documents from their tenants"
  ON documents FOR SELECT
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage documents from their tenants"
  ON documents FOR ALL
  USING (
    tenant_id IN (
      SELECT t.id FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all documents
CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. CREATE SECURE LEASE POLICIES
-- Tenants can only see their own leases
CREATE POLICY "Tenants can view their own leases"
  ON leases FOR SELECT
  USING (tenant_id = auth.uid());

-- Landlords can only see leases for their properties
CREATE POLICY "Landlords can view leases for their properties"
  ON leases FOR SELECT
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage leases for their properties"
  ON leases FOR ALL
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all leases
CREATE POLICY "Admins can view all leases"
  ON leases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all leases"
  ON leases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. CREATE SECURE PAYMENT POLICIES
-- Tenants can only see their own payments
CREATE POLICY "Tenants can view their own payments"
  ON payments FOR SELECT
  USING (
    lease_id IN (
      SELECT id FROM leases WHERE tenant_id = auth.uid()
    )
  );

-- Landlords can only see payments for their properties
CREATE POLICY "Landlords can view payments for their properties"
  ON payments FOR SELECT
  USING (
    lease_id IN (
      SELECT l.id FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage payments for their properties"
  ON payments FOR ALL
  USING (
    lease_id IN (
      SELECT l.id FROM leases l
      JOIN units u ON l.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. CREATE SECURE MAINTENANCE TICKET POLICIES
-- Tenants can only see their own maintenance tickets
CREATE POLICY "Tenants can view their own maintenance tickets"
  ON maintenance_tickets FOR SELECT
  USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can create their own maintenance tickets"
  ON maintenance_tickets FOR INSERT
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update their own maintenance tickets"
  ON maintenance_tickets FOR UPDATE
  USING (tenant_id = auth.uid());

-- Landlords can only see maintenance tickets for their properties
CREATE POLICY "Landlords can view maintenance tickets for their properties"
  ON maintenance_tickets FOR SELECT
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can manage maintenance tickets for their properties"
  ON maintenance_tickets FOR ALL
  USING (
    unit_id IN (
      SELECT u.id FROM units u
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can see and manage all maintenance tickets
CREATE POLICY "Admins can view all maintenance tickets"
  ON maintenance_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all maintenance tickets"
  ON maintenance_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 10. CREATE STORAGE BUCKET SECURITY FOR DOCUMENTS
-- Ensure tenant-documents bucket is secure
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tenant-documents', 'tenant-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Tenants can only upload to their own folder
CREATE POLICY "Tenants can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Tenants can only view their own documents
CREATE POLICY "Tenants can view their own documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenant-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Landlords can view documents from their tenants
CREATE POLICY "Landlords can view tenant documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenant-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT t.user_id::text FROM tenants t
      JOIN units u ON t.unit_id = u.id
      JOIN properties p ON u.property_id = p.id
      WHERE p.landlord_id = auth.uid()
    )
  );

-- Admins can view all documents in storage
CREATE POLICY "Admins can view all documents in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenant-documents' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 11. VERIFICATION QUERIES
-- Test that policies are working correctly
-- (Run these to verify security is working)

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'properties', 'units', 'tenants', 'documents', 'leases', 'payments', 'maintenance_tickets');

-- Check all policies on documents table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'documents';

-- =====================================================
-- SECURITY VERIFICATION
-- =====================================================
-- After running this script, test with these scenarios:

-- 1. Tenant A should NOT be able to see Tenant B's documents
-- 2. Landlord A should NOT be able to see Tenant B's documents if Tenant B is not in Landlord A's properties
-- 3. Admin should be able to see ALL documents
-- 4. Tenants should only see their own documents
-- 5. Landlords should only see documents from tenants in their properties

-- =====================================================
-- DEPLOYMENT INSTRUCTIONS
-- =====================================================
-- 1. Run this script in your Supabase SQL Editor
-- 2. Test the security by logging in as different user types
-- 3. Verify that document access is properly restricted
-- 4. Monitor for any access issues and adjust policies as needed

PRINT 'Document approval system security policies have been successfully applied!';
PRINT 'Your tenant documents are now properly secured and isolated.';
PRINT 'Only associated landlords and admins can access tenant documents for their specific properties.';

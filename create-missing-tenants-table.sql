-- =====================================================
-- CREATE MISSING TENANTS TABLE
-- =====================================================
-- This will create the tenants table and get you to FULLY READY status

-- 1. CREATE TENANTS TABLE
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  unit_id uuid REFERENCES public.units(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending_documents',
  documents jsonb DEFAULT '[]'::jsonb,
  payment_status text DEFAULT 'pending',
  payment_method text,
  payment_receipt text,
  split_rent jsonb DEFAULT '{"enabled": false, "tenants": []}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. ENABLE RLS ON TENANTS TABLE
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 3. CREATE COMPREHENSIVE RLS POLICIES FOR TENANTS TABLE

-- Tenants can view their own records
CREATE POLICY "Tenants can view their own records"
  ON public.tenants FOR SELECT
  USING (auth.uid() = user_id);

-- Tenants can update their own records
CREATE POLICY "Tenants can update their own records"
  ON public.tenants FOR UPDATE
  USING (auth.uid() = user_id);

-- Tenants can create their own records
CREATE POLICY "Tenants can create their own records"
  ON public.tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tenants can delete their own records
CREATE POLICY "Tenants can delete their own records"
  ON public.tenants FOR DELETE
  USING (auth.uid() = user_id);

-- Landlords can view tenants in their properties
CREATE POLICY "Landlords can view their tenants"
  ON public.tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE u.id = tenants.unit_id
      AND (p.owner_id = auth.uid() OR p.landlord_id = auth.uid())
    )
  );

-- Landlords can update tenants in their properties
CREATE POLICY "Landlords can update their tenants"
  ON public.tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE u.id = tenants.unit_id
      AND (p.owner_id = auth.uid() OR p.landlord_id = auth.uid())
    )
  );

-- Landlords can create tenants for their properties
CREATE POLICY "Landlords can create tenants for their properties"
  ON public.tenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE u.id = unit_id
      AND (p.owner_id = auth.uid() OR p.landlord_id = auth.uid())
    )
  );

-- Landlords can delete tenants from their properties
CREATE POLICY "Landlords can delete tenants from their properties"
  ON public.tenants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON p.id = u.property_id
      WHERE u.id = tenants.unit_id
      AND (p.owner_id = auth.uid() OR p.landlord_id = auth.uid())
    )
  );

-- Admins can view all tenants
CREATE POLICY "Admins can view all tenants"
  ON public.tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all tenants
CREATE POLICY "Admins can manage all tenants"
  ON public.tenants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_unit_id ON public.tenants(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON public.tenants(payment_status);

-- 5. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- 6. CREATE TRIGGER FOR UPDATED_AT
CREATE TRIGGER handle_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. VERIFICATION - CHECK IF TENANTS TABLE IS PROPERLY CREATED
SELECT 
  'TENANTS TABLE VERIFICATION' as check_type,
  'Table Exists' as item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tenants') 
    THEN '✅ CREATED'
    ELSE '❌ FAILED'
  END as status
UNION ALL
SELECT 
  'TENANTS TABLE VERIFICATION' as check_type,
  'RLS Enabled' as item,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenants' AND rowsecurity = true) 
    THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
UNION ALL
SELECT 
  'TENANTS TABLE VERIFICATION' as check_type,
  'Policies Created' as item,
  (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tenants') as status
UNION ALL
SELECT 
  'TENANTS TABLE VERIFICATION' as check_type,
  'Indexes Created' as item,
  (SELECT COUNT(*)::text FROM pg_indexes WHERE tablename = 'tenants') as status;

-- 8. FINAL STATUS CHECK - SHOULD NOW BE FULLY READY
SELECT 
  'FINAL STATUS CHECK' as check_type,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'properties', 'units', 'leases', 'tenants', 'documents', 'payments', 'maintenance_tickets')) = 8 AND
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 8 AND
      (SELECT COUNT(*) FROM storage.buckets WHERE public = false) >= 2 AND
      (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 25
    ) THEN '🎉 FULLY READY FOR CUSTOMERS - COMPLETE SAAS PLATFORM'
    ELSE '⚠️ STILL NEEDS WORK - CHECK VERIFICATION ABOVE'
  END as customer_readiness,
  'Run this to confirm you are now fully ready!' as note;

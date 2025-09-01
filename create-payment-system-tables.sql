-- =====================================================
-- CREATE PAYMENT SYSTEM TABLES FOR SPLIT RENT
-- =====================================================
-- This creates the missing tables to support your existing split rent functionality

-- 1. CREATE RENT_SPLITS TABLE
CREATE TABLE IF NOT EXISTS public.rent_splits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  share_percentage decimal(5,2) NOT NULL,
  share_amount decimal(10,2) NOT NULL,
  paid_amount decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_tenant_property UNIQUE (property_id, tenant_id)
);

-- 2. CREATE PROPERTY_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.property_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE UNIQUE,
  split_rent_enabled boolean DEFAULT true,
  payment_methods jsonb DEFAULT '[]'::jsonb,
  late_fee_percentage decimal(5,2) DEFAULT 5.00,
  grace_period_days integer DEFAULT 5,
  auto_reminders boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE ENHANCED PAYMENTS TABLE (if not exists or needs enhancement)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  rent_split_id uuid REFERENCES public.rent_splits(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('rent', 'deposit', 'maintenance', 'late_fee')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  due_date timestamp with time zone NOT NULL,
  paid_date timestamp with time zone,
  stripe_payment_id text,
  receipt_url text,
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. CREATE PAYMENT_METHODS TABLE
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stripe', 'paypal', 'bank_transfer')),
  is_default boolean DEFAULT false,
  is_enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 5. CREATE PAYMENT_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'completed', 'failed', 'refunded')),
  amount_before decimal(10,2),
  amount_after decimal(10,2),
  status_before text,
  status_after text,
  notes text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. ENABLE RLS ON ALL NEW TABLES
ALTER TABLE public.rent_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 7. CREATE COMPREHENSIVE RLS POLICIES FOR RENT_SPLITS

-- Tenants can view their own rent splits
CREATE POLICY "Tenants can view their own rent splits"
  ON public.rent_splits FOR SELECT
  USING (auth.uid() = tenant_id);

-- Landlords can view rent splits for their properties
CREATE POLICY "Landlords can view rent splits for their properties"
  ON public.rent_splits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = rent_splits.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- Landlords can manage rent splits for their properties
CREATE POLICY "Landlords can manage rent splits for their properties"
  ON public.rent_splits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = rent_splits.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- 8. CREATE RLS POLICIES FOR PROPERTY_SETTINGS

-- Landlords can view settings for their properties
CREATE POLICY "Landlords can view property settings"
  ON public.property_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_settings.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- Landlords can manage settings for their properties
CREATE POLICY "Landlords can manage property settings"
  ON public.property_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_settings.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- 9. CREATE RLS POLICIES FOR PAYMENTS

-- Tenants can view their own payments
CREATE POLICY "Tenants can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = tenant_id);

-- Landlords can view payments for their properties
CREATE POLICY "Landlords can view payments for their properties"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = payments.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- Landlords can manage payments for their properties
CREATE POLICY "Landlords can manage payments for their properties"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = payments.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- 10. CREATE RLS POLICIES FOR PAYMENT_METHODS

-- Users can view their own payment methods
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own payment methods
CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- 11. CREATE RLS POLICIES FOR PAYMENT_HISTORY

-- Users can view payment history for payments they have access to
CREATE POLICY "Users can view payment history"
  ON public.payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      WHERE payments.id = payment_history.payment_id
      AND (
        payments.tenant_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.properties
          WHERE properties.id = payments.property_id
          AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
        )
      )
    )
  );

-- 12. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_rent_splits_property_id ON public.rent_splits(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_splits_tenant_id ON public.rent_splits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);

-- 13. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER handle_rent_splits_updated_at
  BEFORE UPDATE ON public.rent_splits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_property_settings_updated_at
  BEFORE UPDATE ON public.property_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 14. VERIFICATION - CHECK IF ALL TABLES ARE CREATED
SELECT 
  'PAYMENT SYSTEM VERIFICATION' as check_type,
  'Rent Splits Table' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rent_splits') 
    THEN '✅ CREATED'
    ELSE '❌ FAILED'
  END as status
UNION ALL
SELECT 
  'PAYMENT SYSTEM VERIFICATION' as check_type,
  'Property Settings Table' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_settings') 
    THEN '✅ CREATED'
    ELSE '❌ FAILED'
  END as status
UNION ALL
SELECT 
  'PAYMENT SYSTEM VERIFICATION' as check_type,
  'Payments Table' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') 
    THEN '✅ CREATED'
    ELSE '❌ FAILED'
  END as status
UNION ALL
SELECT 
  'PAYMENT SYSTEM VERIFICATION' as check_type,
  'Payment Methods Table' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') 
    THEN '✅ CREATED'
    ELSE '❌ FAILED'
  END as status;

-- 15. FINAL STATUS - PAYMENT SYSTEM READY
SELECT 
  'PAYMENT SYSTEM STATUS' as check_type,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('rent_splits', 'property_settings', 'payments', 'payment_methods')) = 4 AND
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('rent_splits', 'property_settings', 'payments', 'payment_methods') AND rowsecurity = true) = 4
    ) THEN '🎉 PAYMENT SYSTEM FULLY READY - SPLIT RENT FUNCTIONALITY ENABLED'
    ELSE '⚠️ PAYMENT SYSTEM NEEDS ATTENTION - CHECK VERIFICATION ABOVE'
  END as payment_system_status,
  'Your existing split rent components can now connect to the database!' as note;

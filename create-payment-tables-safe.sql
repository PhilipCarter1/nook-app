-- =====================================================
-- CREATE PAYMENT SYSTEM TABLES SAFELY
-- =====================================================
-- This script first checks what exists, then creates only what's missing

-- 1. CHECK CURRENT TABLE STRUCTURES
SELECT 
  'CURRENT TABLE STATUS' as check_type,
  'rent_splits' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rent_splits') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
UNION ALL
SELECT 
  'CURRENT TABLE STATUS' as check_type,
  'payments' as table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. CHECK PAYMENTS TABLE STRUCTURE
SELECT 
  'PAYMENTS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- 3. CHECK RENT_SPLITS TABLE STRUCTURE
SELECT 
  'RENT_SPLITS TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'rent_splits'
ORDER BY ordinal_position;

-- 4. CREATE ONLY MISSING TABLES (Safe approach)
-- Create property_settings table if it doesn't exist
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

-- Create payment_methods table if it doesn't exist
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

-- Create payment_history table if it doesn't exist
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

-- 5. SAFELY ADD COLUMNS TO EXISTING TABLES
-- Only add columns if they don't exist and if the table exists
DO $$ 
BEGIN
  -- Check if payments table exists and add columns safely
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    
    -- Add rent_split_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'rent_split_id') THEN
      ALTER TABLE public.payments ADD COLUMN rent_split_id uuid REFERENCES public.rent_splits(id) ON DELETE CASCADE;
    END IF;
    
    -- Add payment_method column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_method') THEN
      ALTER TABLE public.payments ADD COLUMN payment_method text;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'notes') THEN
      ALTER TABLE public.payments ADD COLUMN notes text;
    END IF;
  END IF;
  
  -- Check if rent_splits table exists and add columns safely
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rent_splits') THEN
    
    -- Add share_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rent_splits' AND column_name = 'share_amount') THEN
      ALTER TABLE public.rent_splits ADD COLUMN share_amount decimal(10,2);
    END IF;
    
    -- Add paid_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rent_splits' AND column_name = 'paid_amount') THEN
      ALTER TABLE public.rent_splits ADD COLUMN paid_amount decimal(10,2) DEFAULT 0;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rent_splits' AND column_name = 'status') THEN
      ALTER TABLE public.rent_splits ADD COLUMN status text DEFAULT 'pending';
    END IF;
  END IF;
END $$;

-- 6. ENABLE RLS ON NEW TABLES
ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR NEW TABLES ONLY

-- Property settings policies
CREATE POLICY "Landlords can view property settings"
  ON public.property_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_settings.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Landlords can manage property settings"
  ON public.property_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_settings.property_id
      AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
    )
  );

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment methods"
  ON public.payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view payment history"
  ON public.payment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      WHERE payments.id = payment_history.payment_id
      AND (
        -- Check if user is the tenant
        (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'tenant_id') 
         AND payments.tenant_id = auth.uid()) OR
        -- Check if user is the landlord
        EXISTS (
          SELECT 1 FROM public.properties
          WHERE properties.id = payments.property_id
          AND (properties.owner_id = auth.uid() OR properties.landlord_id = auth.uid())
        )
      )
    )
  );

-- 8. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_property_settings_property_id ON public.property_settings(property_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_id ON public.payment_history(payment_id);

-- 9. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER handle_property_settings_updated_at
  BEFORE UPDATE ON public.property_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. FINAL VERIFICATION
SELECT 
  'FINAL VERIFICATION' as check_type,
  'All Required Tables' as item,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('rent_splits', 'payments', 'property_settings', 'payment_methods', 'payment_history')) = 5
    ) THEN '✅ ALL TABLES EXIST'
    ELSE '⚠️ SOME TABLES MISSING'
  END as status
UNION ALL
SELECT 
  'FINAL VERIFICATION' as check_type,
  'RLS Enabled' as item,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('rent_splits', 'payments', 'property_settings', 'payment_methods', 'payment_history') AND rowsecurity = true) = 5
    ) THEN '✅ ALL TABLES SECURED'
    ELSE '⚠️ SOME TABLES UNSECURED'
  END as status;

-- 11. PAYMENT SYSTEM READY STATUS
SELECT 
  'PAYMENT SYSTEM STATUS' as check_type,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('rent_splits', 'payments', 'property_settings', 'payment_methods', 'payment_history')) = 5 AND
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('rent_splits', 'payments', 'property_settings', 'payment_methods', 'payment_history') AND rowsecurity = true) = 5
    ) THEN '🎉 PAYMENT SYSTEM FULLY READY - SPLIT RENT FUNCTIONALITY ENABLED'
    ELSE '⚠️ PAYMENT SYSTEM NEEDS ATTENTION - CHECK VERIFICATION ABOVE'
  END as payment_system_status,
  'Your existing split rent components can now connect to the database!' as note;

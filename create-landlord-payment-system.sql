-- =====================================================
-- CREATE LANDLORD PAYMENT SYSTEM
-- =====================================================
-- This creates the proper payment system where:
-- 1. Landlords pay YOU for using Nook (subscription)
-- 2. Tenants pay rent directly to landlord's bank account
-- 3. Properties have configurable payment methods
-- 4. Split payment support for shared properties

-- 1. CREATE PROPERTY PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS public.property_payment_methods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN (
    'bank_transfer', 'zelle', 'venmo', 'paypal', 'check', 'cash', 'apple_pay', 'google_pay'
  )),
  name text NOT NULL, -- Display name like "Main Bank Account" or "Zelle Account"
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  details jsonb NOT NULL DEFAULT '{}'::jsonb, -- Payment method specific details
  instructions text, -- Instructions for tenants on how to pay
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(property_id, type, name)
);

-- 2. CREATE PROPERTY PAYMENT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.property_payment_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE UNIQUE NOT NULL,
  split_rent_enabled boolean DEFAULT false,
  split_type text DEFAULT 'equal' CHECK (split_type IN ('equal', 'percentage', 'custom')),
  late_fee_percentage decimal(5,2) DEFAULT 5.00,
  late_fee_fixed_amount decimal(10,2) DEFAULT 0.00,
  grace_period_days integer DEFAULT 5,
  auto_reminders boolean DEFAULT true,
  reminder_days_before_due integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE RENT SPLITS TABLE (for shared properties)
CREATE TABLE IF NOT EXISTS public.rent_splits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  split_amount decimal(10,2) NOT NULL,
  split_percentage decimal(5,2), -- For percentage-based splits
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(property_id, tenant_id)
);

-- 4. UPDATE PAYMENTS TABLE TO SUPPORT NEW SYSTEM
-- Add columns to existing payments table if they don't exist
DO $$ 
BEGIN
  -- Add property_payment_method_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'property_payment_method_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN property_payment_method_id uuid REFERENCES public.property_payment_methods(id);
  END IF;

  -- Add rent_split_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'rent_split_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN rent_split_id uuid REFERENCES public.rent_splits(id);
  END IF;

  -- Add payment_instructions if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'payment_instructions'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN payment_instructions text;
  END IF;

  -- Add payment_reference if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payments' 
    AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN payment_reference text;
  END IF;
END $$;

-- 5. ENABLE RLS ON ALL NEW TABLES
ALTER TABLE public.property_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_splits ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- Property Payment Methods Policies
CREATE POLICY "Landlords can manage payment methods for their properties"
  ON public.property_payment_methods FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view payment methods for their properties"
  ON public.property_payment_methods FOR SELECT
  USING (
    property_id IN (
      SELECT p.id FROM public.properties p
      JOIN public.units u ON u.property_id = p.id
      JOIN public.tenants t ON t.unit_id = u.id
      WHERE t.user_id = auth.uid()
    )
  );

-- Property Payment Settings Policies
CREATE POLICY "Landlords can manage payment settings for their properties"
  ON public.property_payment_settings FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view payment settings for their properties"
  ON public.property_payment_settings FOR SELECT
  USING (
    property_id IN (
      SELECT p.id FROM public.properties p
      JOIN public.units u ON u.property_id = p.id
      JOIN public.tenants t ON t.unit_id = u.id
      WHERE t.user_id = auth.uid()
    )
  );

-- Rent Splits Policies
CREATE POLICY "Landlords can manage rent splits for their properties"
  ON public.rent_splits FOR ALL
  USING (
    property_id IN (
      SELECT id FROM public.properties 
      WHERE owner_id = auth.uid() OR landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can view their own rent splits"
  ON public.rent_splits FOR SELECT
  USING (tenant_id = auth.uid());

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_property_payment_methods_property_id ON public.property_payment_methods(property_id);
CREATE INDEX IF NOT EXISTS idx_property_payment_methods_type ON public.property_payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_property_payment_settings_property_id ON public.property_payment_settings(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_splits_property_id ON public.rent_splits(property_id);
CREATE INDEX IF NOT EXISTS idx_rent_splits_tenant_id ON public.rent_splits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_payment_method_id ON public.payments(property_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payments_rent_split_id ON public.payments(rent_split_id);

-- 8. CREATE TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_payment_methods_updated_at 
  BEFORE UPDATE ON public.property_payment_methods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_payment_settings_updated_at 
  BEFORE UPDATE ON public.property_payment_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rent_splits_updated_at 
  BEFORE UPDATE ON public.rent_splits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. INSERT SAMPLE DATA (Optional - for testing)
-- This creates sample payment methods for existing properties
INSERT INTO public.property_payment_settings (property_id, split_rent_enabled, split_type)
SELECT id, false, 'equal'
FROM public.properties
WHERE id NOT IN (SELECT property_id FROM public.property_payment_settings);

-- 10. VERIFICATION QUERIES
-- Check if all tables were created successfully
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'property_payment_methods', 
    'property_payment_settings', 
    'rent_splits'
  )
ORDER BY tablename;

-- Check all policies on new tables
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('property_payment_methods', 'property_payment_settings', 'rent_splits')
ORDER BY tablename, policyname;

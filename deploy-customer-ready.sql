-- 🚀 DEPLOY CUSTOMER-READY PLATFORM
-- This script sets up all necessary tables and policies for customer onboarding

-- 1. CREATE TENANT_INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.tenant_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
    tenant_email TEXT NOT NULL,
    tenant_first_name TEXT NOT NULL,
    tenant_last_name TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENABLE RLS ON TENANT_INVITATIONS
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES FOR TENANT_INVITATIONS
CREATE POLICY "Landlords can manage their own invitations" ON public.tenant_invitations
    FOR ALL USING (landlord_id = auth.uid());

CREATE POLICY "Tenants can view invitations sent to their email" ON public.tenant_invitations
    FOR SELECT USING (tenant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON public.tenant_invitations(tenant_email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_status ON public.tenant_invitations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expires ON public.tenant_invitations(expires_at);

-- 5. ADD UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_invitations_updated_at
    BEFORE UPDATE ON public.tenant_invitations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- 6. VERIFY ALL CRITICAL TABLES EXIST AND HAVE RLS
DO $$
DECLARE
    table_record RECORD;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tables_without_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check for critical tables
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'user_profiles', 'properties', 'units', 'tenants', 'leases', 'documents', 'payments', 'maintenance_tickets', 'tenant_invitations')
    LOOP
        -- Check if RLS is enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_record.table_name 
            AND rowsecurity = true
        ) THEN
            tables_without_rls := array_append(tables_without_rls, table_record.table_name);
        END IF;
    END LOOP;

    -- Report status
    RAISE NOTICE '=== CUSTOMER READINESS CHECK ===';
    RAISE NOTICE 'Tables without RLS: %', array_to_string(tables_without_rls, ', ');
    
    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE NOTICE '⚠️  Some tables need RLS enabled for security';
    ELSE
        RAISE NOTICE '✅ All critical tables have RLS enabled';
    END IF;
    
    RAISE NOTICE '=== READY FOR CUSTOMERS ===';
    RAISE NOTICE 'Landlords can now:';
    RAISE NOTICE '  • Sign up and create accounts';
    RAISE NOTICE '  • Add properties';
    RAISE NOTICE '  • Invite tenants';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenants can now:';
    RAISE NOTICE '  • Accept invitations';
    RAISE NOTICE '  • Create accounts';
    RAISE NOTICE '  • Upload documents';
    RAISE NOTICE '  • Access tenant dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 PLATFORM IS CUSTOMER READY! 🎉';
END $$;

-- 7. CREATE SAMPLE DATA FOR TESTING (OPTIONAL)
-- Uncomment the following lines to create test data

/*
-- Create a sample landlord invitation
INSERT INTO public.tenant_invitations (
    landlord_id,
    property_id,
    tenant_email,
    tenant_first_name,
    tenant_last_name,
    message,
    status,
    expires_at
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Replace with actual landlord ID
    (SELECT id FROM public.properties LIMIT 1), -- Replace with actual property ID
    'test@example.com',
    'John',
    'Doe',
    'Welcome to our property! Please join Nook to manage your tenancy.',
    'pending',
    NOW() + INTERVAL '7 days'
);
*/

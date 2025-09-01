-- Create tenant_invitations table for tenant onboarding
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

-- Enable RLS
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Landlords can manage their own invitations" ON public.tenant_invitations
    FOR ALL USING (landlord_id = auth.uid());

CREATE POLICY "Tenants can view invitations sent to their email" ON public.tenant_invitations
    FOR SELECT USING (tenant_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON public.tenant_invitations(tenant_email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_status ON public.tenant_invitations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expires ON public.tenant_invitations(expires_at);

-- Add updated_at trigger
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

-- Insert sample invitation for testing (optional)
-- INSERT INTO public.tenant_invitations (
--     landlord_id,
--     property_id,
--     tenant_email,
--     tenant_first_name,
--     tenant_last_name,
--     message,
--     status,
--     expires_at
-- ) VALUES (
--     '550e8400-e29b-41d4-a716-446655440003', -- Replace with actual landlord ID
--     '550e8400-e29b-41d4-a716-446655440020', -- Replace with actual property ID
--     'test@example.com',
--     'John',
--     'Doe',
--     'Welcome to our property! Please join Nook to manage your tenancy.',
--     'pending',
--     NOW() + INTERVAL '7 days'
-- );

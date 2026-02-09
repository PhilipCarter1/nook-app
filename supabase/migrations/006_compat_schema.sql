BEGIN;

-- Ensure common user columns the app expects
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure other tables have timestamps and expected columns
ALTER TABLE IF EXISTS public.properties
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.units
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.leases
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.rent_payments
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS signed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create a table to record processed webhook events (idempotency)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id text PRIMARY KEY,
  event_type text,
  created_at timestamptz DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_stripe_intent ON public.rent_payments (stripe_payment_intent_id);

-- Row Level Security: leases
ALTER TABLE IF EXISTS public.leases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leases_select_own ON public.leases;
CREATE POLICY leases_select_own ON public.leases
  FOR SELECT
  USING (auth.uid()::uuid = tenant_id);

DROP POLICY IF EXISTS leases_update_own ON public.leases;
CREATE POLICY leases_update_own ON public.leases
  FOR UPDATE
  USING (auth.uid()::uuid = tenant_id)
  WITH CHECK (auth.uid()::uuid = tenant_id);

-- Row Level Security: rent_payments (allow tenant associated with lease to view)
ALTER TABLE IF EXISTS public.rent_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rent_payments_select_lease_tenant ON public.rent_payments;
CREATE POLICY rent_payments_select_lease_tenant ON public.rent_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leases l WHERE l.id = lease_id AND l.tenant_id = auth.uid()::uuid
    )
  );

DROP POLICY IF EXISTS rent_payments_update_admin ON public.rent_payments;
CREATE POLICY rent_payments_update_admin ON public.rent_payments
  FOR UPDATE
  USING (false);

-- Row Level Security: documents (allow owner or referenced user)
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS documents_select_owner ON public.documents;
CREATE POLICY documents_select_owner ON public.documents
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- Keep users policies minimal (redeclare to ensure presence)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS users_select_all ON public.users;
CREATE POLICY users_select_all ON public.users
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid()::uuid = id)
  WITH CHECK (auth.uid()::uuid = id);

COMMIT;

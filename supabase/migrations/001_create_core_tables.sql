-- 001_create_core_tables.sql
-- Core tables and RLS policies for Nook MVP

BEGIN;

-- Users (profile) table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'tenant',
  avatar_url text,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Properties (Nook listings)
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Units (individual rentable units)
CREATE TABLE IF NOT EXISTS public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  floor integer DEFAULT 0,
  bedrooms integer DEFAULT 1,
  bathrooms integer DEFAULT 1,
  square_feet integer DEFAULT 0,
  rent_amount numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Leases table
CREATE TABLE IF NOT EXISTS public.leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  rent_amount numeric(10,2) NOT NULL,
  security_deposit numeric(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payments table (used by Stripe webhook and payment flows)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  lease_id uuid REFERENCES public.leases(id) ON DELETE SET NULL,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  amount numeric(10,2),
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  stripe_session_id text,
  stripe_customer_id text,
  payment_intent_id text,
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Payment Subscriptions (for recurring subscriptions)
CREATE TABLE IF NOT EXISTS public.payment_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id text UNIQUE,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security on core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: users table - allow owners to select/update their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING ( auth.uid() = id ) WITH CHECK ( auth.uid() = id );
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING ( auth.uid() = id );

-- Properties: public listings are readable by anyone
CREATE POLICY "properties_select_public" ON public.properties
  FOR SELECT USING ( public = true );

-- Properties: owners and admins can insert/update/delete
CREATE POLICY "properties_manage_by_owner" ON public.properties
  FOR ALL USING ( owner_id = auth.uid() ) WITH CHECK ( owner_id = auth.uid() );

-- Units: anyone can view units for public properties
CREATE POLICY "units_select_public_props" ON public.units
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.public = true)
  );

-- Units: owners (via property owner) can insert/update/delete
CREATE POLICY "units_manage_by_owner" ON public.units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- Leases: tenants can view/update their leases; owners can view leases for units they own
CREATE POLICY "leases_select_tenant_or_owner" ON public.leases
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "leases_insert_by_owner_or_admin" ON public.leases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
  );

CREATE POLICY "leases_update_tenant_or_owner" ON public.leases
  FOR UPDATE USING (
    tenant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
  ) WITH CHECK (
    tenant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE u.id = unit_id AND p.owner_id = auth.uid())
  );

-- Payments: allow owners and tenants to view payments related to them; users can insert payments for their own user id
CREATE POLICY "payments_select_related" ON public.payments
  FOR SELECT USING (
    user_id = auth.uid() OR tenant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE (public.payments.unit_id = u.id) AND p.owner_id = auth.uid())
  );

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK ( user_id = auth.uid() OR tenant_id = auth.uid() );

CREATE POLICY "payments_update_owner_or_tenant" ON public.payments
  FOR UPDATE USING (
    user_id = auth.uid() OR tenant_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id WHERE (public.payments.unit_id = u.id) AND p.owner_id = auth.uid())
  ) WITH CHECK ( user_id = auth.uid() OR tenant_id = auth.uid() );

-- Payment subscriptions: only internal (admin/service role) or related tenant may update via server
CREATE POLICY "payment_subscriptions_select" ON public.payment_subscriptions
  FOR SELECT USING ( true );

COMMIT;

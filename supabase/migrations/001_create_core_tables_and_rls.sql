-- Migration: 001_create_core_tables_and_rls.sql
-- Create core tables and basic RLS policies for production

-- users table (minimal profile)
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  first_name text,
  last_name text,
  role text not null default 'tenant',
  stripe_customer_id text,
  email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  owner_id uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- maintenance_tickets
create table if not exists public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  created_by uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  property_id uuid references public.properties(id) on delete set null,
  unit_id uuid,
  amount numeric,
  currency text default 'usd',
  status text default 'pending',
  payment_intent_id text,
  stripe_session_id text,
  stripe_customer_id text,
  receipt_url text,
  payment_method text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- payment_subscriptions
create table if not exists public.payment_subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique,
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  tenant_id uuid references public.users(id) on delete set null,
  unit_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security on tables
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.payments enable row level security;
alter table public.payment_subscriptions enable row level security;

-- Policies for users: allow users to select their own profile and admins to select all
create policy "users_select_own_or_admin" on public.users for select using (
  auth.role() = 'authenticated' and (id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin()))
);

-- For updates: only admin or the user themself
create policy "users_update_self_or_admin" on public.users for update using (
  id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin())
) with check (id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin()));

-- properties: owners and admins can manage, tenants can select if related via unit ownership (app-level enforced)
create policy "properties_select_authenticated" on public.properties for select using (auth.role() = 'authenticated');
create policy "properties_insert_admin" on public.properties for insert using (exists (select 1 from pg_temp.current_user_is_admin()));
create policy "properties_update_admin_or_owner" on public.properties for update using (owner_id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin()));

-- maintenance_tickets: creators, assigned_to, property owners, and admins can select/update
create policy "tickets_select" on public.maintenance_tickets for select using (
  created_by = auth.uid() or assigned_to = auth.uid() or exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()) or exists (select 1 from pg_temp.current_user_is_admin())
);
create policy "tickets_insert_authenticated" on public.maintenance_tickets for insert using (auth.role() = 'authenticated');
create policy "tickets_update_owner_or_assignee_or_admin" on public.maintenance_tickets for update using (
  created_by = auth.uid() or assigned_to = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin())
);

-- payments: users can select their own payments; admins can manage
create policy "payments_select_own" on public.payments for select using (user_id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin()));
create policy "payments_insert_authenticated" on public.payments for insert using (auth.role() = 'authenticated');
create policy "payments_update_admin" on public.payments for update using (exists (select 1 from pg_temp.current_user_is_admin()));

-- subscriptions: tenant or admin
create policy "subscriptions_select_tenant_or_admin" on public.payment_subscriptions for select using (tenant_id = auth.uid() or exists (select 1 from pg_temp.current_user_is_admin()));
create policy "subscriptions_update_admin" on public.payment_subscriptions for update using (exists (select 1 from pg_temp.current_user_is_admin()));

-- Helper: create pg_temp function to check admin role (for policies that run in Supabase environment you should replace this with proper role checks or use a dedicated 'is_admin' column)
create or replace function pg_temp.current_user_is_admin() returns boolean language sql stable as $$
  select exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin');
$$;

-- NOTE: These are templates. Review and refine policies to fit your exact RBAC and unit ownership models.

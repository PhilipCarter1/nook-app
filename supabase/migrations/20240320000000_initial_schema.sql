-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum ('tenant', 'landlord', 'admin');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
create type ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role not null default 'tenant',
  phone text,
  company_id uuid references public.companies(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create companies table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  phone text,
  email text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create properties table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  units integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create units table
create table public.units (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  number text not null,
  floor integer,
  square_feet numeric,
  bedrooms integer,
  bathrooms numeric,
  rent_amount numeric not null,
  deposit_amount numeric,
  status text not null default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leases table
create table public.leases (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references public.units(id) on delete cascade not null,
  tenant_id uuid references public.users(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  rent_amount numeric not null,
  deposit_amount numeric not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid references public.leases(id) on delete cascade not null,
  amount numeric not null,
  status payment_status not null default 'pending',
  stripe_payment_id text,
  stripe_customer_id text,
  due_date date not null,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance_tickets table
create table public.maintenance_tickets (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references public.units(id) on delete cascade not null,
  tenant_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  assigned_to uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  lease_id uuid references public.leases(id) on delete cascade not null,
  name text not null,
  type text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create feature_flags table
create table public.feature_flags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  enabled boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.leases enable row level security;
alter table public.payments enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.documents enable row level security;
alter table public.feature_flags enable row level security;

-- Create RLS Policies
-- Users policies
create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Companies policies
create policy "Users can view their company data"
  on public.companies for select
  using (auth.uid() in (
    select id from public.users where company_id = companies.id
  ));

-- Properties policies
create policy "Users can view their company's properties"
  on public.properties for select
  using (company_id in (
    select company_id from public.users where id = auth.uid()
  ));

-- Units policies
create policy "Users can view units in their properties"
  on public.units for select
  using (property_id in (
    select id from public.properties where company_id in (
      select company_id from public.users where id = auth.uid()
    )
  ));

-- Leases policies
create policy "Users can view their leases"
  on public.leases for select
  using (tenant_id = auth.uid() or unit_id in (
    select id from public.units where property_id in (
      select id from public.properties where company_id in (
        select company_id from public.users where id = auth.uid()
      )
    )
  ));

-- Payments policies
create policy "Users can view their payments"
  on public.payments for select
  using (lease_id in (
    select id from public.leases where tenant_id = auth.uid() or unit_id in (
      select id from public.units where property_id in (
        select id from public.properties where company_id in (
          select company_id from public.users where id = auth.uid()
        )
      )
    )
  ));

-- Maintenance tickets policies
create policy "Users can view their tickets"
  on public.maintenance_tickets for select
  using (tenant_id = auth.uid() or unit_id in (
    select id from public.units where property_id in (
      select id from public.properties where company_id in (
        select company_id from public.users where id = auth.uid()
      )
    )
  ));

-- Documents policies
create policy "Users can view their documents"
  on public.documents for select
  using (lease_id in (
    select id from public.leases where tenant_id = auth.uid() or unit_id in (
      select id from public.units where property_id in (
        select id from public.properties where company_id in (
          select company_id from public.users where id = auth.uid()
        )
      )
    )
  ));

-- Feature flags policies
create policy "Anyone can view feature flags"
  on public.feature_flags for select
  using (true);

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'tenant');
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes
create index idx_users_company_id on public.users(company_id);
create index idx_properties_company_id on public.properties(company_id);
create index idx_units_property_id on public.units(property_id);
create index idx_leases_unit_id on public.leases(unit_id);
create index idx_leases_tenant_id on public.leases(tenant_id);
create index idx_payments_lease_id on public.payments(lease_id);
create index idx_maintenance_tickets_unit_id on public.maintenance_tickets(unit_id);
create index idx_maintenance_tickets_tenant_id on public.maintenance_tickets(tenant_id);
create index idx_documents_lease_id on public.documents(lease_id); 
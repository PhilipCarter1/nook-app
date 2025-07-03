-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum ('tenant', 'landlord', 'admin', 'super');
create type property_type as enum ('apartment', 'house', 'condo', 'commercial');
create type property_status as enum ('available', 'leased', 'maintenance');
create type lease_status as enum ('pending', 'active', 'expired', 'terminated');
create type maintenance_status as enum ('open', 'in_progress', 'resolved');
create type maintenance_priority as enum ('low', 'medium', 'high');
create type payment_type as enum ('rent', 'deposit', 'maintenance');
create type payment_status as enum ('pending', 'completed', 'failed');
create type document_type as enum ('lease', 'maintenance', 'payment', 'other');
create type notification_type as enum ('payment', 'maintenance', 'lease', 'system');

-- Create users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'tenant',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create properties table
create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  owner_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create units table
create table public.units (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) not null,
  unit_number text not null,
  floor integer not null,
  bedrooms integer not null,
  bathrooms numeric not null,
  square_feet integer not null,
  rent_amount numeric not null,
  status property_status not null default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leases table
create table public.leases (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units(id) not null,
  tenant_id uuid references public.users(id) not null,
  start_date date not null,
  end_date date not null,
  rent_amount numeric not null,
  security_deposit numeric not null,
  status lease_status not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance_tickets table
create table public.maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units(id) not null,
  tenant_id uuid references public.users(id) not null,
  title text not null,
  description text not null,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance_comments table
create table public.maintenance_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.maintenance_tickets(id) not null,
  user_id uuid references public.users(id) not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type document_type not null,
  url text not null,
  size integer not null,
  mime_type text not null,
  related_id uuid not null,
  related_type text not null,
  created_by uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  lease_id uuid references public.leases(id) not null,
  amount numeric not null,
  type payment_type not null,
  status payment_status not null default 'pending',
  due_date date not null,
  paid_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organizations table
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organization_members table
create table public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references public.users(id) not null,
  role user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- Create vendors table
create table public.vendors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create rate_limits table
create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  endpoint text not null,
  count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, endpoint)
);

-- Create audit_logs table
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  action text not null,
  resource_type text not null,
  resource_id uuid not null,
  details jsonb not null,
  ip_address text not null,
  user_agent text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index users_email_idx on public.users(email);
create index properties_owner_id_idx on public.properties(owner_id);
create index units_property_id_idx on public.units(property_id);
create index leases_unit_id_idx on public.leases(unit_id);
create index leases_tenant_id_idx on public.leases(tenant_id);
create index maintenance_tickets_unit_id_idx on public.maintenance_tickets(unit_id);
create index maintenance_tickets_tenant_id_idx on public.maintenance_tickets(tenant_id);
create index maintenance_comments_ticket_id_idx on public.maintenance_comments(ticket_id);
create index documents_related_id_idx on public.documents(related_id);
create index payments_lease_id_idx on public.payments(lease_id);
create index organization_members_organization_id_idx on public.organization_members(organization_id);
create index organization_members_user_id_idx on public.organization_members(user_id);
create index rate_limits_user_id_endpoint_idx on public.rate_limits(user_id, endpoint);
create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_resource_id_idx on public.audit_logs(resource_id);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create updated_at triggers
create trigger handle_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

create trigger handle_properties_updated_at
  before update on public.properties
  for each row
  execute function public.handle_updated_at();

create trigger handle_units_updated_at
  before update on public.units
  for each row
  execute function public.handle_updated_at();

create trigger handle_leases_updated_at
  before update on public.leases
  for each row
  execute function public.handle_updated_at();

create trigger handle_maintenance_tickets_updated_at
  before update on public.maintenance_tickets
  for each row
  execute function public.handle_updated_at();

create trigger handle_maintenance_comments_updated_at
  before update on public.maintenance_comments
  for each row
  execute function public.handle_updated_at();

create trigger handle_documents_updated_at
  before update on public.documents
  for each row
  execute function public.handle_updated_at();

create trigger handle_payments_updated_at
  before update on public.payments
  for each row
  execute function public.handle_updated_at();

create trigger handle_organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.handle_updated_at();

create trigger handle_organization_members_updated_at
  before update on public.organization_members
  for each row
  execute function public.handle_updated_at();

create trigger handle_vendors_updated_at
  before update on public.vendors
  for each row
  execute function public.handle_updated_at();

create trigger handle_rate_limits_updated_at
  before update on public.rate_limits
  for each row
  execute function public.handle_updated_at();

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.leases enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.maintenance_comments enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.vendors enable row level security;
alter table public.rate_limits enable row level security;
alter table public.audit_logs enable row level security;

-- Create RLS policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Landlords can view their properties"
  on public.properties for select
  using (auth.uid() = owner_id);

create policy "Landlords can manage their properties"
  on public.properties for all
  using (auth.uid() = owner_id);

create policy "Tenants can view their units"
  on public.units for select
  using (
    exists (
      select 1 from public.leases
      where leases.unit_id = units.id
      and leases.tenant_id = auth.uid()
    )
  );

create policy "Landlords can manage their units"
  on public.units for all
  using (
    exists (
      select 1 from public.properties
      where properties.id = units.property_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can view their leases"
  on public.leases for select
  using (tenant_id = auth.uid());

create policy "Landlords can manage leases"
  on public.leases for all
  using (
    exists (
      select 1 from public.units
      join public.properties on properties.id = units.property_id
      where units.id = leases.unit_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Tenants can view their maintenance tickets"
  on public.maintenance_tickets for select
  using (tenant_id = auth.uid());

create policy "Tenants can create maintenance tickets"
  on public.maintenance_tickets for insert
  with check (tenant_id = auth.uid());

create policy "Landlords can manage maintenance tickets"
  on public.maintenance_tickets for all
  using (
    exists (
      select 1 from public.units
      join public.properties on properties.id = units.property_id
      where units.id = maintenance_tickets.unit_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Users can view maintenance comments"
  on public.maintenance_comments for select
  using (
    exists (
      select 1 from public.maintenance_tickets
      where maintenance_tickets.id = maintenance_comments.ticket_id
      and (
        maintenance_tickets.tenant_id = auth.uid()
        or exists (
          select 1 from public.units
          join public.properties on properties.id = units.property_id
          where units.id = maintenance_tickets.unit_id
          and properties.owner_id = auth.uid()
        )
      )
    )
  );

create policy "Users can create maintenance comments"
  on public.maintenance_comments for insert
  with check (user_id = auth.uid());

create policy "Users can view their documents"
  on public.documents for select
  using (created_by = auth.uid());

create policy "Users can manage their documents"
  on public.documents for all
  using (created_by = auth.uid());

create policy "Tenants can view their payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.leases
      where leases.id = payments.lease_id
      and leases.tenant_id = auth.uid()
    )
  );

create policy "Landlords can manage payments"
  on public.payments for all
  using (
    exists (
      select 1 from public.leases
      join public.units on units.id = leases.unit_id
      join public.properties on properties.id = units.property_id
      where leases.id = payments.lease_id
      and properties.owner_id = auth.uid()
    )
  );

create policy "Organization members can view their organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );

create policy "Organization admins can manage their organization"
  on public.organizations for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
    )
  );

create policy "Organization members can view members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
  );

create policy "Organization admins can manage members"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organization_members as om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role = 'admin'
    )
  );

create policy "Landlords can manage vendors"
  on public.vendors for all
  using (
    exists (
      select 1 from public.properties
      where properties.owner_id = auth.uid()
    )
  );

create policy "System can manage rate limits"
  on public.rate_limits for all
  using (true);

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'admin'
    )
  ); 
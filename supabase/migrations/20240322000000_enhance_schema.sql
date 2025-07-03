-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table if it doesn't exist
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    name text not null,
    role text not null check (role in ('tenant', 'landlord', 'admin', 'super')),
    property_id uuid,
    avatar_url text,
    phone text,
    email_verified boolean default false,
    last_login timestamp with time zone,
    password_reset_token text,
    password_reset_expires timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create properties table if it doesn't exist
create table if not exists properties (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    address text not null,
    type text not null check (type in ('apartment', 'house', 'condo', 'commercial')),
    units integer not null,
    landlord_id uuid references users(id),
    status text not null check (status in ('available', 'leased', 'maintenance')),
    monthly_rent numeric not null,
    security_deposit numeric not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create leases table if it doesn't exist
create table if not exists leases (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    tenant_id uuid references users(id) on delete cascade,
    start_date date not null,
    end_date date not null,
    status text not null check (status in ('pending', 'active', 'expired', 'terminated')),
    monthly_rent numeric not null,
    security_deposit numeric not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create property_amenities table
create table if not exists property_amenities (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create property_media table
create table if not exists property_media (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    type text not null check (type in ('image', 'video', 'document')),
    url text not null,
    title text,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create lease_documents table
create table if not exists lease_documents (
    id uuid primary key default uuid_generate_v4(),
    lease_id uuid references leases(id) on delete cascade,
    version integer not null,
    document_url text not null,
    status text not null check (status in ('draft', 'pending', 'approved', 'rejected')),
    created_by uuid references users(id),
    approved_by uuid references users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create lease_renewals table
create table if not exists lease_renewals (
    id uuid primary key default uuid_generate_v4(),
    lease_id uuid references leases(id) on delete cascade,
    new_start_date date not null,
    new_end_date date not null,
    status text not null check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create maintenance_schedule table
create table if not exists maintenance_schedule (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    title text not null,
    description text,
    frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    last_performed timestamp with time zone,
    next_due timestamp with time zone,
    assigned_to uuid references users(id),help 
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create maintenance_history table
create table if not exists maintenance_history (
    id uuid primary key default uuid_generate_v4(),
    schedule_id uuid references maintenance_schedule(id) on delete cascade,
    performed_by uuid references users(id),
    performed_at timestamp with time zone not null,
    notes text,
    created_at timestamp with time zone default now()
);

-- Create payments table if it doesn't exist
create table if not exists payments (
    id uuid primary key default uuid_generate_v4(),
    lease_id uuid references leases(id) on delete cascade,
    amount numeric not null,
    type text not null check (type in ('rent', 'deposit', 'maintenance')),
    status text not null check (status in ('pending', 'completed', 'failed')),
    due_date date not null,
    paid_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create payment_receipts table
create table if not exists payment_receipts (
    id uuid primary key default uuid_generate_v4(),
    payment_id uuid references payments(id) on delete cascade,
    receipt_number text not null unique,
    receipt_url text not null,
    created_at timestamp with time zone default now()
);

-- Create late_fees table
create table if not exists late_fees (
    id uuid primary key default uuid_generate_v4(),
    payment_id uuid references payments(id) on delete cascade,
    amount numeric not null,
    days_late integer not null,
    status text not null check (status in ('pending', 'paid', 'waived')),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS on all tables
do $$ 
begin
    -- Enable RLS on all tables if not already enabled
    if not exists (select 1 from pg_tables where tablename = 'users' and rowsecurity = true) then
        alter table users enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'properties' and rowsecurity = true) then
        alter table properties enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'units' and rowsecurity = true) then
        alter table units enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'leases' and rowsecurity = true) then
        alter table leases enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'maintenance_tickets' and rowsecurity = true) then
        alter table maintenance_tickets enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'maintenance_comments' and rowsecurity = true) then
        alter table maintenance_comments enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'documents' and rowsecurity = true) then
        alter table documents enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'payments' and rowsecurity = true) then
        alter table payments enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'organizations' and rowsecurity = true) then
        alter table organizations enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'organization_members' and rowsecurity = true) then
        alter table organization_members enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'vendors' and rowsecurity = true) then
        alter table vendors enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'rate_limits' and rowsecurity = true) then
        alter table rate_limits enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'audit_logs' and rowsecurity = true) then
        alter table audit_logs enable row level security;
    end if;
end $$;

-- Create policies for each table
do $$ 
begin
    -- Users policies
    if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'Users can view their own profile') then
        create policy "Users can view their own profile"
            on users for select
            using (auth.uid() = id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'Users can update their own profile') then
        create policy "Users can update their own profile"
            on users for update
            using (auth.uid() = id);
    end if;

    -- Properties policies
    if not exists (select 1 from pg_policies where tablename = 'properties' and policyname = 'Property access based on role') then
        create policy "Property access based on role"
            on properties for all
            using (
                -- Landlords can access their own properties
                (landlord_id = auth.uid())
                or
                -- Tenants can view properties they rent
                exists (
                    select 1 from leases
                    where property_id = properties.id
                    and tenant_id = auth.uid()
                )
                or
                -- Vendors can view properties they service
                exists (
                    select 1 from maintenance_tickets
                    where property_id = properties.id
                    and vendor_id = auth.uid()
                )
                or
                -- Organization members can access their org's properties
                exists (
                    select 1 from organization_members om
                    join organizations o on o.id = om.organization_id
                    where o.id = properties.organization_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Units policies
    if not exists (select 1 from pg_policies where tablename = 'units' and policyname = 'Unit access based on role') then
        create policy "Unit access based on role"
            on units for all
            using (
                -- Landlords can access units in their properties
                exists (
                    select 1 from properties
                    where id = units.property_id
                    and landlord_id = auth.uid()
                )
                or
                -- Tenants can view their units
                exists (
                    select 1 from leases
                    where unit_id = units.id
                    and tenant_id = auth.uid()
                )
                or
                -- Organization members can access their org's units
                exists (
                    select 1 from properties p
                    join organization_members om on om.organization_id = p.organization_id
                    where p.id = units.property_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Leases policies
    if not exists (select 1 from pg_policies where tablename = 'leases' and policyname = 'Lease access based on role') then
        create policy "Lease access based on role"
            on leases for all
            using (
                -- Tenants can view their leases
                tenant_id = auth.uid()
                or
                -- Landlords can access leases for their properties
                exists (
                    select 1 from properties
                    where id = leases.property_id
                    and landlord_id = auth.uid()
                )
                or
                -- Organization members can access their org's leases
                exists (
                    select 1 from properties p
                    join organization_members om on om.organization_id = p.organization_id
                    where p.id = leases.property_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Maintenance tickets policies
    if not exists (select 1 from pg_policies where tablename = 'maintenance_tickets' and policyname = 'Maintenance ticket access based on role') then
        create policy "Maintenance ticket access based on role"
            on maintenance_tickets for all
            using (
                -- Tenants can view and create their tickets
                tenant_id = auth.uid()
                or
                -- Landlords can access tickets for their properties
                exists (
                    select 1 from properties
                    where id = maintenance_tickets.property_id
                    and landlord_id = auth.uid()
                )
                or
                -- Vendors can access assigned tickets
                vendor_id = auth.uid()
                or
                -- Organization members can access their org's tickets
                exists (
                    select 1 from properties p
                    join organization_members om on om.organization_id = p.organization_id
                    where p.id = maintenance_tickets.property_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Documents policies
    if not exists (select 1 from pg_policies where tablename = 'documents' and policyname = 'Document access based on role') then
        create policy "Document access based on role"
            on documents for all
            using (
                -- Users can access their own documents
                user_id = auth.uid()
                or
                -- Landlords can access documents for their properties
                exists (
                    select 1 from properties
                    where id = documents.property_id
                    and landlord_id = auth.uid()
                )
                or
                -- Tenants can access documents for their units
                exists (
                    select 1 from leases
                    where unit_id = documents.unit_id
                    and tenant_id = auth.uid()
                )
                or
                -- Organization members can access their org's documents
                exists (
                    select 1 from properties p
                    join organization_members om on om.organization_id = p.organization_id
                    where p.id = documents.property_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Payments policies
    if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'Payment access based on role') then
        create policy "Payment access based on role"
            on payments for all
            using (
                -- Tenants can view their payments
                tenant_id = auth.uid()
                or
                -- Landlords can access payments for their properties
                exists (
                    select 1 from properties
                    where id = payments.property_id
                    and landlord_id = auth.uid()
                )
                or
                -- Organization members can access their org's payments
                exists (
                    select 1 from properties p
                    join organization_members om on om.organization_id = p.organization_id
                    where p.id = payments.property_id
                    and om.user_id = auth.uid()
                )
            );
    end if;

    -- Organizations policies
    if not exists (select 1 from pg_policies where tablename = 'organizations' and policyname = 'Organization access based on membership') then
        create policy "Organization access based on membership"
            on organizations for all
            using (
                -- Organization members can access their org
                exists (
                    select 1 from organization_members
                    where organization_id = organizations.id
                    and user_id = auth.uid()
                )
            );
    end if;

    -- Organization members policies
    if not exists (select 1 from pg_policies where tablename = 'organization_members' and policyname = 'Organization member access based on role') then
        create policy "Organization member access based on role"
            on organization_members for all
            using (
                -- Users can view their own memberships
                user_id = auth.uid()
                or
                -- Organization admins can manage members
                exists (
                    select 1 from organization_members om
                    where om.organization_id = organization_members.organization_id
                    and om.user_id = auth.uid()
                    and om.role = 'admin'
                )
            );
    end if;

    -- Vendors policies
    if not exists (select 1 from pg_policies where tablename = 'vendors' and policyname = 'Vendor access based on role') then
        create policy "Vendor access based on role"
            on vendors for all
            using (
                -- Vendors can view their own profile
                id = auth.uid()
                or
                -- Landlords can view vendors
                exists (
                    select 1 from organization_members om
                    join organizations o on o.id = om.organization_id
                    where om.user_id = auth.uid()
                    and om.role in ('admin', 'landlord')
                )
            );
    end if;

    -- Rate limits policies
    if not exists (select 1 from pg_policies where tablename = 'rate_limits' and policyname = 'Rate limit access based on role') then
        create policy "Rate limit access based on role"
            on rate_limits for all
            using (
                -- Users can view their own rate limits
                user_id = auth.uid()
                or
                -- Admins can view all rate limits
                exists (
                    select 1 from users
                    where id = auth.uid()
                    and role = 'admin'
                )
            );
    end if;

    -- Audit logs policies
    if not exists (select 1 from pg_policies where tablename = 'audit_logs' and policyname = 'Audit log access based on role') then
        create policy "Audit log access based on role"
            on audit_logs for all
            using (
                -- Users can view their own audit logs
                user_id = auth.uid()
                or
                -- Admins can view all audit logs
                exists (
                    select 1 from users
                    where id = auth.uid()
                    and role = 'admin'
                )
            );
    end if;
end $$; 
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
    assigned_to uuid references users(id),
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
    -- Enable RLS on tables if not already enabled
    if not exists (select 1 from pg_tables where tablename = 'users' and rowsecurity = true) then
        alter table users enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'properties' and rowsecurity = true) then
        alter table properties enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'leases' and rowsecurity = true) then
        alter table leases enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'property_amenities' and rowsecurity = true) then
        alter table property_amenities enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'property_media' and rowsecurity = true) then
        alter table property_media enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'lease_documents' and rowsecurity = true) then
        alter table lease_documents enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'lease_renewals' and rowsecurity = true) then
        alter table lease_renewals enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'maintenance_schedule' and rowsecurity = true) then
        alter table maintenance_schedule enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'maintenance_history' and rowsecurity = true) then
        alter table maintenance_history enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'payments' and rowsecurity = true) then
        alter table payments enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'payment_receipts' and rowsecurity = true) then
        alter table payment_receipts enable row level security;
    end if;
    
    if not exists (select 1 from pg_tables where tablename = 'late_fees' and rowsecurity = true) then
        alter table late_fees enable row level security;
    end if;
end $$;

-- Create policies if they don't exist
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
    if not exists (select 1 from pg_policies where tablename = 'properties' and policyname = 'Users can view properties they own or rent') then
        create policy "Users can view properties they own or rent"
            on properties for select
            using (
                landlord_id = auth.uid()
                or exists (
                    select 1 from leases
                    where property_id = properties.id
                    and tenant_id = auth.uid()
                )
            );
    end if;

    -- Leases policies
    if not exists (select 1 from pg_policies where tablename = 'leases' and policyname = 'Users can view their leases') then
        create policy "Users can view their leases"
            on leases for select
            using (
                tenant_id = auth.uid()
                or exists (
                    select 1 from properties
                    where id = leases.property_id
                    and landlord_id = auth.uid()
                )
            );
    end if;

    -- Property amenities policies
    if not exists (select 1 from pg_policies where tablename = 'property_amenities' and policyname = 'Users can view property amenities') then
        create policy "Users can view property amenities"
            on property_amenities for select
            using (
                exists (
                    select 1 from properties p
                    where p.id = property_amenities.property_id
                    and (
                        p.landlord_id = auth.uid()
                        or exists (
                            select 1 from leases l
                            where l.property_id = p.id
                            and l.tenant_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Property media policies
    if not exists (select 1 from pg_policies where tablename = 'property_media' and policyname = 'Users can view property media') then
        create policy "Users can view property media"
            on property_media for select
            using (
                exists (
                    select 1 from properties p
                    where p.id = property_media.property_id
                    and (
                        p.landlord_id = auth.uid()
                        or exists (
                            select 1 from leases l
                            where l.property_id = p.id
                            and l.tenant_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Lease documents policies
    if not exists (select 1 from pg_policies where tablename = 'lease_documents' and policyname = 'Users can view lease documents') then
        create policy "Users can view lease documents"
            on lease_documents for select
            using (
                exists (
                    select 1 from leases l
                    where l.id = lease_documents.lease_id
                    and (
                        l.tenant_id = auth.uid()
                        or exists (
                            select 1 from properties p
                            where p.id = l.property_id
                            and p.landlord_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Lease renewals policies
    if not exists (select 1 from pg_policies where tablename = 'lease_renewals' and policyname = 'Users can view lease renewals') then
        create policy "Users can view lease renewals"
            on lease_renewals for select
            using (
                exists (
                    select 1 from leases l
                    where l.id = lease_renewals.lease_id
                    and (
                        l.tenant_id = auth.uid()
                        or exists (
                            select 1 from properties p
                            where p.id = l.property_id
                            and p.landlord_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Maintenance schedule policies
    if not exists (select 1 from pg_policies where tablename = 'maintenance_schedule' and policyname = 'Users can view maintenance schedule') then
        create policy "Users can view maintenance schedule"
            on maintenance_schedule for select
            using (
                exists (
                    select 1 from properties p
                    where p.id = maintenance_schedule.property_id
                    and (
                        p.landlord_id = auth.uid()
                        or exists (
                            select 1 from leases l
                            where l.property_id = p.id
                            and l.tenant_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Maintenance history policies
    if not exists (select 1 from pg_policies where tablename = 'maintenance_history' and policyname = 'Users can view maintenance history') then
        create policy "Users can view maintenance history"
            on maintenance_history for select
            using (
                exists (
                    select 1 from maintenance_schedule ms
                    join properties p on p.id = ms.property_id
                    where ms.id = maintenance_history.schedule_id
                    and (
                        p.landlord_id = auth.uid()
                        or exists (
                            select 1 from leases l
                            where l.property_id = p.id
                            and l.tenant_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Payments policies
    if not exists (select 1 from pg_policies where tablename = 'payments' and policyname = 'Users can view their payments') then
        create policy "Users can view their payments"
            on payments for select
            using (
                exists (
                    select 1 from leases l
                    where l.id = payments.lease_id
                    and (
                        l.tenant_id = auth.uid()
                        or exists (
                            select 1 from properties p
                            where p.id = l.property_id
                            and p.landlord_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Payment receipts policies
    if not exists (select 1 from pg_policies where tablename = 'payment_receipts' and policyname = 'Users can view payment receipts') then
        create policy "Users can view payment receipts"
            on payment_receipts for select
            using (
                exists (
                    select 1 from payments p
                    join leases l on l.id = p.lease_id
                    where p.id = payment_receipts.payment_id
                    and (
                        l.tenant_id = auth.uid()
                        or exists (
                            select 1 from properties pr
                            where pr.id = l.property_id
                            and pr.landlord_id = auth.uid()
                        )
                    )
                )
            );
    end if;

    -- Late fees policies
    if not exists (select 1 from pg_policies where tablename = 'late_fees' and policyname = 'Users can view late fees') then
        create policy "Users can view late fees"
            on late_fees for select
            using (
                exists (
                    select 1 from payments p
                    join leases l on l.id = p.lease_id
                    where p.id = late_fees.payment_id
                    and (
                        l.tenant_id = auth.uid()
                        or exists (
                            select 1 from properties pr
                            where pr.id = l.property_id
                            and pr.landlord_id = auth.uid()
                        )
                    )
                )
            );
    end if;
end $$; 
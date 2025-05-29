-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type maintenance_priority as enum ('low', 'medium', 'high');
create type maintenance_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type payment_status as enum ('pending', 'completed', 'failed');
create type subscription_tier as enum ('free', 'premium', 'enterprise');

-- Create maintenance_tickets table
create table maintenance_tickets (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    tenant_id uuid references users(id) on delete cascade,
    title text not null,
    description text not null,
    priority maintenance_priority not null default 'medium',
    status maintenance_status not null default 'open',
    scheduled_date timestamp with time zone,
    media_urls text[] default '{}',
    response_time text,
    assigned_to uuid references users(id),
    cost decimal(10,2),
    completed_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create maintenance_comments table
create table maintenance_comments (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references maintenance_tickets(id) on delete cascade,
    user_id uuid references users(id) on delete cascade,
    comment text not null,
    media_urls text[] default '{}',
    created_at timestamp with time zone default now()
);

-- Create rent_splits table
create table rent_splits (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    tenant_id uuid references users(id) on delete cascade,
    share_percentage decimal(5,2) not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint unique_tenant_property unique (property_id, tenant_id)
);

-- Create payments table
create table payments (
    id uuid primary key default uuid_generate_v4(),
    property_id uuid references properties(id) on delete cascade,
    tenant_id uuid references users(id) on delete cascade,
    amount decimal(10,2) not null,
    type text not null,
    status payment_status not null default 'pending',
    due_date timestamp with time zone not null,
    paid_date timestamp with time zone,
    stripe_payment_id text,
    receipt_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create subscriptions table
create table subscriptions (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete cascade,
    tier subscription_tier not null default 'free',
    stripe_customer_id text,
    stripe_subscription_id text,
    status text not null default 'active',
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create RLS policies
alter table maintenance_tickets enable row level security;
alter table maintenance_comments enable row level security;
alter table rent_splits enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;

-- Maintenance tickets policies
create policy "Tenants can view their own maintenance tickets"
    on maintenance_tickets for select
    using (auth.uid() = tenant_id);

create policy "Landlords can view all maintenance tickets for their properties"
    on maintenance_tickets for select
    using (
        exists (
            select 1 from properties
            where properties.id = maintenance_tickets.property_id
            and properties.landlord_id = auth.uid()
        )
    );

create policy "Tenants can create maintenance tickets"
    on maintenance_tickets for insert
    with check (auth.uid() = tenant_id);

create policy "Landlords can update maintenance tickets"
    on maintenance_tickets for update
    using (
        exists (
            select 1 from properties
            where properties.id = maintenance_tickets.property_id
            and properties.landlord_id = auth.uid()
        )
    );

-- Rent splits policies
create policy "Tenants can view their own rent splits"
    on rent_splits for select
    using (auth.uid() = tenant_id);

create policy "Landlords can view all rent splits for their properties"
    on rent_splits for select
    using (
        exists (
            select 1 from properties
            where properties.id = rent_splits.property_id
            and properties.landlord_id = auth.uid()
        )
    );

create policy "Landlords can manage rent splits"
    on rent_splits for all
    using (
        exists (
            select 1 from properties
            where properties.id = rent_splits.property_id
            and properties.landlord_id = auth.uid()
        )
    );

-- Payments policies
create policy "Tenants can view their own payments"
    on payments for select
    using (auth.uid() = tenant_id);

create policy "Landlords can view all payments for their properties"
    on payments for select
    using (
        exists (
            select 1 from properties
            where properties.id = payments.property_id
            and properties.landlord_id = auth.uid()
        )
    );

create policy "Tenants can create payments"
    on payments for insert
    with check (auth.uid() = tenant_id);

-- Create indexes
create index idx_maintenance_tickets_property on maintenance_tickets(property_id);
create index idx_maintenance_tickets_tenant on maintenance_tickets(tenant_id);
create index idx_maintenance_tickets_status on maintenance_tickets(status);
create index idx_rent_splits_property on rent_splits(property_id);
create index idx_rent_splits_tenant on rent_splits(tenant_id);
create index idx_payments_property on payments(property_id);
create index idx_payments_tenant on payments(tenant_id);
create index idx_payments_status on payments(status);
create index idx_subscriptions_user on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(status); 
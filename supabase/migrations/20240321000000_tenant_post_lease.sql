-- Create leases table
create table public.leases (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units not null,
  tenant_id uuid references public.tenants not null,
  start_date date not null,
  end_date date not null,
  monthly_rent decimal(10,2) not null,
  security_deposit decimal(10,2) not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create maintenance_tickets table
create table public.maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references public.units not null,
  tenant_id uuid references public.tenants not null,
  title text not null,
  description text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  assigned_to uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create maintenance_comments table
create table public.maintenance_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.maintenance_tickets not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create RLS policies for leases
alter table public.leases enable row level security;

create policy "Tenants can view their own leases"
  on public.leases for select
  using (
    tenant_id in (
      select id from public.tenants
      where user_id = auth.uid()
    )
  );

-- Create RLS policies for maintenance_tickets
alter table public.maintenance_tickets enable row level security;

create policy "Tenants can view their own tickets"
  on public.maintenance_tickets for select
  using (
    tenant_id in (
      select id from public.tenants
      where user_id = auth.uid()
    )
  );

create policy "Tenants can create tickets"
  on public.maintenance_tickets for insert
  with check (
    tenant_id in (
      select id from public.tenants
      where user_id = auth.uid()
    )
  );

create policy "Tenants can update their own tickets"
  on public.maintenance_tickets for update
  using (
    tenant_id in (
      select id from public.tenants
      where user_id = auth.uid()
    )
  );

-- Create RLS policies for maintenance_comments
alter table public.maintenance_comments enable row level security;

create policy "Tenants can view ticket comments"
  on public.maintenance_comments for select
  using (
    ticket_id in (
      select id from public.maintenance_tickets
      where tenant_id in (
        select id from public.tenants
        where user_id = auth.uid()
      )
    )
  );

create policy "Tenants can create comments"
  on public.maintenance_comments for insert
  with check (auth.uid() = user_id);

-- Create updated_at triggers
create trigger handle_leases_updated_at
  before update on public.leases
  for each row
  execute function public.handle_updated_at();

create trigger handle_maintenance_tickets_updated_at
  before update on public.maintenance_tickets
  for each row
  execute function public.handle_updated_at(); 
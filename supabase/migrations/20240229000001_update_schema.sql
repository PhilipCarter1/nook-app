-- Update users table
alter table users
add column if not exists client_id uuid references clients(id),
add column if not exists avatar_url text;

-- Update properties table
alter table properties
add column if not exists landlord_id uuid references users(id);

-- Update payments table
alter table payments
add column if not exists type payment_type,
add column if not exists method payment_method,
add column if not exists due_date timestamp with time zone,
add column if not exists paid_at timestamp with time zone;

-- Update maintenance_tickets table
alter table maintenance_tickets
add column if not exists priority ticket_priority,
add column if not exists created_by uuid references users(id),
add column if not exists assigned_to uuid references users(id),
add column if not exists upvotes integer default 0;

-- Create units table
create table if not exists units (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) not null,
  unit_number text not null,
  floor integer not null,
  square_feet integer not null,
  bedrooms integer not null,
  bathrooms decimal(3,1) not null,
  rent_amount decimal(10,2) not null,
  status text not null default 'vacant',
  tenant_id uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references maintenance_tickets(id) not null,
  user_id uuid references users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table users enable row level security;
alter table clients enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table maintenance_tickets enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table comments enable row level security;

-- Users policies
create policy "Users can view their own profile"
  on users for select
  using (auth.uid() = id);

create policy "Admins can view all users"
  on users for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Clients policies
create policy "Users can view their client"
  on clients for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and client_id = clients.id
    )
  );

-- Properties policies
create policy "Users can view properties they are associated with"
  on properties for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and (
        role = 'admin' or
        (role = 'landlord' and properties.landlord_id = users.id) or
        (role = 'tenant' and exists (
          select 1 from units
          where units.property_id = properties.id and units.tenant_id = users.id
        ))
      )
    )
  );

-- Units policies
create policy "Users can view units they are associated with"
  on units for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and (
        role = 'admin' or
        (role = 'landlord' and exists (
          select 1 from properties
          where properties.id = units.property_id and properties.landlord_id = users.id
        )) or
        (role = 'tenant' and units.tenant_id = users.id)
      )
    )
  );

-- Maintenance tickets policies
create policy "Users can view tickets they are associated with"
  on maintenance_tickets for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and (
        role = 'admin' or
        created_by = users.id or
        assigned_to = users.id or
        exists (
          select 1 from units
          where units.property_id = maintenance_tickets.property_id and units.tenant_id = users.id
        )
      )
    )
  );

-- Documents policies
create policy "Users can view documents they are associated with"
  on documents for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and (
        role = 'admin' or
        uploaded_by = users.id or
        approved_by = users.id or
        exists (
          select 1 from units
          where units.property_id = documents.property_id and units.tenant_id = users.id
        )
      )
    )
  );

-- Payments policies
create policy "Users can view payments they are associated with"
  on payments for select
  using (
    exists (
      select 1 from users
      where id = auth.uid() and (
        role = 'admin' or
        user_id = users.id or
        exists (
          select 1 from properties
          where properties.id = payments.property_id and properties.landlord_id = users.id
        )
      )
    )
  );

-- Comments policies
create policy "Users can view comments on tickets they can view"
  on comments for select
  using (
    exists (
      select 1 from maintenance_tickets
      where maintenance_tickets.id = comments.ticket_id
    )
  ); 
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('tenant', 'landlord', 'builder', 'admin');
create type ticket_status as enum ('open', 'in_progress', 'resolved');
create type ticket_priority as enum ('low', 'medium', 'high');
create type document_status as enum ('pending', 'approved', 'rejected');
create type payment_status as enum ('pending', 'paid', 'failed');
create type payment_method as enum ('stripe', 'paypal', 'bank_transfer');
create type payment_type as enum ('rent', 'deposit');

-- Create clients table
create table clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  config jsonb not null default '{"features": {"legalAssistant": false, "concierge": false, "customBranding": false}}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text not null,
  role user_role not null,
  client_id uuid references clients(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create properties table
create table properties (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) not null,
  name text not null,
  address text not null,
  units integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance_tickets table
create table maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) not null,
  title text not null,
  description text not null,
  status ticket_status not null default 'open',
  priority ticket_priority not null,
  created_by uuid references users(id) not null,
  assigned_to uuid references users(id),
  upvotes integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table documents (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) not null,
  name text not null,
  type text not null,
  status document_status not null default 'pending',
  uploaded_by uuid references users(id) not null,
  approved_by uuid references users(id),
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table payments (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) not null,
  user_id uuid references users(id) not null,
  type payment_type not null,
  amount decimal(10,2) not null,
  status payment_status not null default 'pending',
  method payment_method not null,
  due_date timestamp with time zone not null,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references maintenance_tickets(id) not null,
  user_id uuid references users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index idx_users_client_id on users(client_id);
create index idx_properties_client_id on properties(client_id);
create index idx_tickets_property_id on maintenance_tickets(property_id);
create index idx_documents_property_id on documents(property_id);
create index idx_payments_property_id on payments(property_id);
create index idx_comments_ticket_id on comments(ticket_id);

-- Enable Row Level Security (RLS)
alter table clients enable row level security;
alter table users enable row level security;
alter table properties enable row level security;
alter table maintenance_tickets enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table comments enable row level security;

-- Create RLS policies
create policy "Clients are viewable by their users" on clients
  for select using (
    auth.uid() in (
      select id from users where client_id = clients.id
    )
  );

create policy "Users can view their own client's users" on users
  for select using (
    client_id in (
      select client_id from users where id = auth.uid()
    )
  );

create policy "Users can view their own client's properties" on properties
  for select using (
    client_id in (
      select client_id from users where id = auth.uid()
    )
  );

create policy "Users can view their own client's tickets" on maintenance_tickets
  for select using (
    property_id in (
      select id from properties where client_id in (
        select client_id from users where id = auth.uid()
      )
    )
  );

create policy "Users can view their own client's documents" on documents
  for select using (
    property_id in (
      select id from properties where client_id in (
        select client_id from users where id = auth.uid()
      )
    )
  );

create policy "Users can view their own client's payments" on payments
  for select using (
    property_id in (
      select id from properties where client_id in (
        select client_id from users where id = auth.uid()
      )
    )
  );

create policy "Users can view their own client's comments" on comments
  for select using (
    ticket_id in (
      select id from maintenance_tickets where property_id in (
        select id from properties where client_id in (
          select client_id from users where id = auth.uid()
        )
      )
    )
  ); 
-- Create storage bucket for tenant documents
insert into storage.buckets (id, name, public) values ('tenant-documents', 'tenant-documents', false);

-- Create RLS policies for tenant documents bucket
create policy "Tenants can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'tenant-documents' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Tenants can view their own documents"
  on storage.objects for select
  using (
    bucket_id = 'tenant-documents' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Create tenants table
create table public.tenants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  unit_id uuid references public.units not null,
  status text not null default 'pending_documents',
  documents jsonb default '[]'::jsonb,
  payment_status text default 'pending',
  payment_method text,
  payment_receipt text,
  split_rent jsonb default '{"enabled": false, "tenants": []}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create RLS policies for tenants table
alter table public.tenants enable row level security;

create policy "Tenants can view their own records"
  on public.tenants for select
  using (auth.uid() = user_id);

create policy "Tenants can update their own records"
  on public.tenants for update
  using (auth.uid() = user_id);

create policy "Landlords can view their tenants"
  on public.tenants for select
  using (
    exists (
      select 1 from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
      and p.landlord_id = auth.uid()
    )
  );

create policy "Landlords can update their tenants"
  on public.tenants for update
  using (
    exists (
      select 1 from public.units u
      join public.properties p on p.id = u.property_id
      where u.id = tenants.unit_id
      and p.landlord_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_tenants_updated_at
  before update on public.tenants
  for each row
  execute function public.handle_updated_at(); 
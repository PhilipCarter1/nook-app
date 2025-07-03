-- Function to check if a user has access to a property
create or replace function public.check_property_access(
  p_user_id uuid,
  p_property_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.properties
    where id = p_property_id
    and (
      owner_id = p_user_id
      or exists (
        select 1
        from public.units
        join public.leases on leases.unit_id = units.id
        where units.property_id = properties.id
        and leases.tenant_id = p_user_id
      )
    )
  );
end;
$$;

-- Function to check if a user has access to a unit
create or replace function public.check_unit_access(
  p_user_id uuid,
  p_unit_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.units
    where id = p_unit_id
    and (
      exists (
        select 1
        from public.properties
        where properties.id = units.property_id
        and properties.owner_id = p_user_id
      )
      or exists (
        select 1
        from public.leases
        where leases.unit_id = units.id
        and leases.tenant_id = p_user_id
      )
    )
  );
end;
$$;

-- Function to check if a user has access to a lease
create or replace function public.check_lease_access(
  p_user_id uuid,
  p_lease_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.leases
    where id = p_lease_id
    and (
      tenant_id = p_user_id
      or exists (
        select 1
        from public.units
        join public.properties on properties.id = units.property_id
        where units.id = leases.unit_id
        and properties.owner_id = p_user_id
      )
    )
  );
end;
$$;

-- Function to check if a user has access to a maintenance ticket
create or replace function public.check_maintenance_ticket_access(
  p_user_id uuid,
  p_ticket_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.maintenance_tickets
    where id = p_ticket_id
    and (
      tenant_id = p_user_id
      or exists (
        select 1
        from public.units
        join public.properties on properties.id = units.property_id
        where units.id = maintenance_tickets.unit_id
        and properties.owner_id = p_user_id
      )
    )
  );
end;
$$;

-- Function to check if a user has access to a document
create or replace function public.check_document_access(
  p_user_id uuid,
  p_document_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.documents
    where id = p_document_id
    and (
      created_by = p_user_id
      or exists (
        select 1
        from public.leases
        where leases.id = documents.related_id
        and documents.related_type = 'lease'
        and (
          leases.tenant_id = p_user_id
          or exists (
            select 1
            from public.units
            join public.properties on properties.id = units.property_id
            where units.id = leases.unit_id
            and properties.owner_id = p_user_id
          )
        )
      )
    )
  );
end;
$$;

-- Function to check if a user has access to a payment
create or replace function public.check_payment_access(
  p_user_id uuid,
  p_payment_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.payments
    where id = p_payment_id
    and exists (
      select 1
      from public.leases
      where leases.id = payments.lease_id
      and (
        leases.tenant_id = p_user_id
        or exists (
          select 1
          from public.units
          join public.properties on properties.id = units.property_id
          where units.id = leases.unit_id
          and properties.owner_id = p_user_id
        )
      )
    )
  );
end;
$$;

-- Function to check if a user has access to an organization
create or replace function public.check_organization_access(
  p_user_id uuid,
  p_organization_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.organization_members
    where organization_id = p_organization_id
    and user_id = p_user_id
  );
end;
$$;

-- Function to check if a user is an organization admin
create or replace function public.check_organization_admin(
  p_user_id uuid,
  p_organization_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.organization_members
    where organization_id = p_organization_id
    and user_id = p_user_id
    and role = 'admin'
  );
end;
$$;

-- Function to check if a user has access to a vendor
create or replace function public.check_vendor_access(
  p_user_id uuid,
  p_vendor_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.vendors
    where id = p_vendor_id
    and exists (
      select 1
      from public.properties
      where properties.owner_id = p_user_id
    )
  );
end;
$$;

-- Function to check if a user has access to rate limits
create or replace function public.check_rate_limit_access(
  p_user_id uuid,
  p_rate_limit_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.rate_limits
    where id = p_rate_limit_id
    and user_id = p_user_id
  );
end;
$$;

-- Function to check if a user has access to audit logs
create or replace function public.check_audit_log_access(
  p_user_id uuid,
  p_audit_log_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.users
    where id = p_user_id
    and role = 'admin'
  );
end;
$$;

-- Function to create an audit log entry
create or replace function public.create_audit_log(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb,
  p_ip_address text,
  p_user_agent text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_audit_log_id uuid;
begin
  insert into public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  values (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  )
  returning id into v_audit_log_id;

  return v_audit_log_id;
end;
$$;

-- Function to check rate limits
create or replace function public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  -- Get the current count for the user and endpoint
  select count
  into v_count
  from public.rate_limits
  where user_id = p_user_id
  and endpoint = p_endpoint
  and updated_at > now() - (p_window_seconds || ' seconds')::interval;

  -- If no record exists or the window has expired, create a new one
  if v_count is null then
    insert into public.rate_limits (user_id, endpoint, count)
    values (p_user_id, p_endpoint, 1);
    return true;
  end if;

  -- If the count is at the limit, return false
  if v_count >= p_max_requests then
    return false;
  end if;

  -- Increment the count
  update public.rate_limits
  set count = count + 1
  where user_id = p_user_id
  and endpoint = p_endpoint;

  return true;
end;
$$;

-- Function to get user's properties
create or replace function public.get_user_properties(
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  address text,
  city text,
  state text,
  zip_code text,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    p.id,
    p.name,
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.owner_id,
    p.created_at,
    p.updated_at
  from public.properties p
  where p.owner_id = p_user_id;
end;
$$;

-- Function to get user's units
create or replace function public.get_user_units(
  p_user_id uuid
)
returns table (
  id uuid,
  property_id uuid,
  unit_number text,
  floor integer,
  bedrooms integer,
  bathrooms numeric,
  square_feet integer,
  rent_amount numeric,
  status property_status,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    u.id,
    u.property_id,
    u.unit_number,
    u.floor,
    u.bedrooms,
    u.bathrooms,
    u.square_feet,
    u.rent_amount,
    u.status,
    u.created_at,
    u.updated_at
  from public.units u
  where exists (
    select 1
    from public.properties p
    where p.id = u.property_id
    and p.owner_id = p_user_id
  );
end;
$$;

-- Function to get user's leases
create or replace function public.get_user_leases(
  p_user_id uuid
)
returns table (
  id uuid,
  unit_id uuid,
  tenant_id uuid,
  start_date date,
  end_date date,
  rent_amount numeric,
  security_deposit numeric,
  status lease_status,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    l.id,
    l.unit_id,
    l.tenant_id,
    l.start_date,
    l.end_date,
    l.rent_amount,
    l.security_deposit,
    l.status,
    l.created_at,
    l.updated_at
  from public.leases l
  where l.tenant_id = p_user_id;
end;
$$;

-- Function to get user's maintenance tickets
create or replace function public.get_user_maintenance_tickets(
  p_user_id uuid
)
returns table (
  id uuid,
  unit_id uuid,
  tenant_id uuid,
  title text,
  description text,
  priority maintenance_priority,
  status maintenance_status,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    mt.id,
    mt.unit_id,
    mt.tenant_id,
    mt.title,
    mt.description,
    mt.priority,
    mt.status,
    mt.created_at,
    mt.updated_at
  from public.maintenance_tickets mt
  where mt.tenant_id = p_user_id;
end;
$$;

-- Function to get user's documents
create or replace function public.get_user_documents(
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  type document_type,
  url text,
  size integer,
  mime_type text,
  related_id uuid,
  related_type text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    d.id,
    d.name,
    d.type,
    d.url,
    d.size,
    d.mime_type,
    d.related_id,
    d.related_type,
    d.created_by,
    d.created_at,
    d.updated_at
  from public.documents d
  where d.created_by = p_user_id;
end;
$$;

-- Function to get user's payments
create or replace function public.get_user_payments(
  p_user_id uuid
)
returns table (
  id uuid,
  lease_id uuid,
  amount numeric,
  type payment_type,
  status payment_status,
  due_date date,
  paid_date date,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    p.id,
    p.lease_id,
    p.amount,
    p.type,
    p.status,
    p.due_date,
    p.paid_date,
    p.created_at,
    p.updated_at
  from public.payments p
  where exists (
    select 1
    from public.leases l
    where l.id = p.lease_id
    and l.tenant_id = p_user_id
  );
end;
$$;

-- Function to get user's organizations
create or replace function public.get_user_organizations(
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  type text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    o.id,
    o.name,
    o.type,
    o.created_at,
    o.updated_at
  from public.organizations o
  where exists (
    select 1
    from public.organization_members om
    where om.organization_id = o.id
    and om.user_id = p_user_id
  );
end;
$$;

-- Function to get user's vendors
create or replace function public.get_user_vendors(
  p_user_id uuid
)
returns table (
  id uuid,
  name text,
  type text,
  contact_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    v.id,
    v.name,
    v.type,
    v.contact_name,
    v.contact_email,
    v.contact_phone,
    v.created_at,
    v.updated_at
  from public.vendors v
  where exists (
    select 1
    from public.properties p
    where p.owner_id = p_user_id
  );
end;
$$; 
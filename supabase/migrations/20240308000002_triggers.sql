-- Function to handle property status updates
create or replace function public.handle_property_status_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the property is being marked as maintenance, update all units to maintenance
  if new.status = 'maintenance' then
    update public.units
    set status = 'maintenance'
    where property_id = new.id;
  end if;

  return new;
end;
$$;

-- Trigger for property status updates
create trigger handle_property_status_update
  after update of status on public.properties
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_property_status_update();

-- Function to handle unit status updates
create or replace function public.handle_unit_status_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the unit is being marked as leased, update the property status
  if new.status = 'leased' then
    update public.properties
    set status = 'leased'
    where id = new.property_id;
  end if;

  return new;
end;
$$;

-- Trigger for unit status updates
create trigger handle_unit_status_update
  after update of status on public.units
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_unit_status_update();

-- Function to handle lease status updates
create or replace function public.handle_lease_status_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the lease is being marked as active, update the unit status
  if new.status = 'active' then
    update public.units
    set status = 'leased'
    where id = new.unit_id;
  end if;

  -- If the lease is being marked as expired or terminated, update the unit status
  if new.status in ('expired', 'terminated') then
    update public.units
    set status = 'available'
    where id = new.unit_id;
  end if;

  return new;
end;
$$;

-- Trigger for lease status updates
create trigger handle_lease_status_update
  after update of status on public.leases
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_lease_status_update();

-- Function to handle maintenance ticket status updates
create or replace function public.handle_maintenance_ticket_status_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the ticket is being marked as resolved, check if there are any other open tickets
  if new.status = 'resolved' then
    if not exists (
      select 1
      from public.maintenance_tickets
      where unit_id = new.unit_id
      and status != 'resolved'
    ) then
      -- If no other open tickets, update the unit status
      update public.units
      set status = case
        when exists (
          select 1
          from public.leases
          where unit_id = units.id
          and status = 'active'
        ) then 'leased'
        else 'available'
      end
      where id = new.unit_id;
    end if;
  end if;

  return new;
end;
$$;

-- Trigger for maintenance ticket status updates
create trigger handle_maintenance_ticket_status_update
  after update of status on public.maintenance_tickets
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_maintenance_ticket_status_update();

-- Function to handle payment status updates
create or replace function public.handle_payment_status_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the payment is being marked as completed, update the paid_date
  if new.status = 'completed' and old.status != 'completed' then
    new.paid_date = now();
  end if;

  return new;
end;
$$;

-- Trigger for payment status updates
create trigger handle_payment_status_update
  before update of status on public.payments
  for each row
  when (old.status is distinct from new.status)
  execute function public.handle_payment_status_update();

-- Function to handle organization member role updates
create or replace function public.handle_organization_member_role_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the member is being removed as admin, ensure there is at least one other admin
  if old.role = 'admin' and new.role != 'admin' then
    if not exists (
      select 1
      from public.organization_members
      where organization_id = new.organization_id
      and role = 'admin'
      and id != new.id
    ) then
      raise exception 'Cannot remove the last admin from an organization';
    end if;
  end if;

  return new;
end;
$$;

-- Trigger for organization member role updates
create trigger handle_organization_member_role_update
  before update of role on public.organization_members
  for each row
  when (old.role is distinct from new.role)
  execute function public.handle_organization_member_role_update();

-- Function to handle organization member deletion
create or replace function public.handle_organization_member_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the member being deleted is an admin, ensure there is at least one other admin
  if old.role = 'admin' then
    if not exists (
      select 1
      from public.organization_members
      where organization_id = old.organization_id
      and role = 'admin'
      and id != old.id
    ) then
      raise exception 'Cannot delete the last admin from an organization';
    end if;
  end if;

  return old;
end;
$$;

-- Trigger for organization member deletion
create trigger handle_organization_member_deletion
  before delete on public.organization_members
  for each row
  execute function public.handle_organization_member_deletion();

-- Function to handle user deletion
create or replace function public.handle_user_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the user is a landlord, ensure all their properties are transferred
  if old.role = 'landlord' then
    if exists (
      select 1
      from public.properties
      where owner_id = old.id
    ) then
      raise exception 'Cannot delete a landlord with active properties';
    end if;
  end if;

  -- If the user is a tenant, ensure all their leases are terminated
  if old.role = 'tenant' then
    if exists (
      select 1
      from public.leases
      where tenant_id = old.id
      and status = 'active'
    ) then
      raise exception 'Cannot delete a tenant with active leases';
    end if;
  end if;

  return old;
end;
$$;

-- Trigger for user deletion
create trigger handle_user_deletion
  before delete on public.users
  for each row
  execute function public.handle_user_deletion();

-- Function to handle property deletion
create or replace function public.handle_property_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the property has active leases, prevent deletion
  if exists (
    select 1
    from public.units
    join public.leases on leases.unit_id = units.id
    where units.property_id = old.id
    and leases.status = 'active'
  ) then
    raise exception 'Cannot delete a property with active leases';
  end if;

  return old;
end;
$$;

-- Trigger for property deletion
create trigger handle_property_deletion
  before delete on public.properties
  for each row
  execute function public.handle_property_deletion();

-- Function to handle unit deletion
create or replace function public.handle_unit_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the unit has active leases, prevent deletion
  if exists (
    select 1
    from public.leases
    where unit_id = old.id
    and status = 'active'
  ) then
    raise exception 'Cannot delete a unit with active leases';
  end if;

  return old;
end;
$$;

-- Trigger for unit deletion
create trigger handle_unit_deletion
  before delete on public.units
  for each row
  execute function public.handle_unit_deletion();

-- Function to handle lease deletion
create or replace function public.handle_lease_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the lease is active, prevent deletion
  if old.status = 'active' then
    raise exception 'Cannot delete an active lease';
  end if;

  return old;
end;
$$;

-- Trigger for lease deletion
create trigger handle_lease_deletion
  before delete on public.leases
  for each row
  execute function public.handle_lease_deletion();

-- Function to handle maintenance ticket deletion
create or replace function public.handle_maintenance_ticket_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the ticket is not resolved, prevent deletion
  if old.status != 'resolved' then
    raise exception 'Cannot delete an unresolved maintenance ticket';
  end if;

  return old;
end;
$$;

-- Trigger for maintenance ticket deletion
create trigger handle_maintenance_ticket_deletion
  before delete on public.maintenance_tickets
  for each row
  execute function public.handle_maintenance_ticket_deletion();

-- Function to handle payment deletion
create or replace function public.handle_payment_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the payment is completed, prevent deletion
  if old.status = 'completed' then
    raise exception 'Cannot delete a completed payment';
  end if;

  return old;
end;
$$;

-- Trigger for payment deletion
create trigger handle_payment_deletion
  before delete on public.payments
  for each row
  execute function public.handle_payment_deletion();

-- Function to handle organization deletion
create or replace function public.handle_organization_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the organization has members, prevent deletion
  if exists (
    select 1
    from public.organization_members
    where organization_id = old.id
  ) then
    raise exception 'Cannot delete an organization with members';
  end if;

  return old;
end;
$$;

-- Trigger for organization deletion
create trigger handle_organization_deletion
  before delete on public.organizations
  for each row
  execute function public.handle_organization_deletion();

-- Function to handle vendor deletion
create or replace function public.handle_vendor_deletion()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If the vendor has active maintenance tickets, prevent deletion
  if exists (
    select 1
    from public.maintenance_tickets
    where vendor_id = old.id
    and status != 'resolved'
  ) then
    raise exception 'Cannot delete a vendor with active maintenance tickets';
  end if;

  return old;
end;
$$;

-- Trigger for vendor deletion
create trigger handle_vendor_deletion
  before delete on public.vendors
  for each row
  execute function public.handle_vendor_deletion(); 
import { supabase } from '@/lib/supabase';

export interface LeaseWithDetails {
  id: string;
  property: {
    id: string;
    name: string;
  };
  unit: {
    id: string;
    number: string;
  };
  tenant: {
    id: string;
    email: string;
  };
  startDate: Date;
  endDate: Date;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  stripeCustomerId: string | null;
}

export async function getLease(id: string): Promise<LeaseWithDetails | null> {
  const { data: lease, error } = await supabase
    .from('leases')
    .select(`
      id,
      start_date,
      end_date,
      status,
      monthly_rent,
      security_deposit,
      stripe_customer_id,
      property_id,
      unit_id,
      tenant_id
    `)
    .eq('id', id)
    .single();

  if (error || !lease) return null;

  // Get related data
  const [propertyResult, unitResult, tenantResult] = await Promise.all([
    supabase.from('properties').select('id, name').eq('id', lease.property_id).single(),
    supabase.from('units').select('id, unit_number').eq('id', lease.unit_id).single(),
    supabase.from('tenants').select('id, email').eq('id', lease.tenant_id).single(),
  ]);

  const property = propertyResult.data;
  const unit = unitResult.data;
  const tenant = tenantResult.data;

  if (!property || !unit || !tenant) return null;

  return {
    id: lease.id,
    property: {
      id: property.id,
      name: property.name,
    },
    unit: {
      id: unit.id,
      number: unit.unit_number,
    },
    tenant: {
      id: tenant.id,
      email: tenant.email,
    },
    startDate: new Date(lease.start_date),
    endDate: new Date(lease.end_date),
    status: lease.status,
    monthlyRent: lease.monthly_rent,
    securityDeposit: lease.security_deposit,
    stripeCustomerId: lease.stripe_customer_id,
  };
}

export async function getLeasesByProperty(id: string) {
  const { data: leases, error } = await supabase
    .from('leases')
    .select('*')
    .eq('property_id', id);

  if (error) throw error;
  return leases;
}

export async function getLeasesByTenant(tenantId: string) {
  const { data: leases, error } = await supabase
    .from('leases')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) throw error;
  return leases;
}

export async function createLease(data: {
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
}) {
  const { data: lease, error } = await supabase
    .from('leases')
    .insert({
      property_id: data.propertyId,
      tenant_id: data.tenantId,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      monthly_rent: data.monthlyRent,
      security_deposit: data.securityDeposit,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return lease;
}

export async function updateLeaseStatus(id: string, status: string) {
  const { data: lease, error } = await supabase
    .from('leases')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return lease;
} 
import { db } from '../db';
import { leases, properties, units, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';

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
  const [lease] = await db
    .select({
      id: leases.id,
      property: {
        id: properties.id,
        name: properties.name,
      },
      unit: {
        id: units.id,
        number: units.number,
      },
      tenant: {
        id: tenants.id,
        email: tenants.email,
      },
      startDate: leases.startDate,
      endDate: leases.endDate,
      status: leases.status,
      monthlyRent: leases.monthlyRent,
      securityDeposit: leases.securityDeposit,
      stripeCustomerId: leases.stripeCustomerId,
    })
    .from(leases)
    .leftJoin(properties, eq(leases.propertyId, properties.id))
    .leftJoin(units, eq(leases.unitId, units.id))
    .leftJoin(tenants, eq(leases.tenantId, tenants.id))
    .where(eq(leases.id, id));

  return lease || null;
}

export async function getLeasesByProperty(id: string) {
  return db
    .select()
    .from(leases)
    .where(eq(leases.propertyId, id));
}

export async function getLeasesByTenant(tenantId: string) {
  return db
    .select()
    .from(leases)
    .where(eq(leases.tenantId, tenantId));
}

export async function createLease(data: {
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
}) {
  const [lease] = await db
    .insert(leases)
    .values({
      ...data,
      status: 'pending',
    })
    .returning();

  return lease;
}

export async function updateLeaseStatus(id: string, status: string) {
  const [lease] = await db
    .update(leases)
    .set({ status })
    .where(eq(leases.id, id))
    .returning();

  return lease;
} 
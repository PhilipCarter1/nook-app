import { db } from '../db';
import { organizations, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth-options';

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function getOrganization(): Promise<Organization | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email));

  if (!user?.organizationId) {
    return null;
  }

  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, user.organizationId));

  if (!organization) {
    return null;
  }

  return {
    ...organization,
    role: user.role,
  };
}

export async function createOrganization(data: {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}): Promise<Organization> {
  const [organization] = await db
    .insert(organizations)
    .values(data)
    .returning();

  return {
    ...organization,
    role: 'admin',
  };
}

export async function updateOrganization(
  id: string,
  data: Partial<Organization>
): Promise<Organization> {
  const [organization] = await db
    .update(organizations)
    .set(data)
    .where(eq(organizations.id, id))
    .returning();

  return {
    ...organization,
    role: 'admin',
  };
}

export async function deleteOrganization(id: string): Promise<void> {
  await db
    .delete(organizations)
    .where(eq(organizations.id, id));
}

export async function getOrganizationUsers(organizationId: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.organizationId, organizationId));
}

export async function addUserToOrganization(
  organizationId: string,
  userId: string
): Promise<void> {
  await db
    .update(users)
    .set({ organizationId })
    .where(eq(users.id, userId));
}

export async function removeUserFromOrganization(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ organizationId: null })
    .where(eq(users.id, userId));
}

export async function getOrganizationTrialStatus(organizationId: string, userRole: string) {
  // If user is not a landlord, they don't need to worry about trial status
  if (userRole !== 'landlord') {
    return {
      isInTrial: false,
      daysRemaining: 0,
      trialEndDate: null,
      requiresPayment: false,
    };
  }

  const { data, error } = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .single();

  if (error) throw error;

  const now = new Date();
  const trialEnd = new Date(data.trial_end_date);
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isInTrial: data.status === 'trial',
    daysRemaining: Math.max(0, daysRemaining),
    trialEndDate: data.trial_end_date,
    requiresPayment: data.subscription_status === 'trial' && daysRemaining <= 0,
  };
}

export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await db
    .select()
    .from(users)
    .where(eq(users.organizationId, organizationId));

  if (error) throw error;

  return data;
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: string
) {
  const { error } = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId));

  if (error) throw error;
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  const { error } = await db
    .update(users)
    .set({ organizationId: null })
    .where(eq(users.id, userId));

  if (error) throw error;
} 
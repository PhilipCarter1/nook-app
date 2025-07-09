import { supabase } from '../supabase';
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

  const { data: usersData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .limit(1);
  if (userError || !usersData || usersData.length === 0) return null;
  const user = usersData[0];
  if (!user.organizationId) return null;

  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', user.organizationId)
    .limit(1);
  if (orgError || !orgData || orgData.length === 0) return null;
  const organization = orgData[0];

  return {
    ...organization,
    role: user.role,
  } as Organization;
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
  const { data: orgData, error } = await supabase
    .from('organizations')
    .insert([data])
    .select('*')
    .limit(1);
  if (error || !orgData || orgData.length === 0) throw error;
  return {
    ...orgData[0],
    role: 'admin',
  } as Organization;
}

export async function updateOrganization(
  id: string,
  data: Partial<Organization>
): Promise<Organization> {
  const { data: orgData, error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', id)
    .select('*')
    .limit(1);
  if (error || !orgData || orgData.length === 0) throw error;
  return {
    ...orgData[0],
    role: 'admin',
  } as Organization;
}

export async function deleteOrganization(id: string): Promise<void> {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getOrganizationUsers(organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organizationId', organizationId);
  if (error) throw error;
  return data;
}

export async function addUserToOrganization(
  organizationId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ organizationId })
    .eq('id', userId);
  if (error) throw error;
}

export async function removeUserFromOrganization(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ organizationId: null })
    .eq('id', userId);
  if (error) throw error;
}

export async function getOrganizationTrialStatus(organizationId: string, userRole: string) {
  if (userRole !== 'landlord') {
    return {
      isInTrial: false,
      daysRemaining: 0,
      trialEndDate: null,
      requiresPayment: false,
    };
  }
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
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
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organizationId', organizationId);
  if (error) throw error;
  return data;
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  role: string
) {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .eq('organizationId', organizationId);
  if (error) throw error;
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  const { error } = await supabase
    .from('users')
    .update({ organizationId: null })
    .eq('id', userId)
    .eq('organizationId', organizationId);
  if (error) throw error;
} 
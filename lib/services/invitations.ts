import { supabase } from '@/lib/supabase';
import { checkUsageLimits } from './usage';
import { sendTenantInvitation } from './email';

export interface TenantInvitation {
  id: string;
  organization_id: string;
  property_id: string;
  unit_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  invited_by: string;
}

export async function createTenantInvitation(
  organizationId: string,
  propertyId: string,
  unitId: string,
  email: string,
  invitedBy: string
): Promise<TenantInvitation> {
  // Check if we're within user limits
  const usage = await checkUsageLimits(organizationId);
  if (!usage) throw new Error('Organization not found');

  // Check if the email is already invited
  const { data: existingInvitation } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existingInvitation) {
    throw new Error('An invitation has already been sent to this email');
  }

  // Create the invitation
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const { data, error } = await supabase
    .from('tenant_invitations')
    .insert({
      organization_id: organizationId,
      property_id: propertyId,
      unit_id: unitId,
      email,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      invited_by: invitedBy,
    })
    .select()
    .single();

  if (error) throw error;

  // Send invitation email
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${data.id}`;
  await sendTenantInvitation(email, invitationLink);

  return data;
}

export async function getTenantInvitations(
  organizationId: string
): Promise<TenantInvitation[]> {
  const { data, error } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function acceptTenantInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  const { data: invitation, error: fetchError } = await supabase
    .from('tenant_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (fetchError) throw fetchError;
  if (!invitation) throw new Error('Invitation not found');
  if (invitation.status !== 'pending') throw new Error('Invitation is no longer valid');
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  // Start a transaction
  const { error: transactionError } = await supabase.rpc('accept_tenant_invitation', {
    p_invitation_id: invitationId,
    p_user_id: userId,
  });

  if (transactionError) throw transactionError;
}

export async function cancelTenantInvitation(
  invitationId: string
): Promise<void> {
  const { error } = await supabase
    .from('tenant_invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId);

  if (error) throw error;
} 
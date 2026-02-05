import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface TenantInvitation {
  id: string;
  email: string;
  propertyId: string;
  unitId?: string;
  role: 'tenant';
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
}

export interface TenantOnboardingData {
  email: string;
  firstName: string;
  lastName: string;
  propertyId: string;
  unitId?: string;
  phone?: string;
  moveInDate?: string;
}

// Function to invite a tenant to a property (works for both admin and landlord users)
export async function inviteTenant(
  userId: string,
  propertyId: string,
  tenantEmail: string,
  unitId?: string
): Promise<{ success: boolean; error?: string; invitationId?: string }> {
  const supabase = getClient();
  
  try {
    // Check if user exists and has appropriate role
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Only landlords and admins can invite tenants
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return { success: false, error: 'Not authorized to invite tenants' };
    }

    // Verify user owns or manages the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, landlord_id, owner_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return { success: false, error: 'Property not found' };
    }

    // Check if user is the landlord/owner of the property OR is an admin
    const isAdmin = user.role === 'admin';
    const isPropertyOwner = property.landlord_id === userId || property.owner_id === userId;
    
    if (!isAdmin && !isPropertyOwner) {
      return { success: false, error: 'Access denied - you do not own this property' };
    }

    // Check if tenant already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', tenantEmail)
      .single();

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create tenant invitation
    const invitationData = {
      email: tenantEmail,
      property_id: propertyId,
      unit_id: unitId,
      role: 'tenant',
      status: 'pending',
      invited_by: userId,
      invited_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (invitationError) {
      return { success: false, error: 'Failed to create invitation' };
    }

    // Send invitation email (placeholder for now)
    // await sendTenantInvitationEmail(tenantEmail, invitation.id);

    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error('Error inviting tenant:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Function to get properties that a user can manage (for admin or landlord)
export async function getUserManageableProperties(userId: string): Promise<any[]> {
  const supabase = getClient();
  
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return [];
    }

    // Admin can see all properties, landlord can only see their own
    if (user.role === 'admin') {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, name, address, landlord_id')
        .order('name');

      return properties || [];
    } else if (user.role === 'landlord') {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, name, address, landlord_id')
        .eq('landlord_id', userId)
        .order('name');

      return properties || [];
    }

    return [];
  } catch (error) {
    console.error('Error getting manageable properties:', error);
    return [];
  }
}

// Function to accept tenant invitation
export async function acceptTenantInvitation(
  invitationId: string,
  tenantData: TenantOnboardingData
): Promise<{ success: boolean; error?: string; userId?: string }> {
  const supabase = getClient();
  
  try {
    // Get invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return { success: false, error: 'Invalid or expired invitation' };
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }

    // Create tenant user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tenantData.email,
      password: generateTemporaryPassword(), // Generate temporary password
      options: {
        data: {
          full_name: `${tenantData.firstName} ${tenantData.lastName}`,
          role: 'tenant'
        }
      }
    });

    if (authError || !authData.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Create tenant profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: tenantData.email,
          first_name: tenantData.firstName,
          last_name: tenantData.lastName,
          role: 'tenant',
          phone: tenantData.phone,
          property_id: invitation.property_id,
          unit_id: invitation.unit_id,
        },
      ]);

    if (profileError) {
      return { success: false, error: 'Failed to create tenant profile' };
    }

    // Update invitation status
    await supabase
      .from('tenant_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    // Assign tenant to unit if specified
    if (invitation.unit_id) {
      await supabase
        .from('units')
        .update({ tenant_id: authData.user.id })
        .eq('id', invitation.unit_id);
    }

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Function to get tenant invitations for a user (admin or landlord)
export async function getTenantInvitations(userId: string): Promise<TenantInvitation[]> {
  const supabase = getClient();
  
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return [];
    }

    // Admin can see all invitations, landlord can only see their own
    let query = supabase
      .from('tenant_invitations')
      .select(`
        id,
        email,
        property_id,
        unit_id,
        role,
        status,
        invited_by,
        invited_at,
        expires_at
      `)
      .order('invited_at', { ascending: false });

    if (user.role === 'landlord') {
      query = query.eq('invited_by', userId);
    }

    const { data: invitations, error } = await query;

    if (error) {
      console.error('Error fetching invitations:', error);
      return [];
    }

    return (invitations || []).map((invitation: any) => ({
      id: invitation.id,
      email: invitation.email,
      propertyId: invitation.property_id,
      unitId: invitation.unit_id,
      role: invitation.role,
      status: invitation.status,
      invitedBy: invitation.invited_by,
      invitedAt: invitation.invited_at,
      expiresAt: invitation.expires_at,
    }));
  } catch (error) {
    console.error('Error getting tenant invitations:', error);
    return [];
  }
}

// Function to get available units for a property
export async function getAvailableUnits(propertyId: string): Promise<any[]> {
  const supabase = getClient();
  
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, status')
      .eq('property_id', propertyId)
      .eq('status', 'available');

    if (error) {
      console.error('Error fetching available units:', error);
      return [];
    }

    return units || [];
  } catch (error) {
    console.error('Error getting available units:', error);
    return [];
  }
}

// Helper function to generate temporary password
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Function to send tenant invitation email (placeholder)
async function sendTenantInvitationEmail(email: string, invitationId: string): Promise<void> {
  // TODO: Implement email sending logic
  console.log(`Sending invitation email to ${email} with invitation ID ${invitationId}`);
} 
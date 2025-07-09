import { getClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'landlord' | 'property_manager' | 'vendor' | 'tenant';

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'ticket' | 'property' | 'vendor' | 'settings' | 'user';
  conditions?: {
    propertyId?: string;
    userId?: string;
    vendorId?: string;
  };
}

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'create', resource: 'ticket' },
    { action: 'read', resource: 'ticket' },
    { action: 'update', resource: 'ticket' },
    { action: 'delete', resource: 'ticket' },
    { action: 'create', resource: 'property' },
    { action: 'read', resource: 'property' },
    { action: 'update', resource: 'property' },
    { action: 'delete', resource: 'property' },
    { action: 'create', resource: 'vendor' },
    { action: 'read', resource: 'vendor' },
    { action: 'update', resource: 'vendor' },
    { action: 'delete', resource: 'vendor' },
    { action: 'create', resource: 'settings' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
    { action: 'delete', resource: 'settings' },
    { action: 'create', resource: 'user' },
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'delete', resource: 'user' },
  ],
  landlord: [
    { action: 'create', resource: 'ticket', conditions: { propertyId: 'own' } },
    { action: 'read', resource: 'ticket', conditions: { propertyId: 'own' } },
    { action: 'update', resource: 'ticket', conditions: { propertyId: 'own' } },
    { action: 'delete', resource: 'ticket', conditions: { propertyId: 'own' } },
    { action: 'create', resource: 'property', conditions: { userId: 'own' } },
    { action: 'read', resource: 'property', conditions: { userId: 'own' } },
    { action: 'update', resource: 'property', conditions: { userId: 'own' } },
    { action: 'delete', resource: 'property', conditions: { userId: 'own' } },
    { action: 'read', resource: 'vendor' },
    { action: 'create', resource: 'settings', conditions: { propertyId: 'own' } },
    { action: 'read', resource: 'settings', conditions: { propertyId: 'own' } },
    { action: 'update', resource: 'settings', conditions: { propertyId: 'own' } },
  ],
  property_manager: [
    { action: 'create', resource: 'ticket', conditions: { propertyId: 'assigned' } },
    { action: 'read', resource: 'ticket', conditions: { propertyId: 'assigned' } },
    { action: 'update', resource: 'ticket', conditions: { propertyId: 'assigned' } },
    { action: 'read', resource: 'property', conditions: { propertyId: 'assigned' } },
    { action: 'read', resource: 'vendor' },
    { action: 'read', resource: 'settings', conditions: { propertyId: 'assigned' } },
  ],
  vendor: [
    { action: 'read', resource: 'ticket', conditions: { vendorId: 'own' } },
    { action: 'update', resource: 'ticket', conditions: { vendorId: 'own' } },
    { action: 'read', resource: 'property', conditions: { vendorId: 'own' } },
  ],
  tenant: [
    { action: 'create', resource: 'ticket', conditions: { userId: 'own' } },
    { action: 'read', resource: 'ticket', conditions: { userId: 'own' } },
    { action: 'update', resource: 'ticket', conditions: { userId: 'own' } },
  ],
};

export async function checkPermission(
  userId: string,
  permission: Permission
): Promise<boolean> {
  const supabase = getClient();

  // Get user role and associated data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, role, property_id, vendor_id')
    .eq('id', userId)
    .single();

  if (userError || !userData) return false;

  const userRole = userData.role as UserRole;
  const userPermissions = rolePermissions[userRole];

  // Check if user has the required permission
  const hasPermission = userPermissions.some((p) => {
    if (p.action !== permission.action || p.resource !== permission.resource) {
      return false;
    }

    // Check conditions
    if (permission.conditions) {
      if (permission.conditions.propertyId) {
        if (permission.conditions.propertyId === 'own') {
          return userData.property_id === permission.conditions.propertyId;
        }
        if (permission.conditions.propertyId === 'assigned') {
          // Check if user is assigned to the property
          return userData.property_id === permission.conditions.propertyId;
        }
      }

      if (permission.conditions.userId === 'own') {
        return userData.id === userId;
      }

      if (permission.conditions.vendorId === 'own') {
        return userData.vendor_id === permission.conditions.vendorId;
      }
    }

    return true;
  });

  return hasPermission;
}

export async function auditLog(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  details?: Record<string, any>
): Promise<void> {
  const supabase = getClient();

  await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId,
    details,
    created_at: new Date().toISOString(),
  });
} 
import { createClient } from '@supabase/supabase-js';
import { log } from '@/lib/logger';
export interface AuditLogEntry {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert({
    ...entry,
    created_at: new Date().toISOString(),
  });

  if (error) {
    log.error('Error logging audit event:', error as Error);
    // Don't throw the error to prevent disrupting the main operation
  }
}

export async function getAuditLogs(
  userId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<AuditLogEntry[]> {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId);

  if (options.startDate) {
    query = query.gte('created_at', options.startDate.toISOString());
  }

  if (options.endDate) {
    query = query.lte('created_at', options.endDate.toISOString());
  }

  if (options.action) {
    query = query.eq('action', options.action);
  }

  if (options.resourceType) {
    query = query.eq('resource_type', options.resourceType);
  }

  if (options.resourceId) {
    query = query.eq('resource_id', options.resourceId);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    log.error('Error fetching audit logs:', error as Error);
    throw error;
  }

  return data || [];
}

// Helper function to create audit log entries for common operations
export function createAuditLogEntry(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any> = {},
  request?: Request
): AuditLogEntry {
  return {
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: request?.headers.get('x-forwarded-for') || undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  };
}

// Common audit actions
export const AuditActions = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Property actions
  PROPERTY_CREATE: 'property.create',
  PROPERTY_UPDATE: 'property.update',
  PROPERTY_DELETE: 'property.delete',

  // Unit actions
  UNIT_CREATE: 'unit.create',
  UNIT_UPDATE: 'unit.update',
  UNIT_DELETE: 'unit.delete',

  // Lease actions
  LEASE_CREATE: 'lease.create',
  LEASE_UPDATE: 'lease.update',
  LEASE_DELETE: 'lease.delete',
  LEASE_RENEW: 'lease.renew',

  // Maintenance actions
  MAINTENANCE_CREATE: 'maintenance.create',
  MAINTENANCE_UPDATE: 'maintenance.update',
  MAINTENANCE_DELETE: 'maintenance.delete',
  MAINTENANCE_ASSIGN: 'maintenance.assign',
  MAINTENANCE_COMPLETE: 'maintenance.complete',

  // Payment actions
  PAYMENT_CREATE: 'payment.create',
  PAYMENT_UPDATE: 'payment.update',
  PAYMENT_DELETE: 'payment.delete',
  PAYMENT_REFUND: 'payment.refund',

  // Document actions
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DELETE: 'document.delete',
  DOCUMENT_SHARE: 'document.share',

  // Organization actions
  ORGANIZATION_CREATE: 'organization.create',
  ORGANIZATION_UPDATE: 'organization.update',
  ORGANIZATION_DELETE: 'organization.delete',
  MEMBER_ADD: 'member.add',
  MEMBER_REMOVE: 'member.remove',
  MEMBER_UPDATE: 'member.update',

  // Vendor actions
  VENDOR_CREATE: 'vendor.create',
  VENDOR_UPDATE: 'vendor.update',
  VENDOR_DELETE: 'vendor.delete',
  VENDOR_VERIFY: 'vendor.verify',

  // System actions
  SETTINGS_UPDATE: 'settings.update',
  BACKUP_CREATE: 'backup.create',
  BACKUP_RESTORE: 'backup.restore',
} as const; 
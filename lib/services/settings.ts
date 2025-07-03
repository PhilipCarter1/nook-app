import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getClient } from '@/lib/supabase/client';

export interface SLASettings {
  priority: 'low' | 'medium' | 'high' | 'emergency';
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  escalationLevels: {
    level: number;
    timeThreshold: number; // in hours
    notifyUsers: string[];
  }[];
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  notifyOn: {
    ticketCreated: boolean;
    ticketUpdated: boolean;
    ticketAssigned: boolean;
    ticketResolved: boolean;
    commentAdded: boolean;
    slaBreached: boolean;
  };
}

export interface EmergencySettings {
  autoAssignVendor: boolean;
  requireContactInfo: boolean;
  notifyPropertyManager: boolean;
  notifyEmergencyContacts: boolean;
  allowedEmergencyTypes: string[];
  emergencyResponseTime: number; // in minutes
}

export interface VendorSettings {
  autoMatchVendors: boolean;
  requireInsurance: boolean;
  requireRating: number;
  maxResponseTime: number; // in hours
  specialties: string[];
  preferredVendors: string[];
}

export interface MaintenanceSettings {
  sla: Record<string, SLASettings>;
  notifications: NotificationSettings;
  emergency: EmergencySettings;
  vendor: VendorSettings;
  customFields: {
    name: string;
    type: 'text' | 'number' | 'select' | 'multiselect';
    required: boolean;
    options?: string[];
  }[];
}

export async function getMaintenanceSettings(id: string): Promise<MaintenanceSettings> {
  const supabase = getClient();
  
  const { data: settings, error } = await supabase
    .from('property_settings')
    .select('maintenance_settings')
    .eq('property_id', id)
    .single();

  if (error) throw error;
  return settings?.maintenance_settings || getDefaultSettings();
}

export async function updateMaintenanceSettings(
  id: string,
  settings: Partial<MaintenanceSettings>
): Promise<MaintenanceSettings> {
  const supabase = getClient();
  
  const { data: currentSettings } = await supabase
    .from('property_settings')
    .select('maintenance_settings')
    .eq('property_id', id)
    .single();

  const updatedSettings = {
    ...(currentSettings?.maintenance_settings || getDefaultSettings()),
    ...settings,
  };

  const { data, error } = await supabase
    .from('property_settings')
    .upsert({
      property_id: id,
      maintenance_settings: updatedSettings,
      updated_at: new Date().toISOString(),
    })
    .select('maintenance_settings')
    .single();

  if (error) throw error;
  return data.maintenance_settings;
}

function getDefaultSettings(): MaintenanceSettings {
  return {
    sla: {
      emergency: {
        priority: 'emergency',
        responseTime: 1,
        resolutionTime: 4,
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 0.5,
            notifyUsers: ['property_manager', 'emergency_contact'],
          },
          {
            level: 2,
            timeThreshold: 1,
            notifyUsers: ['property_manager', 'emergency_contact', 'vendor'],
          },
        ],
      },
      high: {
        priority: 'high',
        responseTime: 4,
        resolutionTime: 24,
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 2,
            notifyUsers: ['property_manager'],
          },
          {
            level: 2,
            timeThreshold: 4,
            notifyUsers: ['property_manager', 'vendor'],
          },
        ],
      },
      medium: {
        priority: 'medium',
        responseTime: 24,
        resolutionTime: 72,
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 12,
            notifyUsers: ['property_manager'],
          },
        ],
      },
      low: {
        priority: 'low',
        responseTime: 48,
        resolutionTime: 168,
        escalationLevels: [
          {
            level: 1,
            timeThreshold: 24,
            notifyUsers: ['property_manager'],
          },
        ],
      },
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      inApp: true,
      notifyOn: {
        ticketCreated: true,
        ticketUpdated: true,
        ticketAssigned: true,
        ticketResolved: true,
        commentAdded: true,
        slaBreached: true,
      },
    },
    emergency: {
      autoAssignVendor: true,
      requireContactInfo: true,
      notifyPropertyManager: true,
      notifyEmergencyContacts: true,
      allowedEmergencyTypes: ['safety', 'security', 'health', 'property_damage'],
      emergencyResponseTime: 30,
    },
    vendor: {
      autoMatchVendors: true,
      requireInsurance: true,
      requireRating: 4.0,
      maxResponseTime: 24,
      specialties: ['plumbing', 'electrical', 'hvac', 'structural', 'appliance'],
      preferredVendors: [],
    },
    customFields: [],
  };
} 
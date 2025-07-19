import { sendUsageAlert } from './email';

export interface UsageMetrics {
  properties: number;
  units: number;
  users: number;
}

export interface UsageLimits {
  properties: number;
  units: number;
  supers: number;
  admins: number;
}

export interface UsageData {
  propertyCount: number;
  unitCount: number;
  superCount: number;
  adminCount: number;
  limits: UsageLimits;
}

export interface UsageAlert {
  id: string;
  organizationId: string;
  type: string;
  current_value: number;
  limit_value: number;
  status: 'active' | 'dismissed';
}

export async function getOrganizationUsage(organizationId: string): Promise<UsageMetrics> {
  // Mock implementation for now
  return {
    properties: 5,
    units: 25,
    users: 50,
  };
}

export async function checkUsageLimits(organizationId: string): Promise<UsageData> {
  // Mock implementation for now
  return {
    propertyCount: 5,
    unitCount: 25,
    superCount: 3,
    adminCount: 2,
    limits: {
      properties: 10,
      units: 50,
      supers: 5,
      admins: 3,
    },
  };
}

export async function getActiveAlerts(organizationId: string): Promise<UsageAlert[]> {
  // Mock implementation for now
  return [];
}

export async function getUsageAlerts(organizationId: string): Promise<UsageAlert[]> {
  // Mock implementation for now
  return [];
}

export async function dismissAlert(alertId: string): Promise<void> {
  // Mock implementation for now
} 
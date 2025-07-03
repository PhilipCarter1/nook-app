import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/db/types';
import { db } from '../db';
import { properties, units, leases, payments, maintenanceRequests } from '../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface PortfolioMetrics {
  totalProperties: number;
  totalUnits: number;
  totalValue: number;
  averageOccupancyRate: number;
  averageRentalYield: number;
  totalRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
  averageCapRate: number;
  propertyPerformance: Array<{
    id: string;
    name: string;
    occupancyRate: number;
    rentalYield: number;
    capRate: number;
    netOperatingIncome: number;
  }>;
}

export interface TenantMetrics {
  totalTenants: number;
  averageLeaseDuration: number;
  retentionRate: number;
  averageSatisfactionScore: number;
  paymentReliability: number;
  tenantBreakdown: Array<{
    id: string;
    name: string;
    propertyName: string;
    leaseStartDate: string;
    leaseEndDate: string;
    rentAmount: number;
    paymentHistory: Array<{
      date: string;
      amount: number;
      status: 'paid' | 'late' | 'missed';
    }>;
    maintenanceRequests: number;
    satisfactionScore: number;
    communicationScore: number;
    propertyCareScore: number;
  }>;
}

export interface PropertyAnalytics {
  id: string;
  propertyName: string;
  occupancyRate: number;
  totalRevenue: number;
  averageRent: number;
  maintenanceRequests: {
    total: number;
    open: number;
    closed: number;
    averageResolutionTime: number;
  };
  payments: {
    total: number;
    onTime: number;
    late: number;
    averageDaysLate: number;
  };
}

export interface PortfolioAnalytics {
  totalProperties: number;
  totalUnits: number;
  totalOccupiedUnits: number;
  totalRevenue: number;
  averageOccupancyRate: number;
  averageRent: number;
  maintenanceMetrics: {
    totalRequests: number;
    openRequests: number;
    averageResolutionTime: number;
  };
  paymentMetrics: {
    totalPayments: number;
    onTimePayments: number;
    latePayments: number;
    averageDaysLate: number;
  };
}

export async function getPortfolioMetrics(): Promise<PortfolioMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: metrics, error: metricsError } = await supabase
    .from('portfolio_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (metricsError) throw metricsError;

  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id);

  if (propertiesError) throw propertiesError;

  const propertyPerformance = await Promise.all(
    properties.map(async (property) => {
      const { data: propertyMetrics } = await supabase
        .from('property_comparisons')
        .select('*')
        .eq('property_id', property.id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      return {
        id: property.id,
        name: property.name,
        occupancyRate: propertyMetrics?.occupancyRate || 0,
        rentalYield: propertyMetrics?.rentalYield || 0,
        capRate: propertyMetrics?.capRate || 0,
        netOperatingIncome: propertyMetrics?.netOperatingIncome || 0,
      };
    })
  );

  return {
    totalProperties: metrics.totalProperties,
    totalUnits: metrics.totalUnits,
    totalValue: metrics.totalValue,
    averageOccupancyRate: metrics.averageOccupancyRate,
    averageRentalYield: metrics.averageRentalYield,
    totalRevenue: metrics.totalRevenue,
    totalExpenses: metrics.totalExpenses,
    netOperatingIncome: metrics.netOperatingIncome,
    averageCapRate: metrics.averageCapRate,
    propertyPerformance,
  };
}

export async function getTenantMetrics(): Promise<TenantMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: tenantMetrics, error: metricsError } = await supabase
    .from('tenant_metrics')
    .select(`
      *,
      properties:property_id (name),
      tenants:tenant_id (name)
    `)
    .eq('user_id', user.id);

  if (metricsError) throw metricsError;

  const totalTenants = tenantMetrics.length;
  const averageLeaseDuration = tenantMetrics.reduce((acc, metric) => {
    const start = new Date(metric.leaseStartDate);
    const end = new Date(metric.leaseEndDate);
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0) / totalTenants;

  const retentionRate = tenantMetrics.filter(metric => {
    const end = new Date(metric.leaseEndDate);
    return end > new Date();
  }).length / totalTenants * 100;

  const averageSatisfactionScore = tenantMetrics.reduce((acc, metric) => 
    acc + (metric.satisfactionScore || 0), 0) / totalTenants;

  const paymentReliability = tenantMetrics.reduce((acc, metric) => {
    const paidPayments = metric.paymentHistory.filter(p => p.status === 'paid').length;
    return acc + (paidPayments / metric.paymentHistory.length);
  }, 0) / totalTenants * 100;

  const tenantBreakdown = tenantMetrics.map(metric => ({
    id: metric.tenantId,
    name: metric.tenants.name,
    propertyName: metric.properties.name,
    leaseStartDate: metric.leaseStartDate,
    leaseEndDate: metric.leaseEndDate,
    rentAmount: metric.rentAmount,
    paymentHistory: metric.paymentHistory,
    maintenanceRequests: metric.maintenanceRequests,
    satisfactionScore: metric.satisfactionScore,
    communicationScore: metric.communicationScore,
    propertyCareScore: metric.propertyCareScore,
  }));

  return {
    totalTenants,
    averageLeaseDuration,
    retentionRate,
    averageSatisfactionScore,
    paymentReliability,
    tenantBreakdown,
  };
}

export async function getPropertyAnalytics(
  id: string,
  startDate: Date,
  endDate: Date
): Promise<PropertyAnalytics> {
  // Get property details
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id));

  // Get all units for the property
  const propertyUnits = await db
    .select()
    .from(units)
    .where(eq(units.propertyId, id));

  // Get all leases for the property
  const propertyLeases = await db
    .select()
    .from(leases)
    .where(
      and(
        eq(leases.propertyId, id),
        gte(leases.startDate, startDate),
        lte(leases.endDate, endDate)
      )
    );

  // Get all payments for the property
  const propertyPayments = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.propertyId, id),
        gte(payments.dueDate, startDate),
        lte(payments.dueDate, endDate)
      )
    );

  // Calculate metrics
  const occupiedUnits = propertyLeases.filter(lease => lease.status === 'active').length;
  const occupancyRate = (occupiedUnits / propertyUnits.length) * 100;

  const totalRevenue = propertyPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const averageRent = totalRevenue / propertyPayments.length || 0;

  const onTimePayments = propertyPayments.filter(payment => payment.status === 'paid' && !payment.isLate).length;
  const latePayments = propertyPayments.filter(payment => payment.isLate).length;
  const averageDaysLate = propertyPayments
    .filter(payment => payment.isLate)
    .reduce((sum, payment) => sum + (payment.daysLate || 0), 0) / latePayments || 0;

  // For now, we'll use placeholder values for maintenance metrics
  // TODO: Implement maintenance request tracking
  const maintenanceMetrics = {
    total: 0,
    open: 0,
    closed: 0,
    averageResolutionTime: 0,
  };

  return {
    id,
    propertyName: property.name,
    occupancyRate,
    totalRevenue,
    averageRent,
    maintenanceRequests: maintenanceMetrics,
    payments: {
      total: propertyPayments.length,
      onTime: onTimePayments,
      late: latePayments,
      averageDaysLate,
    },
  };
}

export async function getPortfolioAnalytics(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<PortfolioAnalytics> {
  // Get all properties for the organization
  const orgProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.organizationId, organizationId));

  // Get analytics for each property
  const propertyAnalytics = await Promise.all(
    orgProperties.map(property => getPropertyAnalytics(property.id, startDate, endDate))
  );

  // Calculate portfolio-wide metrics
  const totalProperties = orgProperties.length;
  const totalUnits = propertyAnalytics.reduce((sum, analytics) => sum + analytics.maintenanceRequests.total, 0);
  const totalOccupiedUnits = propertyAnalytics.reduce((sum, analytics) => sum + (analytics.occupancyRate * totalUnits / 100), 0);
  const totalRevenue = propertyAnalytics.reduce((sum, analytics) => sum + analytics.totalRevenue, 0);
  const averageOccupancyRate = propertyAnalytics.reduce((sum, analytics) => sum + analytics.occupancyRate, 0) / totalProperties;
  const averageRent = propertyAnalytics.reduce((sum, analytics) => sum + analytics.averageRent, 0) / totalProperties;

  const maintenanceMetrics = {
    totalRequests: propertyAnalytics.reduce((sum, analytics) => sum + analytics.maintenanceRequests.total, 0),
    openRequests: propertyAnalytics.reduce((sum, analytics) => sum + analytics.maintenanceRequests.open, 0),
    averageResolutionTime: propertyAnalytics.reduce((sum, analytics) => sum + analytics.maintenanceRequests.averageResolutionTime, 0) / totalProperties,
  };

  const paymentMetrics = {
    totalPayments: propertyAnalytics.reduce((sum, analytics) => sum + analytics.payments.total, 0),
    onTimePayments: propertyAnalytics.reduce((sum, analytics) => sum + analytics.payments.onTime, 0),
    latePayments: propertyAnalytics.reduce((sum, analytics) => sum + analytics.payments.late, 0),
    averageDaysLate: propertyAnalytics.reduce((sum, analytics) => sum + analytics.payments.averageDaysLate, 0) / totalProperties,
  };

  return {
    totalProperties,
    totalUnits,
    totalOccupiedUnits,
    totalRevenue,
    averageOccupancyRate,
    averageRent,
    maintenanceMetrics,
    paymentMetrics,
  };
} 
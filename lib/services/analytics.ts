// Mock analytics service for Vercel deployment
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
  return {
    totalProperties: 0,
    totalUnits: 0,
    totalValue: 0,
    averageOccupancyRate: 0,
    averageRentalYield: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netOperatingIncome: 0,
    averageCapRate: 0,
    propertyPerformance: [],
  };
}

export async function getTenantMetrics(): Promise<TenantMetrics> {
  return {
    totalTenants: 0,
    averageLeaseDuration: 0,
    retentionRate: 0,
    averageSatisfactionScore: 0,
    paymentReliability: 0,
    tenantBreakdown: [],
  };
}

export async function getPortfolioAnalytics(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<PortfolioAnalytics> {
  return {
    totalProperties: 0,
    totalUnits: 0,
    totalOccupiedUnits: 0,
    totalRevenue: 0,
    averageOccupancyRate: 0,
    averageRent: 0,
    maintenanceMetrics: {
      totalRequests: 0,
      openRequests: 0,
      averageResolutionTime: 0,
    },
    paymentMetrics: {
      totalPayments: 0,
      onTimePayments: 0,
      latePayments: 0,
      averageDaysLate: 0,
    },
  };
} 
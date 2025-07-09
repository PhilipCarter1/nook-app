import { getClient } from '@/lib/supabase/client';
import { financialTransactions, financialReports, propertyMetrics, expenseCategories } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export interface FinancialTransaction {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  description?: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  paymentMethod?: string;
  referenceNumber?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface FinancialReport {
  id: string;
  propertyId: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate: Date;
  endDate: Date;
  data: Record<string, any>;
  status: 'draft' | 'final' | 'archived';
  createdBy: string;
}

export interface PropertyMetrics {
  id: string;
  date: Date;
  occupancyRate?: number;
  rentalYield?: number;
  maintenanceCosts?: number;
  operatingExpenses?: number;
  netOperatingIncome?: number;
  capRate?: number;
  marketValue?: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  revenueChange: number;
  expensesChange: number;
  netIncomeChange: number;
  profitMarginChange: number;
  propertyMetrics: Array<{
    id: string;
    date: string;
    occupancyRate?: number;
    rentalYield?: number;
    maintenanceCosts?: number;
    operatingExpenses?: number;
    netOperatingIncome?: number;
    capRate?: number;
    marketValue?: number;
  }>;
}

export async function createTransaction(data: Omit<FinancialTransaction, 'id'>) {
  const supabase = getClient();
  const { data: transaction, error } = await supabase
    .from('financial_transactions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return transaction;
}

export async function getTransactions(
  propertyId: string,
  filters: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    category?: string;
    status?: string;
  } = {}
) {
  const supabase = getClient();
  let query = supabase
    .from('financial_transactions')
    .select('*')
    .eq('property_id', propertyId);

  if (filters.startDate) {
    query = query.gte('date', filters.startDate.toISOString());
  }
  if (filters.endDate) {
    query = query.lte('date', filters.endDate.toISOString());
  }
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data: transactions, error } = await query.order('date', { ascending: false });

  if (error) throw error;
  return transactions;
}

export async function getFinancialSummary(propertyId: string, startDate: Date, endDate: Date) {
  const supabase = getClient();
  const { data: transactions, error } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('property_id', propertyId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .eq('status', 'completed');

  if (error) throw error;

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    categoryBreakdown: {} as Record<string, { income: number; expenses: number }>,
  };

  transactions.forEach((transaction) => {
    const amount = Number(transaction.amount);
    if (transaction.type === 'income') {
      summary.totalIncome += amount;
      summary.categoryBreakdown[transaction.category] = summary.categoryBreakdown[transaction.category] || { income: 0, expenses: 0 };
      summary.categoryBreakdown[transaction.category].income += amount;
    } else if (transaction.type === 'expense') {
      summary.totalExpenses += amount;
      summary.categoryBreakdown[transaction.category] = summary.categoryBreakdown[transaction.category] || { income: 0, expenses: 0 };
      summary.categoryBreakdown[transaction.category].expenses += amount;
    }
  });

  summary.netIncome = summary.totalIncome - summary.totalExpenses;
  return summary;
}

export async function getPropertyMetrics(id: string, startDate: Date, endDate: Date) {
  const supabase = getClient();
  const { data: metrics, error } = await supabase
    .from('property_metrics')
    .select('*')
    .eq('property_id', id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: true });

  if (error) throw error;
  return metrics;
}

export async function generateFinancialReport(
  propertyId: string,
  type: 'monthly' | 'quarterly' | 'annual' | 'custom',
  startDate: Date,
  endDate: Date,
  userId: string
) {
  const [summary, metrics] = await Promise.all([
    getFinancialSummary(propertyId, startDate, endDate),
    getPropertyMetrics(propertyId, startDate, endDate),
  ]);

  const reportData = {
    summary,
    metrics,
    generatedAt: new Date(),
  };

  const supabase = getClient();
  const { data: report, error } = await supabase
    .from('financial_reports')
    .insert({
      property_id: propertyId,
      type,
      start_date: startDate,
      end_date: endDate,
      data: reportData,
      status: 'final',
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function getExpenseCategories() {
  const supabase = getClient();
  const { data: categories, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return categories;
}

export async function createExpenseCategory(data: { name: string; description?: string; type: string }) {
  const supabase = getClient();
  const { data: category, error } = await supabase
    .from('expense_categories')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function updateExpenseCategory(id: string, data: Partial<{ name: string; description: string; type: string; isActive: boolean }>) {
  const supabase = getClient();
  const { data: category, error } = await supabase
    .from('expense_categories')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: transactions, error: transactionsError } = await supabase
    .from('financial_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (transactionsError) throw transactionsError;

  const currentMonth = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const currentMonthTransactions = transactions.filter(t => 
    new Date(t.date).getMonth() === currentMonth.getMonth() &&
    new Date(t.date).getFullYear() === currentMonth.getFullYear()
  );

  const lastMonthTransactions = transactions.filter(t =>
    new Date(t.date).getMonth() === lastMonth.getMonth() &&
    new Date(t.date).getFullYear() === lastMonth.getFullYear()
  );

  const calculateMetrics = (transactions: any[]) => {
    const revenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = revenue - expenses;
    const profitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

    return { revenue, expenses, netIncome, profitMargin };
  };

  const currentMetrics = calculateMetrics(currentMonthTransactions);
  const lastMetrics = calculateMetrics(lastMonthTransactions);

  const calculateChange = (current: number, last: number) => {
    if (last === 0) return 0;
    return ((current - last) / last) * 100;
  };

  const { data: propertyMetrics, error: metricsError } = await supabase
    .from('property_metrics')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (metricsError) throw metricsError;

  return {
    totalRevenue: currentMetrics.revenue,
    totalExpenses: currentMetrics.expenses,
    netIncome: currentMetrics.netIncome,
    profitMargin: currentMetrics.profitMargin,
    revenueChange: calculateChange(currentMetrics.revenue, lastMetrics.revenue),
    expensesChange: calculateChange(currentMetrics.expenses, lastMetrics.expenses),
    netIncomeChange: calculateChange(currentMetrics.netIncome, lastMetrics.netIncome),
    profitMarginChange: calculateChange(currentMetrics.profitMargin, lastMetrics.profitMargin),
    propertyMetrics: propertyMetrics || [],
  };
} 
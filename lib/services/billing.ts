import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxProperties: number;
  maxUnits: number;
  maxUsers: number;
  stripePriceId: string;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      'Up to 5 properties',
      'Up to 20 units',
      'Basic maintenance tracking',
      'Payment processing',
      'Email support',
    ],
    maxProperties: 5,
    maxUnits: 20,
    maxUsers: 3,
    stripePriceId: 'price_starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    features: [
      'Up to 25 properties',
      'Up to 100 units',
      'Advanced maintenance tracking',
      'Document management',
      'Financial reporting',
      'Priority support',
    ],
    maxProperties: 25,
    maxUnits: 100,
    maxUsers: 10,
    stripePriceId: 'price_professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited properties',
      'Unlimited units',
      'Full feature access',
      'Custom integrations',
      'Dedicated support',
      'Advanced analytics',
    ],
    maxProperties: -1, // Unlimited
    maxUnits: -1, // Unlimited
    maxUsers: -1, // Unlimited
    stripePriceId: 'price_enterprise',
  },
];

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSubscription(organizationId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

export async function createSubscription(organizationId: string, planId: string, stripeSubscriptionId: string): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      organization_id: organizationId,
      plan_id: planId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getOrganizationSubscription(organizationId: string) {
  // TODO: Implement actual subscription fetching
  return {
    plan: 'professional',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function updateOrganizationSubscription(
  organizationId: string,
  planId: string,
  billingCycle: 'monthly' | 'annual'
) {
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) throw new Error('Invalid plan');

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      organization_id: organizationId,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      billing_cycle: billingCycle,
      amount: plan.price,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrganizationUsage(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      properties:properties (id),
      members:organization_members (
        id,
        role
      )
    `)
    .eq('id', organizationId)
    .single();

  if (error) throw error;

  const propertyCount = data.properties.length;
  const unitCount = data.properties.reduce((acc: number, prop: any) => acc + (prop.units?.length || 0), 0);
  const superCount = data.members.filter((m: any) => m.role === 'super').length;
  const adminCount = data.members.filter((m: any) => m.role === 'admin').length;

  return {
    propertyCount,
    unitCount,
    superCount,
    adminCount,
  };
}

export async function calculateSubscriptionCost(
  organizationId: string,
  planId: string,
  billingCycle: 'monthly' | 'annual'
) {
  const plan = subscriptionPlans.find(p => p.id === planId);
  if (!plan) throw new Error('Invalid plan');

  const usage = await getOrganizationUsage(organizationId);
  
  // Calculate base plan cost
  let totalCost = plan.price;
  if (billingCycle === 'annual') {
    totalCost = totalCost * 12 * 0.8; // 20% discount for annual billing
  }

  // Calculate additional user costs
  const additionalSupers = Math.max(0, usage.superCount - plan.maxUsers);
  const additionalAdmins = Math.max(0, usage.adminCount - plan.maxUsers);

  totalCost += additionalSupers * 15;
  totalCost += additionalAdmins * 20;

  return {
    basePlanCost: plan.price,
    additionalUsersCost: (additionalSupers * 15) + (additionalAdmins * 20),
    totalCost,
    billingCycle,
    usage,
  };
} 
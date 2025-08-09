import { getClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxProperties: number;
  maxUnits: number;
  maxUsers: number;
  stripePriceId: string;
  // Starter plan allows admin to become landlord
  allowsLandlordRole: boolean;
  // Admin can be landlord for smaller plans
  adminCanBeLandlord: boolean;
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
    // Starter plan allows admin to also function as landlord
    allowsLandlordRole: true,
    // Admin can be landlord for smaller plans
    adminCanBeLandlord: true,
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
    // Professional plan allows admin to also function as landlord
    allowsLandlordRole: true,
    // Admin can be landlord for professional plans
    adminCanBeLandlord: true,
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
    // Enterprise plan allows admin to also function as landlord
    allowsLandlordRole: true,
    // Admin can be landlord for enterprise plans
    adminCanBeLandlord: true,
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
  const supabase = getClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error) {
    log.error('Error fetching subscription:', error as Error);
    return null;
  }

  return data;
}

export async function createSubscription(organizationId: string, planId: string, stripeSubscriptionId: string): Promise<Subscription> {
  const supabase = getClient();
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
  const supabase = getClient();
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

  const supabase = getClient();
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
  const supabase = getClient();
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

// Function to check if user can function as landlord (without role change)
export async function canFunctionAsLandlord(userId: string): Promise<{ canBeLandlord: boolean; reason?: string }> {
  const supabase = getClient();
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role, subscription_plan, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { canBeLandlord: false, reason: 'User not found' };
    }

    // Admin users can function as landlords
    if (user.role === 'admin') {
      // Check if user has an active subscription
      if (user.subscription_status !== 'active') {
        return { canBeLandlord: false, reason: 'Active subscription required to function as landlord' };
      }

      // Check if subscription plan allows admin to be landlord
      const plan = subscriptionPlans.find(p => p.id === user.subscription_plan);
      if (!plan || !plan.adminCanBeLandlord) {
        return { canBeLandlord: false, reason: 'Current subscription plan does not allow admin landlord functionality' };
      }

      return { canBeLandlord: true };
    }

    // Landlord users can function as landlords
    if (user.role === 'landlord') {
      return { canBeLandlord: true };
    }

    return { canBeLandlord: false, reason: 'Only admin and landlord users can function as landlords' };
  } catch (error) {
    console.error('Error checking landlord functionality:', error);
    return { canBeLandlord: false, reason: 'Error checking eligibility' };
  }
}

// Function to get user's landlord capabilities
export async function getUserLandlordCapabilities(userId: string): Promise<{
  canInviteTenants: boolean;
  canManageProperties: boolean;
  canViewAnalytics: boolean;
  maxProperties: number;
  maxUnits: number;
}> {
  const supabase = getClient();
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role, subscription_plan')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        canInviteTenants: false,
        canManageProperties: false,
        canViewAnalytics: false,
        maxProperties: 0,
        maxUnits: 0,
      };
    }

    const plan = subscriptionPlans.find(p => p.id === user.subscription_plan);
    const isAdmin = user.role === 'admin';
    const isLandlord = user.role === 'landlord';
    const canBeLandlord = isAdmin || isLandlord;

    return {
      canInviteTenants: canBeLandlord && plan?.allowsLandlordRole === true,
      canManageProperties: canBeLandlord && plan?.allowsLandlordRole === true,
      canViewAnalytics: canBeLandlord && plan?.allowsLandlordRole === true,
      maxProperties: plan?.maxProperties || 0,
      maxUnits: plan?.maxUnits || 0,
    };
  } catch (error) {
    console.error('Error getting landlord capabilities:', error);
    return {
      canInviteTenants: false,
      canManageProperties: false,
      canViewAnalytics: false,
      maxProperties: 0,
      maxUnits: 0,
    };
  }
}

// Function to upgrade user role based on subscription plan (for larger organizations)
export async function upgradeUserRole(userId: string, planId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  
  try {
    // Get the subscription plan
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Invalid subscription plan' };
    }

    // Check if plan allows landlord role
    if (!plan.allowsLandlordRole) {
      return { success: false, error: 'This plan does not allow landlord role' };
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, trial_status')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Only allow admin users to upgrade to landlord (for larger organizations)
    if (user.role !== 'admin') {
      return { success: false, error: 'Only admin users can upgrade to landlord' };
    }

    // Update user role to landlord
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'landlord',
        subscription_plan: planId,
        subscription_status: 'active',
        trial_status: user.trial_status === 'active' ? 'converted' : user.trial_status
      })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to upgrade user role' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error upgrading user role:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Function to check if user can upgrade to landlord (for larger organizations)
export async function canUpgradeToLandlord(userId: string): Promise<{ canUpgrade: boolean; reason?: string }> {
  const supabase = getClient();
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('role, subscription_plan, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return { canUpgrade: false, reason: 'User not found' };
    }

    // Only admin users can upgrade to landlord (for larger organizations)
    if (user.role !== 'admin') {
      return { canUpgrade: false, reason: 'Only admin users can upgrade to landlord' };
    }

    // Check if user has an active subscription
    if (user.subscription_status !== 'active') {
      return { canUpgrade: false, reason: 'Active subscription required to upgrade to landlord' };
    }

    // Check if subscription plan allows landlord role
    const plan = subscriptionPlans.find(p => p.id === user.subscription_plan);
    if (!plan || !plan.allowsLandlordRole) {
      return { canUpgrade: false, reason: 'Current subscription plan does not allow landlord role' };
    }

    return { canUpgrade: true };
  } catch (error) {
    console.error('Error checking upgrade eligibility:', error);
    return { canUpgrade: false, reason: 'Error checking eligibility' };
  }
} 
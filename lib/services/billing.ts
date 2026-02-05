import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxProperties: number;
  maxUnits: number;
  maxTenants: number;
  stripePriceId: string;
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
}

export interface BillingUsage {
  propertiesCount: number;
  unitsCount: number;
  tenantsCount: number;
  documentsCount: number;
  storageUsed: number; // in MB
  storageLimit: number; // in MB
}

// Define the 3 subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small landlords with 1-10 properties',
    price: 29,
    billingCycle: 'monthly',
    features: [
      'Up to 10 properties',
      'Up to 50 units',
      'Up to 100 tenants',
      'Document management',
      'Basic reporting',
      'Email support',
      'Mobile app access'
    ],
    maxProperties: 10,
    maxUnits: 50,
    maxTenants: 100,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing property management companies',
    price: 79,
    billingCycle: 'monthly',
    features: [
      'Up to 50 properties',
      'Up to 500 units',
      'Up to 1000 tenants',
      'Advanced document workflow',
      'Comprehensive reporting',
      'Priority support',
      'API access',
      'Custom branding',
      'Bulk operations'
    ],
    maxProperties: 50,
    maxUnits: 500,
    maxTenants: 1000,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large property management firms with multiple apartment blocks',
    price: 199,
    billingCycle: 'monthly',
    features: [
      'Unlimited properties',
      'Unlimited units',
      'Unlimited tenants',
      'Advanced AI features',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'White-label solution',
      'Advanced analytics',
      'Multi-location management'
    ],
    maxProperties: -1, // unlimited
    maxUnits: -1, // unlimited
    maxTenants: -1, // unlimited
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
  }
];

// Get user's current subscription
export async function getUserSubscription(userId: string): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
  const supabase = getClient();
  
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { success: false, error: 'Failed to fetch subscription' };
    }

    return { success: true, subscription: subscription || null };
  } catch (err: unknown) {
    log.error('Error fetching user subscription', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get user's current usage
export async function getUserUsage(userId: string): Promise<{ success: boolean; usage?: BillingUsage; error?: string }> {
  const supabase = getClient();
  
  try {
    // Get properties count
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('landlord_id', userId);

    // Get property IDs first
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', userId);

    if (propertiesError) {
      return { success: false, error: 'Failed to fetch properties' };
    }

    const propertyIds = properties?.map((p: any) => p.id) || [];

    // Get units count
    const { count: unitsCount } = await supabase
      .from('units')
      .select('*', { count: 'exact', head: true })
      .in('property_id', propertyIds);

    // Get tenants count
    const { count: tenantsCount } = await supabase
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .in('property_id', propertyIds);

    // Get documents count
    const { count: documentsCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('property_id', propertyIds);

    // Calculate storage usage (simplified for now)
    const storageUsed = (documentsCount || 0) * 2; // Assume 2MB per document
    const storageLimit = 1000; // 1GB limit for all plans

    const usage: BillingUsage = {
      propertiesCount: propertiesCount || 0,
      unitsCount: unitsCount || 0,
      tenantsCount: tenantsCount || 0,
      documentsCount: documentsCount || 0,
      storageUsed,
      storageLimit
    };

    return { success: true, usage };
  } catch (err: unknown) {
    log.error('Error fetching user usage', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Check if user can upgrade to a specific plan
export async function canUpgradeToPlan(userId: string, planId: string): Promise<{ success: boolean; canUpgrade: boolean; reason?: string; error?: string }> {
  try {
    const [subscriptionResult, usageResult] = await Promise.all([
      getUserSubscription(userId),
      getUserUsage(userId)
    ]);

    if (!subscriptionResult.success || !usageResult.success) {
      return { success: false, canUpgrade: false, error: 'Failed to fetch user data' };
    }

    const currentPlan = subscriptionResult.subscription ? 
      SUBSCRIPTION_PLANS.find(p => p.id === subscriptionResult.subscription?.planId) : null;
    
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (!targetPlan) {
      return { success: false, canUpgrade: false, error: 'Invalid plan' };
    }

    // Check if user is already on this plan or higher
    if (currentPlan && getPlanTier(currentPlan.id) >= getPlanTier(planId)) {
      return { 
        success: true, 
        canUpgrade: false, 
        reason: 'You are already on this plan or higher' 
      };
    }

    // Check if current usage exceeds target plan limits
    if (usageResult.usage) {
      if (targetPlan.maxProperties !== -1 && usageResult.usage.propertiesCount > targetPlan.maxProperties) {
        return { 
          success: true, 
          canUpgrade: false, 
          reason: `Current properties (${usageResult.usage.propertiesCount}) exceed plan limit (${targetPlan.maxProperties})` 
        };
      }

      if (targetPlan.maxUnits !== -1 && usageResult.usage.unitsCount > targetPlan.maxUnits) {
        return { 
          success: true, 
          canUpgrade: false, 
          reason: `Current units (${usageResult.usage.unitsCount}) exceed plan limit (${targetPlan.maxUnits})` 
        };
      }

      if (targetPlan.maxTenants !== -1 && usageResult.usage.tenantsCount > targetPlan.maxTenants) {
        return { 
          success: true, 
          canUpgrade: false, 
          reason: `Current tenants (${usageResult.usage.tenantsCount}) exceed plan limit (${targetPlan.maxTenants})` 
        };
      }
    }

    return { success: true, canUpgrade: true };
  } catch (err: unknown) {
    log.error('Error checking upgrade eligibility', err as Error);
    return { success: false, canUpgrade: false, error: 'Internal server error' };
  }
}

// Helper function to get plan tier (for comparison)
function getPlanTier(planId: string): number {
  switch (planId) {
    case 'starter': return 1;
    case 'professional': return 2;
    case 'enterprise': return 3;
    default: return 0;
  }
}

// Create Stripe checkout session for subscription
export async function createCheckoutSession(planId: string, userId: string, successUrl: string, cancelUrl: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Invalid plan' };
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        userId,
        successUrl,
        cancelUrl,
        stripePriceId: plan.stripePriceId
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create checkout session' };
    }

    return { success: true, sessionId: data.sessionId };
  } catch (err: unknown) {
    log.error('Error creating checkout session', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Cancel subscription
export async function cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to cancel subscription' };
    }

    return { success: true };
  } catch (err: unknown) {
    log.error('Error canceling subscription', err as Error);
    return { success: false, error: 'Internal server error' };
  }
}

// Get billing history
export async function getBillingHistory(userId: string): Promise<{ success: boolean; invoices?: any[]; error?: string }> {
  try {
    const response = await fetch(`/api/billing-history?userId=${userId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch billing history' };
    }

    return { success: true, invoices: data.invoices };
  } catch (err: unknown) {
    log.error('Error fetching billing history', err as Error);
    return { success: false, error: 'Internal server error' };
  }
} 
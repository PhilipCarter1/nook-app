import { supabase } from '@/lib/supabase';
import { requireStripe } from '../stripe-client';
import Stripe from 'stripe';

// Export a stripe instance getter for webhook handler
export const getStripeInstance = (): Stripe => requireStripe();
const stripe = getStripeInstance();

export async function createStripeCustomer(organizationId: string, email: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      organizationId,
    },
  });

  // Store Stripe customer ID in the database
  await supabase
    .from('organizations')
    .update({ stripe_customer_id: customer.id })
    .eq('id', organizationId);

  return customer;
}

export async function createSubscription(
  organizationId: string,
  planId: string,
  billingCycle: 'monthly' | 'annual'
) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('stripe_customer_id, email')
    .eq('id', organizationId)
    .single();

  if (!organization) throw new Error('Organization not found');

  // Create or get Stripe customer
  let customerId = organization.stripe_customer_id;
  if (!customerId) {
    const customer = await createStripeCustomer(organizationId, organization.email);
    customerId = customer.id;
  }

  // Create Stripe subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: planId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      organizationId,
    },
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPlanId,
    }],
    proration_behavior: 'always_invoice',
  });
}

export async function createUsageAlert(
  organizationId: string,
  type: 'properties' | 'units' | 'users',
  current: number,
  limit: number
) {
  const { data: organization } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organizationId)
    .single();

  if (!organization?.stripe_customer_id) return;

  // Mock implementation - Stripe doesn't have usageRecords API
  
  // Store usage alert in database instead
  await supabase
    .from('usage_alerts')
    .insert({
      organization_id: organizationId,
      type,
      current_usage: current,
      limit,
      created_at: new Date().toISOString(),
    });
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleFailedPayment(event.data.object as Stripe.Invoice);
      break;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) return;

  await supabase
    .from('subscriptions')
    .upsert({
      organization_id: organizationId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      plan_id: subscription.items.data[0].price.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('organization_id', organizationId);
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  const organizationId = invoice.subscription_details?.metadata?.organizationId;
  if (!organizationId) return;

  await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      status: 'paid',
      paid_at: new Date().toISOString(),
    });
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const organizationId = invoice.subscription_details?.metadata?.organizationId;
  if (!organizationId) return;

  await supabase
    .from('invoices')
    .insert({
      organization_id: organizationId,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      status: 'failed',
      failed_at: new Date().toISOString(),
    });
} 
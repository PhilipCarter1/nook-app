import { supabase } from '@/lib/supabase';
import { requireStripe } from '../stripe-client';
import Stripe from 'stripe';
import { log } from '@/lib/logger';
import { sendPaymentConfirmationEmail } from '@/lib/email/client';

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
    // Checkout session events (one-time payments)
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;

    // Subscription events
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeletion(event.data.object as Stripe.Subscription);
      break;

    // Invoice events
    case 'invoice.payment_succeeded':
      await handleSuccessfulPayment(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleFailedPayment(event.data.object as Stripe.Invoice);
      break;

    // Payment intent events (for payment element)
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      // Ignore other event types
      break;
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent ? String(session.payment_intent) : null,
      stripe_customer_id: session.customer ? String(session.customer) : null,
      amount: session.amount_total ? session.amount_total / 100 : null, // Convert from cents
      currency: session.currency || 'usd',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', session.id);

  if (error) {
    log.error('Failed to update payment record', error as Error);
  }

  // Send payment confirmation email (if we have user email)
  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (user?.email) {
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      const date = new Date().toISOString();
      void sendPaymentConfirmationEmail(user.email, `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email, amount, date);
    }
  } catch (e) {
    log.error('Failed to send payment confirmation email', e as Error);
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_session_id', session.id);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) return;

  // Update any payment records associated with this intent
  await supabase
    .from('payments')
    .update({
      status: 'completed',
      stripe_payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .or(`stripe_payment_intent_id.is.null`);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata?.userId;
  if (!userId) return;

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      stripe_payment_intent_id: paymentIntent.id,
      error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
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
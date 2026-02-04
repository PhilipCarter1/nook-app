import { supabase } from '../supabase';
import { sendPaymentReceipt } from './email';
import { requireStripe } from '../stripe-client';

export interface CreatePaymentIntentParams {
  leaseId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'maintenance';
  dueDate: Date;
}

export interface PaymentWebhookData {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      amount: number;
      status: string;
      payment_intent: string;
    };
  };
}

export async function createPaymentIntent({
  leaseId,
  amount,
  type,
  dueDate,
}: CreatePaymentIntentParams) {
  // Get lease details
  const { data: leaseData, error: leaseError } = await supabase
    .from('leases')
    .select('*')
    .eq('id', leaseId)
    .limit(1);
  if (leaseError) throw leaseError;
  const lease = leaseData?.[0];
  if (!lease) {
    throw new Error('Lease not found');
  }

  // Get tenant details
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', lease.tenantId)
    .limit(1);
  if (tenantError) throw tenantError;
  const tenant = tenantData?.[0];
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Create or get Stripe customer
  let customerId = lease.stripeCustomerId;
  if (!customerId) {
    const stripe = requireStripe();
    const customer = await stripe.customers.create({
      email: tenant.email,
      metadata: {
        tenantId: tenant.id,
        leaseId: lease.id,
      },
    });
    customerId = customer.id;

    // Update lease with Stripe customer ID
    const { error: updateError } = await supabase
      .from('leases')
      .update({ stripeCustomerId: customerId })
      .eq('id', leaseId);
    if (updateError) throw updateError;
  }

  // Create payment intent
  const stripe2 = requireStripe();
  const paymentIntent = await stripe2.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    customer: customerId,
    metadata: {
      leaseId,
      type,
    },
  });

  // Create payment record
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert([{
      leaseId,
      amount,
      type,
      status: 'pending',
      stripePaymentId: paymentIntent.id,
      stripeCustomerId: customerId,
      dueDate,
    }])
    .select('*')
    .limit(1);
  if (paymentError) throw paymentError;
  const payment = paymentData?.[0];

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function handlePaymentWebhook(data: PaymentWebhookData) {
  const { type, data: eventData } = data;

  if (type === 'payment_intent.succeeded') {
    const { id, amount, customer } = eventData.object;

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paidAt: new Date(),
      })
      .eq('stripePaymentId', id);
    if (updateError) throw updateError;

    // Get payment details
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripePaymentId', id)
      .limit(1);
    if (paymentError) throw paymentError;
    const payment = paymentData?.[0];

    if (payment) {
      // Send payment receipt
      await sendPaymentReceipt(
        payment.email,
        payment.amount,
        'Property', // TODO: Get actual property name
        `${process.env.NEXT_PUBLIC_APP_URL}/payments/${payment.id}`
      );
    }
  }
}

export async function scheduleRecurringPayment(
  leaseId: string,
  amount: number,
  startDate: Date,
  frequency: 'monthly' | 'weekly' | 'biweekly'
) {
  const { data: leaseData, error: leaseError } = await supabase
    .from('leases')
    .select('*')
    .eq('id', leaseId)
    .limit(1);
  if (leaseError) throw leaseError;
  const lease = leaseData?.[0];
  if (!lease) {
    throw new Error('Lease not found');
  }

  // Calculate next payment date based on frequency
  const nextPaymentDate = new Date(startDate);
  switch (frequency) {
    case 'monthly':
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      break;
    case 'weekly':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      break;
    case 'biweekly':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
      break;
  }

  // Create scheduled payment
  const { error: insertError } = await supabase
    .from('payments')
    .insert([{
      leaseId,
      amount,
      type: 'rent',
      status: 'scheduled',
      dueDate: nextPaymentDate,
    }]);
  if (insertError) throw insertError;
}

export async function getPaymentHistory(leaseId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('lease_id', leaseId)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getUpcomingPayments(leaseId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('lease_id', leaseId)
    .eq('status', 'scheduled')
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
} 
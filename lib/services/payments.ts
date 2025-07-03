import Stripe from 'stripe';
import { db } from '../db';
import { payments, leases, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendPaymentReceipt } from './email';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

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
  const [lease] = await db
    .select()
    .from(leases)
    .where(eq(leases.id, leaseId));

  if (!lease) {
    throw new Error('Lease not found');
  }

  // Get tenant details
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, lease.tenantId));

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Create or get Stripe customer
  let customerId = lease.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: tenant.email,
      metadata: {
        tenantId: tenant.id,
        leaseId: lease.id,
      },
    });
    customerId = customer.id;

    // Update lease with Stripe customer ID
    await db
      .update(leases)
      .set({ stripeCustomerId: customerId })
      .where(eq(leases.id, leaseId));
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'usd',
    customer: customerId,
    metadata: {
      leaseId,
      type,
    },
  });

  // Create payment record
  const [payment] = await db
    .insert(payments)
    .values({
      leaseId,
      amount,
      type,
      status: 'pending',
      stripePaymentId: paymentIntent.id,
      stripeCustomerId: customerId,
      dueDate,
    })
    .returning();

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
    await db
      .update(payments)
      .set({
        status: 'paid',
        paidAt: new Date(),
      })
      .where(eq(payments.stripePaymentId, id));

    // Get payment details
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentId, id));

    if (payment) {
      // Send payment receipt
      await sendPaymentReceipt({
        email: payment.email,
        amount: payment.amount,
        type: payment.type,
        date: new Date(),
        paymentId: payment.id,
      });
    }
  }
}

export async function scheduleRecurringPayment(
  leaseId: string,
  amount: number,
  startDate: Date,
  frequency: 'monthly' | 'weekly' | 'biweekly'
) {
  const [lease] = await db
    .select()
    .from(leases)
    .where(eq(leases.id, leaseId));

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
  await db.insert(payments).values({
    leaseId,
    amount,
    type: 'rent',
    status: 'scheduled',
    dueDate: nextPaymentDate,
  });
}

export async function getPaymentHistory(leaseId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.leaseId, leaseId))
    .orderBy(payments.dueDate);
}

export async function getUpcomingPayments(leaseId: string) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.leaseId, leaseId))
    .where(eq(payments.status, 'scheduled'))
    .orderBy(payments.dueDate);
} 
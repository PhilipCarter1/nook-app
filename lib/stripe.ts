import Stripe from 'stripe';
import { supabase } from './supabase';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
}

export async function createPaypalOrder(amount: number, propertyId: string, type: 'rent' | 'deposit') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch('/api/create-paypal-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      propertyId,
      type,
      userId: user.id,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create PayPal order');
  }

  return response.json();
}

export async function updatePaymentStatus(paymentId: string, status: 'paid' | 'failed') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('payments')
    .update({
      status,
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', paymentId)
    .eq('user_id', user.id);

  if (error) throw error;
} 
import { getClient } from '@/lib/supabase/client';
import { requireStripe } from '@/lib/stripe-client';
import Stripe from 'stripe';

const supabase = getClient();

export async function createPaymentIntent(amount: number, leaseId: string) {
  try {
    const stripe = requireStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        leaseId,
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

export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { leaseId } = paymentIntent.metadata;

        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            stripe_payment_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('lease_id', leaseId);

        // TODO: Send email notification
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { leaseId } = paymentIntent.metadata;

        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            stripe_payment_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq('lease_id', leaseId);

        // TODO: Send email notification
        break;
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}

export async function confirmPayment(paymentIntentId: string) {
  try {
    const stripe = requireStripe();
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
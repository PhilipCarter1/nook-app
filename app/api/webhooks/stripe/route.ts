import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { paymentId, propertyId, userId, type } = paymentIntent.metadata;

        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            transaction_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (updateError) {
          throw updateError;
        }

        // Create payment history record
        const { error: historyError } = await supabase
          .from('payment_history')
          .insert([{
            payment_id: paymentId,
            property_id: propertyId,
            user_id: userId,
            type,
            amount: paymentIntent.amount / 100, // Convert from cents
            status: 'completed',
            transaction_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
          }]);

        if (historyError) {
          throw historyError;
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { paymentId } = paymentIntent.metadata;

        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'failed',
            transaction_id: paymentIntent.id,
          })
          .eq('id', paymentId);

        if (updateError) {
          throw updateError;
        }

        break;
      }
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
} 
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getClient } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let receiptUrl: string | null = null;
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          const pi = (paymentIntent as any).charges ? paymentIntent : (paymentIntent as any).data;
          if (
            pi.charges &&
            Array.isArray(pi.charges.data) &&
            pi.charges.data.length > 0
          ) {
            receiptUrl = pi.charges.data[0].receipt_url || null;
          }
        }
        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            receipt_url: receiptUrl,
          })
          .eq('payment_intent_id', session.payment_intent);

        // If this is a subscription, create or update subscription record
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabase
            .from('payment_subscriptions')
            .upsert({
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              unit_id: session.metadata?.unit_id,
              tenant_id: session.metadata?.tenant_id,
            });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Create payment record for successful invoice
        await supabase
          .from('payments')
          .insert({
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: 'completed',
            payment_method: 'stripe',
            payment_intent_id: invoice.payment_intent,
            receipt_url: invoice.hosted_invoice_url,
            unit_id: invoice.metadata?.unit_id,
            tenant_id: invoice.metadata?.tenant_id,
          });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
          })
          .eq('payment_intent_id', invoice.payment_intent);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        await supabase
          .from('payment_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status to canceled
        await supabase
          .from('payment_subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 
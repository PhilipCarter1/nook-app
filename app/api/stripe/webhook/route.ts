import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';
import { requireStripe } from '@/lib/stripe-client';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  let stripe: Stripe | undefined;

  try {
    stripe = requireStripe();
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    log.error('Webhook signature verification failed:', err as Error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let receiptUrl: string | null = null;
        if (session.payment_intent) {
          const paymentIntentRaw = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          const paymentIntent = paymentIntentRaw as Stripe.PaymentIntent;
          const chargesData = paymentIntent?.charges?.data;
          if (chargesData && chargesData.length > 0) {
            receiptUrl = chargesData[0].receipt_url || null;
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Error processing webhook:', { message, error: err });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
} 
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
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
    log.error('Webhook signature verification failed:', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        let receiptUrl: string | null = null;
        let paymentIntentId: string | undefined;
        
        if (session.payment_intent) {
          paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent.id;
          
          // Retrieve charges list for receipt URL
          try {
            const charges = await stripe.charges.list({ payment_intent: paymentIntentId });
            if (charges.data && charges.data.length > 0) {
              receiptUrl = charges.data[0].receipt_url || null;
            }
          } catch (chargeErr) {
            log.error('Failed to retrieve charges:', chargeErr instanceof Error ? chargeErr : new Error(String(chargeErr)));
          }
        }
        
        // Update payment status
        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              status: 'completed',
              receipt_url: receiptUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('payment_intent_id', paymentIntentId);
        }

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
            payment_intent_id: invoice.payment_intent as string,
            receipt_url: invoice.hosted_invoice_url,
            unit_id: invoice.metadata?.unit_id,
            tenant_id: invoice.metadata?.tenant_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
            updated_at: new Date().toISOString(),
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
            updated_at: new Date().toISOString(),
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
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Error processing webhook:', err instanceof Error ? err : new Error(String(err)));
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
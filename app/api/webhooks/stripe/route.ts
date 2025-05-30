import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getClient } from '@/lib/supabase/client';
import { emailService } from '@/lib/email-service';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature || !webhookSecret) {
      return new NextResponse('Missing signature or webhook secret', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    const supabase = getClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { userId, unitId } = paymentIntent.metadata;

        // Update tenant payment status
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            payment_status: 'paid',
            payment_method: 'stripe',
          })
          .eq('user_id', userId)
          .eq('unit_id', unitId);

        if (updateError) throw updateError;

        // Get tenant details for email
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*, users:user_id(email, full_name)')
          .eq('user_id', userId)
          .single();

        if (tenant?.users?.email) {
          await emailService.sendPaymentConfirmation(
            tenant.users.email,
            tenant.users.full_name,
            paymentIntent.amount / 100
          );
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { userId, unitId } = paymentIntent.metadata;

        // Update tenant payment status
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            payment_status: 'failed',
          })
          .eq('user_id', userId)
          .eq('unit_id', unitId);

        if (updateError) throw updateError;

        // Get tenant details for email
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*, users:user_id(email, full_name)')
          .eq('user_id', userId)
          .single();

        if (tenant?.users?.email) {
          await emailService.sendDocumentRejection(
            tenant.users.email,
            tenant.users.full_name,
            'Payment failed. Please try again.'
          );
        }

        break;
      }
    }

    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Webhook error', { status: 400 });
  }
} 
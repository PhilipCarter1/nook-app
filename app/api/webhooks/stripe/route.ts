import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, handleWebhookEvent } from '@/lib/services/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature || !webhookSecret) {
      return new NextResponse('Missing stripe signature or webhook secret', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    await handleWebhookEvent(event);

    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return new NextResponse(
      `Webhook Error: ${err.message}`,
      { status: 400 }
    );
  }
} 
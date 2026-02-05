import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireStripe } from '@/lib/stripe-client';
import { log } from '@/lib/logger';

/**
 * Create a Stripe Checkout Session
 * POST /api/create-checkout-session
 * 
 * Protected: Requires authentication
 * 
 * Request body:
 * {
 *   "priceId": "price_xxx",           // Stripe price ID
 *   "successUrl": "http://...",       // URL after successful payment
 *   "cancelUrl": "http://..."         // URL if payment is cancelled
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth();
    log.info(`Checkout session request from user: ${user.id}`);

    // 2. Parse and validate request
    const body = (await request.json()) as {
      priceId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };
    const { priceId, successUrl, cancelUrl } = body;

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required parameters: priceId, successUrl, cancelUrl' },
        { status: 400 }
      );
    }

    // Validate URLs
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format for successUrl or cancelUrl' },
        { status: 400 }
      );
    }

    // 3. Get or create Stripe customer
    const stripe = requireStripe();
    const supabase = createAdminClient();

    let customerId: string;

    // Check if user already has a Stripe customer ID
    const { data: userProfile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userProfile?.stripe_customer_id) {
      customerId = userProfile.stripe_customer_id;
      log.info(`Found existing Stripe customer: ${customerId}`);
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          userId: user.id,
          name: user.user_metadata?.full_name || 'Unknown',
        },
      });

      customerId = customer.id;
      log.info(`Created new Stripe customer: ${customerId}`);

      // Store customer ID in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        log.error('Failed to save Stripe customer ID:', updateError);
        // Continue anyway - payment can still be processed
      }
    }

    // 4. Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // Use 'subscription' if priceId is a subscription price
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        createdAt: new Date().toISOString(),
      },
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    if (!session.id) {
      throw new Error('Failed to create checkout session');
    }

    log.info(`Checkout session created: ${session.id}`);

    // 5. Store session in database for tracking
    const { error: sessionError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_customer_id: customerId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (sessionError) {
      log.error('Failed to store session in database:', sessionError);
      // Continue anyway - webhook will still update the payment status
    }

    // 6. Return session ID
    return NextResponse.json({
      sessionId: session.id,
      clientSecret: session.client_secret,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Checkout session creation failed:', err instanceof Error ? err : new Error(String(err)));

    if (message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json({ error: message || 'Failed to create checkout session' }, { status: 500 });
  }
}

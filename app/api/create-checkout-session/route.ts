import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, successUrl, cancelUrl, stripePriceId } = await request.json();

    if (!planId || !userId || !successUrl || !cancelUrl || !stripePriceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      // Try to find existing customer by email or user ID
      const customers = await stripe.customers.list({
        limit: 1,
        email: userId, // Assuming userId is email for now
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: userId,
          metadata: {
            userId: userId,
            planId: planId,
          },
        });
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe-client';

export async function POST(request: NextRequest) {
  try {
    const { accountId, returnUrl, refreshUrl } = await request.json();
    if (!accountId || !returnUrl || !refreshUrl) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const stripe = requireStripe();
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account link:', error);
    return NextResponse.json({ error: 'Failed to create account link' }, { status: 500 });
  }
}

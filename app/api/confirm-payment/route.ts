import { NextRequest, NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe-client';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();
    if (!paymentIntentId) return NextResponse.json({ confirmed: false });

    const stripe = requireStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId as string);
    return NextResponse.json({ confirmed: pi.status === 'succeeded' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ confirmed: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireStripe } from '@/lib/stripe-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const stripe = requireStripe();
    // Find the customer
    const customers = await stripe.customers.list({
      limit: 1,
      email: userId,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ invoices: [] });
    }

    const customer = customers.data[0];

    // Get billing history (invoices)
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 50,
    });

    return NextResponse.json({ invoices: invoices.data });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}

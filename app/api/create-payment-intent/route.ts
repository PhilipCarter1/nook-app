import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { log } from '@/lib/logger';
import { requireStripe } from '@/lib/stripe-client';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    // Use server helper that reads cookies for the current request/session
    const supabase = createServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { amount, propertyId, type } = await request.json();

    if (!amount || isNaN(Number(amount))) {
      return new NextResponse('Invalid amount', { status: 400 });
    }

    // Create payment record (align columns with DB schema)
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        unit_id: propertyId || null,
        user_id: session.user.id,
        tenant_id: session.user.id,
        amount: Number(amount),
        currency: 'usd',
        status: 'pending',
        payment_method: 'stripe',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Create Stripe payment intent
    const stripe = requireStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        paymentId: payment.id,
        unitId: propertyId || null,
        userId: session.user.id,
        type,
      },
    });

    // Save payment_intent_id in DB
    await supabase
      .from('payments')
      .update({ payment_intent_id: paymentIntent.id, updated_at: new Date().toISOString() })
      .eq('id', payment.id);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    log.error('Error creating payment intent:', error as Error);
    return new NextResponse('Error creating payment intent', { status: 500 });
  }
}
 
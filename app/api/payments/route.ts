import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { db } from '@/lib/db';
import { getUser } from '@/lib/supabase';
import { log } from '@/lib/logger';
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { amount, leaseId, type } = await req.json();

    if (!amount || !leaseId || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create payment record
    const { data: payment, error: insertError } = await db
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount,
        type,
        status: 'pending',
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      log.error('Error inserting payment:', insertError as Error);
      return new NextResponse('Failed to create payment record', { status: 500 });
    }

    // Create Stripe payment intent
    const { clientSecret, paymentIntentId } = await createPaymentIntent(amount, leaseId);

    // Update payment record with Stripe payment ID
    const { error: updateError } = await db
      .from('payments')
      .update({
        stripe_payment_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      log.error('Error updating payment:', updateError as Error);
    }

    return NextResponse.json({
      clientSecret,
      paymentId: payment.id,
    });
  } catch (error) {
    log.error('Error creating payment:', error as Error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create payment' }),
      { status: 500 }
    );
  }
} 
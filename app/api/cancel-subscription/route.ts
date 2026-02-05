import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase/server';
import { requireStripe } from '@/lib/stripe-client';
import { createAdminClient } from '@/lib/supabase/server';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Require auth - only authenticated users can cancel their subscriptions
    const user = await requireAuth();
    log.info(`Cancel subscription request from user: ${user.id}`);

    const { subscriptionId } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId parameter' },
        { status: 400 }
      );
    }

    const stripe = requireStripe();
    const supabase = createAdminClient();

    // Verify that this subscription belongs to the user
    const { data: subscription } = await supabase
      .from('payment_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('tenant_id', user.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or access denied' },
        { status: 404 }
      );
    }

    // Cancel the subscription (set cancel_at_period_end to let it run until period end)
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update DB record
    await supabase
      .from('payment_subscriptions')
      .update({ status: 'cancel_scheduled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscriptionId);
    log.info(`Subscription ${subscriptionId} scheduled for cancellation`);

    return NextResponse.json({ success: true, subscription: stripeSubscription });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Error canceling subscription:', err instanceof Error ? err : new Error(String(err)));

    if (message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

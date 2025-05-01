import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { PaymentHistory } from '@/components/payment/PaymentHistory';

export default async function PaymentsPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <div>Please sign in to view payments</div>;
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .single();

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Make a Payment</h2>
            <PaymentForm
              amount={property?.rent_amount || 0}
              propertyId={property?.id || ''}
              type="rent"
              userId={session.user.id}
            />
          </div>
        </div>
        <div>
          <PaymentHistory payments={payments || []} />
        </div>
      </div>
    </div>
  );
} 
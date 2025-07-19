"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { getLease } from '@/lib/services/leases';
import { createPaymentIntent } from '@/lib/services/payments';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { log } from '@/lib/logger';
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const [lease, setLease] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaseData = await getLease(params.id);
        if (!leaseData) {
          redirect('/dashboard');
          return;
        }

        const { clientSecret: secret } = await createPaymentIntent({
          leaseId: leaseData.id,
          amount: leaseData.monthlyRent,
          type: 'rent',
          dueDate: new Date(),
        });

        setLease(leaseData);
        setClientSecret(secret);
      } catch (error) {
        log.error('Error fetching payment data:', error as Error);
        redirect('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card className="p-6">
            <div>Loading...</div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!lease || !clientSecret) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card className="p-6">
            <div>Error loading payment information</div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Make Payment</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Payment Details</h2>
              <p className="text-gray-600">
                Property: {lease.property.name}
              </p>
              <p className="text-gray-600">
                Unit: {lease.unit.number}
              </p>
              <p className="text-gray-600">
                Amount: ${lease.monthlyRent.toFixed(2)}
              </p>
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: clientSecret,
                appearance: {
                  theme: 'stripe',
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                amount={lease.monthlyRent}
                onSuccess={() => {
                  // Handle success
                }}
                onCancel={() => {
                  // Handle cancel
                }}
              />
            </Elements>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
} 
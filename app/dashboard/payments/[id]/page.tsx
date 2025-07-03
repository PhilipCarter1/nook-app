import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { getLease } from '@/lib/services/leases';
import { createPaymentIntent } from '@/lib/services/payments';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const metadata: Metadata = {
  title: 'Make Payment | Nook',
  description: 'Make a payment for your lease',
};

interface PaymentPageProps {
  params: {
    id: string;
  };
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const lease = await getLease(params.id);

  if (!lease) {
    redirect('/dashboard');
  }

  const { clientSecret } = await createPaymentIntent({
    leaseId: lease.id,
    amount: lease.monthlyRent,
    type: 'rent',
    dueDate: new Date(),
  });

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
                clientSecret,
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
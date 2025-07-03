import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) {
  if (!searchParams.payment_intent) {
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Thank you for your payment!
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/payments">View Payment History</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DocumentUpload } from './DocumentUpload';
import { getClient } from '@/lib/supabase/client';
import { CreditCard, Banknote, Receipt } from 'lucide-react';

interface DepositPaymentProps {
  propertyId: string;
  userId: string;
  amount: number;
  onPaymentComplete: () => void;
}

export default function DepositPayment({
  propertyId,
  userId,
  amount,
  onPaymentComplete,
}: DepositPaymentProps) {
  const [paymentMethod, setPaymentMethod] = React.useState<'stripe' | 'manual'>('stripe');
  const [loading, setLoading] = React.useState(false);
  const [receiptUrl, setReceiptUrl] = React.useState('');
  const supabase = getClient();

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      // Create Stripe checkout session
      const { data: session, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount,
          propertyId,
          userId,
          type: 'deposit',
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating payment session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = async () => {
    if (!receiptUrl) return;

    setLoading(true);
    try {
      // Create payment record
      const { error } = await supabase.from('payments').insert({
        property_id: propertyId,
        user_id: userId,
        amount,
        type: 'deposit',
        status: 'pending',
        receipt_url: receiptUrl,
        payment_method: 'manual',
      });

      if (error) throw error;

      onPaymentComplete();
    } catch (error) {
      console.error('Error recording manual payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = (url: string) => {
    setReceiptUrl(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Deposit Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <Label>Select Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'stripe' | 'manual')}
                className="grid gap-4"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div>
                          <Label htmlFor="stripe" className="font-semibold">
                            Credit Card (Stripe)
                          </Label>
                          <p className="text-sm text-gray-500">
                            Pay securely with credit card
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="manual" id="manual" />
                      <div className="flex items-center gap-4">
                        <Banknote className="h-8 w-8 text-primary" />
                        <div>
                          <Label htmlFor="manual" className="font-semibold">
                            Bank Transfer
                          </Label>
                          <p className="text-sm text-gray-500">
                            Pay via bank transfer and upload receipt
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            {paymentMethod === 'manual' && (
              <div className="space-y-4">
                <Label>Upload Payment Receipt</Label>
                <DocumentUpload
                  onUploadComplete={handleReceiptUpload}
                  onUploadError={(error) => console.error('Upload error:', error)}
                  acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                  propertyId={propertyId}
                  userId={userId}
                />
              </div>
            )}

            <Button
              className="w-full"
              onClick={paymentMethod === 'stripe' ? handleStripePayment : handleManualPayment}
              disabled={loading || (paymentMethod === 'manual' && !receiptUrl)}
            >
              {loading ? 'Processing...' : 'Pay Deposit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
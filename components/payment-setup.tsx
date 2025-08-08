'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getClient } from '@/lib/supabase/client';
import { CreditCard, Banknote, Clock } from 'lucide-react';
interface PaymentSetupProps {
  data: {
    payment: {
      method: string;
      stripeConnected: boolean;
    };
  };
  onComplete: (data: any) => void;
  onBack: () => void;
}

export default function PaymentSetup({ data, onComplete, onBack }: PaymentSetupProps) {
  const [formData, setFormData] = React.useState({
    method: data.payment.method,
    stripeConnected: data.payment.stripeConnected,
  });
  const [loading, setLoading] = React.useState(false);
  const supabase = getClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.method === 'stripe') {
        // TODO: Implement Stripe Connect onboarding
        // This would typically redirect to Stripe Connect onboarding
        // and handle the OAuth flow
      }

      onComplete({
        payment: formData,
      });
    } catch (error) {
      console.error('Error setting up payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>Select Payment Method</Label>
        <RadioGroup
          value={formData.method}
          onValueChange={(value) => setFormData({ ...formData, method: value })}
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
                      Stripe Payments
                    </Label>
                    <p className="text-sm text-gray-500">
                      Accept credit cards and bank transfers
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
                      Manual Bank Transfer
                    </Label>
                    <p className="text-sm text-gray-500">
                      Process payments manually with bank transfers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <RadioGroupItem value="trial" id="trial" />
                <div className="flex items-center gap-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <Label htmlFor="trial" className="font-semibold">
                      Start Free Trial
                    </Label>
                    <p className="text-sm text-gray-500">
                      Set up payment later, start with a 14-day trial
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Setting up...' : 'Next'}
        </Button>
      </div>
    </form>
  );
} 
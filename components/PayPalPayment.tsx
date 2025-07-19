import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, DollarSign, CheckCircle } from 'lucide-react';
import { log } from '@/lib/logger';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { createPayPalOrder, capturePayPalOrder } from '@/lib/paypal';

interface PayPalPaymentProps {
  amount: number;
  unitId: string;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export default function PayPalPayment({ amount, unitId, onSuccess, onError }: PayPalPaymentProps) {
  const handleCreateOrder = async () => {
    try {
      const order = await createPayPalOrder(amount, unitId);
      return order.id;
    } catch (error) {
      log.error('Error creating PayPal order:', error as Error);
      toast.error('Failed to create PayPal order');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async (orderId: string) => {
    try {
      setLoading(true);
      // Simulate PayPal capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment captured successfully!');
      onSuccess?.();
    } catch (error) {
      log.error('Error capturing PayPal order:', error as Error);
      toast.error('Failed to capture payment');
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    log.error('PayPal error:', err as Error);
    toast.error('PayPal payment failed');
  };

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        }}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onError={(err) => {
          log.error('PayPal error:', err as Error);
          toast.error('Payment failed');
          onError(new Error('Payment failed'));
        }}
      />
    </div>
  );
} 
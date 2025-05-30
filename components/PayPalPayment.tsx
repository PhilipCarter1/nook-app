import React from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { createPayPalOrder, capturePayPalOrder } from '@/lib/paypal';
import { toast } from 'sonner';

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
      console.error('Error creating PayPal order:', error);
      toast.error('Failed to create PayPal order');
      onError(error instanceof Error ? error : new Error('Failed to create PayPal order'));
      throw error;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      const order = await capturePayPalOrder(data.orderID);
      
      if (order.status === 'COMPLETED') {
        toast.success('Payment completed successfully');
        onSuccess();
      } else {
        throw new Error('Payment not completed');
      }
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      toast.error('Payment failed');
      onError(error instanceof Error ? error : new Error('Payment failed'));
    }
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
          console.error('PayPal error:', err);
          toast.error('Payment failed');
          onError(new Error('Payment failed'));
        }}
      />
    </div>
  );
} 
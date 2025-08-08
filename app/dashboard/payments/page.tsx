'use client';

import React, { useState } from 'react';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments] = useState([]);

  const handlePaymentSuccess = () => {
    toast.success('Payment processed successfully!');
  };

  const handlePaymentCancel = () => {
    toast.info('Payment cancelled');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PaymentForm 
            amount={0}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
          <PaymentHistory payments={payments} />
        </div>
      </div>
    </div>
  );
} 
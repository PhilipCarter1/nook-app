import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Building2, ExternalLink } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';

interface PaymentOptionsProps {
  onComplete: (method: string, receiptUrl?: string) => void;
}

export default function PaymentOptions({ onComplete }: PaymentOptionsProps) {
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);

  const handleReceiptUpload = (file: File) => {
    setReceiptFile(file);
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'bank_transfer' && !receiptFile) {
      alert('Please upload a receipt for bank transfer');
      return;
    }

    // For Stripe, you would integrate with Stripe Elements here
    if (selectedMethod === 'stripe') {
      // TODO: Implement Stripe payment
      onComplete('stripe');
      return;
    }

    // For PayPal, redirect to PayPal
    if (selectedMethod === 'paypal') {
      // TODO: Implement PayPal redirect
      window.open('https://www.paypal.com', '_blank');
      return;
    }

    // For bank transfer, handle receipt upload
    if (selectedMethod === 'bank_transfer' && receiptFile) {
      // TODO: Upload receipt to storage and get URL
      const receiptUrl = 'placeholder_url';
      onComplete('bank_transfer', receiptUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`p-4 cursor-pointer ${
            selectedMethod === 'stripe' ? 'border-primary' : ''
          }`}
          onClick={() => setSelectedMethod('stripe')}
        >
          <div className="flex items-center space-x-4">
            <CreditCard className="w-6 h-6" />
            <div>
              <h3 className="font-medium">Credit Card</h3>
              <p className="text-sm text-gray-500">Pay with Stripe</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer ${
            selectedMethod === 'bank_transfer' ? 'border-primary' : ''
          }`}
          onClick={() => setSelectedMethod('bank_transfer')}
        >
          <div className="flex items-center space-x-4">
            <Building2 className="w-6 h-6" />
            <div>
              <h3 className="font-medium">Bank Transfer</h3>
              <p className="text-sm text-gray-500">Upload receipt</p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer ${
            selectedMethod === 'paypal' ? 'border-primary' : ''
          }`}
          onClick={() => setSelectedMethod('paypal')}
        >
          <div className="flex items-center space-x-4">
            <ExternalLink className="w-6 h-6" />
            <div>
              <h3 className="font-medium">PayPal</h3>
              <p className="text-sm text-gray-500">External payment</p>
            </div>
          </div>
        </Card>
      </div>

      {selectedMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Bank Account Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm">
                Bank: Example Bank
                <br />
                Account Number: 1234567890
                <br />
                Routing Number: 987654321
                <br />
                Account Name: Property Management LLC
              </p>
            </div>
          </div>

          <DocumentUpload
            type="income"
            onUpload={handleReceiptUpload}
            status={receiptFile ? 'pending' : undefined}
          />
        </div>
      )}

      {selectedMethod && (
        <Button
          className="w-full"
          onClick={handlePayment}
          disabled={selectedMethod === 'bank_transfer' && !receiptFile}
        >
          {selectedMethod === 'stripe'
            ? 'Pay with Stripe'
            : selectedMethod === 'paypal'
            ? 'Continue to PayPal'
            : 'Submit Payment'}
        </Button>
      )}
    </div>
  );
} 
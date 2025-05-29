'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Calendar, CreditCard, AlertCircle } from 'lucide-react';

export default function PaymentsPage() {
  const { role } = useAuth();
  const [payments, setPayments] = React.useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    amount: '',
    type: 'rent',
    paymentMethod: 'credit_card',
  });

  // Mock data for now - will be replaced with actual data fetching
  const mockPayments = [
    {
      id: '1',
      amount: 2500,
      type: 'rent',
      status: 'completed',
      due_date: '2024-04-01T00:00:00Z',
      paid_date: '2024-03-28T10:30:00Z',
      property: 'Sunset Apartments',
    },
    {
      id: '2',
      amount: 2500,
      type: 'rent',
      status: 'pending',
      due_date: '2024-05-01T00:00:00Z',
      paid_date: null,
      property: 'Sunset Apartments',
    },
    {
      id: '3',
      amount: 2500,
      type: 'deposit',
      status: 'completed',
      due_date: '2024-03-01T00:00:00Z',
      paid_date: '2024-03-01T09:15:00Z',
      property: 'Sunset Apartments',
    },
  ];

  React.useEffect(() => {
    // TODO: Fetch payments
    setPayments(mockPayments);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Process payment
    setShowPaymentForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const upcomingPayments = payments.filter(p => p.status === 'pending');
  const pastPayments = payments.filter(p => p.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        {role === 'tenant' && (
          <Button onClick={() => setShowPaymentForm(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Make Payment
          </Button>
        )}
      </div>

      {showPaymentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="deposit">Security Deposit</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Process Payment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {role === 'tenant' && upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">${payment.amount}</h3>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline">Pay Now</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">${payment.amount}</h3>
                  <p className="text-sm text-gray-500">
                    {payment.type === 'rent' ? 'Rent' : 'Security Deposit'} - {payment.property}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm capitalize">{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
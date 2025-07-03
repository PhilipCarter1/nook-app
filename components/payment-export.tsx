'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { payments } from '@/lib/db/schema';

interface PaymentExportProps {
  payments: typeof payments.$inferSelect[];
}

export function PaymentExport({ payments }: PaymentExportProps) {
  const handleExport = () => {
    // Convert payments to CSV format
    const headers = [
      'Date',
      'Amount',
      'Type',
      'Status',
      'Payment ID',
      'Customer ID',
      'Created At',
      'Paid At',
    ];

    const rows = payments.map((payment) => [
      new Date(payment.createdAt).toLocaleDateString(),
      payment.amount.toFixed(2),
      payment.type,
      payment.status,
      payment.stripePaymentId || '',
      payment.stripeCustomerId || '',
      new Date(payment.createdAt).toISOString(),
      payment.paidAt ? new Date(payment.paidAt).toISOString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
} 
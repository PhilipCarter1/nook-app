'use client';

import { useState } from 'react';
import { payments } from '@/lib/db/schema';
import { PaymentDetails } from './payment-details';

interface PaymentDetailsClientProps {
  payment: typeof payments.$inferSelect;
}

export function PaymentDetailsClient({ payment }: PaymentDetailsClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        View Details
      </button>
      <PaymentDetails
        payment={payment}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
} 
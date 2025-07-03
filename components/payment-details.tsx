import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { payments } from '@/lib/db/schema';

interface PaymentDetailsProps {
  payment: typeof payments.$inferSelect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDetails({
  payment,
  open,
  onOpenChange,
}: PaymentDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Amount
              </div>
              <div className="text-lg font-semibold">
                ${payment.amount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Status
              </div>
              <Badge
                variant={
                  payment.status === 'completed'
                    ? 'default'
                    : payment.status === 'pending'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {payment.status}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Type
              </div>
              <div>
                {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Created At
              </div>
              <div>
                {format(new Date(payment.createdAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
          {payment.paidAt && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Paid At
              </div>
              <div>
                {format(new Date(payment.paidAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          )}
          {payment.stripePaymentId && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Payment ID
              </div>
              <div className="font-mono text-sm">
                {payment.stripePaymentId}
              </div>
            </div>
          )}
          {payment.stripeCustomerId && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Customer ID
              </div>
              <div className="font-mono text-sm">
                {payment.stripeCustomerId}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
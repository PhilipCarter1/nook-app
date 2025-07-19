import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Paperclip, Clock, User, Building, Home, Phone, Mail, AlertCircle } from 'lucide-react';
import { PremiumCard, PremiumCardHeader, PremiumCardContent, PremiumCardFooter } from '@/components/ui/PremiumCard';
import { PremiumLayout } from '@/components/layout/PremiumLayout';
import { cn } from '@/lib/utils';
import type { MaintenanceTicket } from '@/lib/services/maintenance';

type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
type MaintenanceStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed' | 'scheduled';

interface MaintenanceTicketDetailProps {
  ticket: MaintenanceTicket;
  onStatusChange?: (status: MaintenanceStatus) => void;
  onPriorityChange?: (priority: MaintenancePriority) => void;
  onComment?: (comment: string) => void;
  onAssign?: (vendorId: string) => void;
  onClose?: () => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const statusColors = {
  open: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const slaStatusColors = {
  on_track: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  breached: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function MaintenanceTicketDetail({
  ticket,
  onStatusChange,
  onPriorityChange,
  onComment,
  onAssign,
  onClose,
}: MaintenanceTicketDetailProps) {
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await onComment?.(comment);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PremiumLayout>
      <div className="grid grid-cols-1 gap-6">
        <PremiumCard>
          <PremiumCardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{ticket.title}</h2>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Clock className="h-4 w-4" />
                  <span>Created {format(new Date(ticket.created_at), 'PPP')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    premiumComponents.badge.base,
                    statusColors[ticket.status]
                  )}
                >
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge
                  className={cn(
                    premiumComponents.badge.base,
                    priorityColors[ticket.priority]
                  )}
                >
                  {ticket.priority} priority
                </Badge>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Property ID</p>
                    <p className="text-sm text-neutral-500">{ticket.property_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Unit ID</p>
                    <p className="text-sm text-neutral-500">{ticket.unit_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Tenant ID</p>
                    <p className="text-sm text-neutral-500">{ticket.tenant_id}</p>
                  </div>
                </div>
                {ticket.assigned_to && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium">Assigned to</p>
                      <p className="text-sm text-neutral-500">{ticket.assigned_to}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <Badge variant="outline">{ticket.category}</Badge>
              </div>

              {ticket.scheduled_date && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Scheduled Date</h3>
                  <p className="text-sm text-neutral-600">{format(new Date(ticket.scheduled_date), 'PPP')}</p>
                </div>
              )}

              {ticket.estimated_cost && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Estimated Cost</h3>
                  <p className="text-sm text-neutral-600">${ticket.estimated_cost}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={ticket.status}
                      onValueChange={(value: MaintenanceStatus) => onStatusChange?.(value)}
                    >
                      <SelectTrigger className={cn(
                        premiumComponents.select.base,
                        'w-full'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={ticket.priority}
                      onValueChange={(value: MaintenancePriority) => onPriorityChange?.(value)}
                    >
                      <SelectTrigger className={cn(
                        premiumComponents.select.base,
                        'w-full'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Add Comment</label>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className={cn(
                        premiumComponents.input.base,
                        'min-h-[100px]'
                      )}
                    />
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={isSubmitting || !comment.trim()}
                      className={cn(
                        premiumComponents.button.base,
                        premiumComponents.button.primary
                      )}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </PremiumCardContent>
          <PremiumCardFooter>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className={cn(
                  premiumComponents.button.base,
                  premiumComponents.button.outline
                )}
              >
                Close
              </Button>
              {!ticket.assigned_to && (
                <Button
                  onClick={() => onAssign?.(ticket.id)}
                  className={cn(
                    premiumComponents.button.base,
                    premiumComponents.button.primary
                  )}
                >
                  Assign Vendor
                </Button>
              )}
            </div>
          </PremiumCardFooter>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
} 
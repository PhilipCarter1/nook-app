import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Paperclip, Clock, User, Building, Home, Phone, Mail } from 'lucide-react';
import {
  PremiumLayout,
  PremiumCard,
  PremiumCardHeader,
  PremiumCardContent,
  PremiumCardFooter,
  PremiumGrid,
} from '@/components/layout/PremiumLayout';
import { premiumComponents, premiumAnimations } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { MaintenanceTicket, MaintenancePriority, MaintenanceStatus } from '@/lib/services/maintenance';

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
      <PremiumGrid cols={1} className="gap-6">
        <PremiumCard>
          <PremiumCardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{ticket.title}</h2>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Clock className="h-4 w-4" />
                  <span>Created {format(new Date(ticket.createdAt), 'PPP')}</span>
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
                {ticket.slaStatus && (
                  <Badge
                    className={cn(
                      premiumComponents.badge.base,
                      slaStatusColors[ticket.slaStatus]
                    )}
                  >
                    SLA: {ticket.slaStatus.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Property</p>
                    <p className="text-sm text-neutral-500">{ticket.property?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Unit</p>
                    <p className="text-sm text-neutral-500">{ticket.unit?.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium">Reported by</p>
                    <p className="text-sm text-neutral-500">{ticket.tenant?.name}</p>
                  </div>
                </div>
                {ticket.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-neutral-500" />
                    <div>
                      <p className="text-sm font-medium">Assigned to</p>
                      <p className="text-sm text-neutral-500">{ticket.assignedTo.name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.isEmergency && (
                <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Emergency Information</h3>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {ticket.emergencyType?.replace('_', ' ')}</p>
                    {ticket.emergencyContact && (
                      <div className="space-y-1">
                        <p><strong>Emergency Contact:</strong></p>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{ticket.emergencyContact.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{ticket.emergencyContact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{ticket.emergencyContact.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {ticket.vendor && (
                <div>
                  <h3 className="font-medium mb-2">Vendor Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-neutral-500" />
                      <span>{ticket.vendor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-neutral-500" />
                      <span>{ticket.vendor.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-neutral-500" />
                      <span>{ticket.vendor.contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-500" />
                      <span>Response Time: {ticket.vendor.responseTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {ticket.mediaUrls && ticket.mediaUrls.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Attachments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {ticket.mediaUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
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
              {!ticket.assignedTo && (
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

        {ticket.comments && ticket.comments.length > 0 && (
          <PremiumCard>
            <PremiumCardHeader>
              <h3 className="text-lg font-semibold">Comments</h3>
            </PremiumCardHeader>
            <PremiumCardContent>
              <div className="space-y-4">
                {ticket.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={comment.user?.avatarUrl} />
                      <AvatarFallback>
                        {comment.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{comment.user?.name}</p>
                        <span className="text-sm text-neutral-500">
                          {format(new Date(comment.createdAt), 'PPP')}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCardContent>
          </PremiumCard>
        )}
      </PremiumGrid>
    </PremiumLayout>
  );
} 
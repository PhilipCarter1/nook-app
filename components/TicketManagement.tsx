import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { sendEmail } from '@/lib/email';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  assigned_to: string | null;
  unit: {
    unit_number: string;
    property: {
      name: string;
      address: string;
    };
  };
  tenant: {
    user: {
      email: string;
      full_name: string;
    };
  };
  comments: MaintenanceComment[];
}

interface MaintenanceComment {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
  };
}

interface TicketManagementProps {
  role: 'super' | 'landlord';
  propertyId?: string;
  userId: string;
}

export default function TicketManagement({ role, propertyId, userId }: TicketManagementProps) {
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedTicket, setSelectedTicket] = React.useState<MaintenanceTicket | null>(null);
  const [newComment, setNewComment] = React.useState('');
  const supabase = getClient();

  const fetchTickets = React.useCallback(async () => {
    try {
      let query = supabase
        .from('maintenance_tickets')
        .select(`
          *,
          unit:unit_id(
            unit_number,
            property:property_id(
              name,
              address
            )
          ),
          tenant:tenant_id(
            user:user_id(
              email,
              full_name
            )
          ),
          comments:maintenance_comments(
            id,
            content,
            created_at,
            user:user_id(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'super') {
        query = query.eq('assigned_to', userId);
      } else if (propertyId) {
        query = query.eq('unit.property_id', propertyId);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch maintenance tickets');
    } finally {
      setLoading(false);
    }
  }, [role, propertyId, userId, statusFilter, supabase]);

  React.useEffect(() => {
    fetchTickets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('maintenance_tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_tickets',
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets, supabase]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      // Get the ticket to send email notification
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await sendEmail({
          to: ticket.tenant.user.email,
          subject: `Maintenance Ticket Update: ${ticket.title}`,
          template: 'maintenance-update',
          data: {
            ticketTitle: ticket.title,
            status: newStatus,
            propertyName: ticket.unit.property.name,
            unitNumber: ticket.unit.unit_number,
          },
        });
      }

      toast.success('Ticket status updated');
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleAssignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_tickets')
        .update({ assigned_to: assignedTo, status: 'in_progress' })
        .eq('id', ticketId);

      if (error) throw error;

      // Get the ticket to send email notification
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        await sendEmail({
          to: ticket.tenant.user.email,
          subject: `Maintenance Ticket Assigned: ${ticket.title}`,
          template: 'maintenance-assigned',
          data: {
            ticketTitle: ticket.title,
            propertyName: ticket.unit.property.name,
            unitNumber: ticket.unit.unit_number,
          },
        });
      }

      toast.success('Ticket assigned');
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };

  const handleAddComment = async (ticketId: string) => {
    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from('maintenance_comments').insert([
        {
          ticket_id: ticketId,
          user_id: userId,
          content: newComment,
        },
      ]);

      if (error) throw error;

      setNewComment('');
      toast.success('Comment added');
      fetchTickets();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Maintenance Tickets</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{ticket.title}</h3>
                  <p className="text-sm text-gray-500">
                    {ticket.unit.property.name} - Unit {ticket.unit.unit_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600">{ticket.description}</p>

              <div className="flex gap-2">
                {ticket.status !== 'resolved' && (
                  <Select
                    value={ticket.status}
                    onValueChange={(value) => handleStatusChange(ticket.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {role === 'landlord' && ticket.status === 'open' && (
                  <Select
                    value={ticket.assigned_to || ''}
                    onValueChange={(value) => handleAssignTicket(ticket.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {/* Add supervisor options here */}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Comments</h4>
                {ticket.comments && ticket.comments.length > 0 && (
                  <div className="space-y-2">
                    {ticket.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{comment.user.full_name}</span>
                          <span>{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={() => handleAddComment(ticket.id)}>Add Comment</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {tickets.length === 0 && (
          <p className="text-center text-gray-500">No maintenance tickets found</p>
        )}
      </div>
    </div>
  );
} 
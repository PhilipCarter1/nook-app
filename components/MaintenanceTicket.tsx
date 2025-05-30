import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
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

interface MaintenanceTicketProps {
  unitId: string;
  tenantId: string;
}

export default function MaintenanceTicket({ unitId, tenantId }: MaintenanceTicketProps) {
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTicket, setNewTicket] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });
  const [showNewTicket, setShowNewTicket] = React.useState(false);
  const supabase = getClient();

  const fetchTickets = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select(`
          *,
          comments:maintenance_comments(
            id,
            content,
            created_at,
            user:user_id(full_name)
          )
        `)
        .eq('unit_id', unitId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch maintenance tickets');
    } finally {
      setLoading(false);
    }
  }, [unitId, tenantId, supabase]);

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
          filter: `unit_id=eq.${unitId}`,
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTickets, unitId, supabase]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('maintenance_tickets').insert([
        {
          unit_id: unitId,
          tenant_id: tenantId,
          ...newTicket,
        },
      ]);

      if (error) throw error;

      toast.success('Maintenance ticket created');
      setShowNewTicket(false);
      setNewTicket({ title: '', description: '', priority: 'medium' });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create maintenance ticket');
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
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogTrigger asChild>
            <Button>New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Ticket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setNewTicket({ ...newTicket, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{ticket.title}</h3>
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
              {ticket.comments && ticket.comments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Comments</h4>
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 
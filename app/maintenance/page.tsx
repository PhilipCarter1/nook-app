'use client';

import React from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getTicketsByProperty, createTicket } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Wrench } from 'lucide-react';

export default function MaintenancePage() {
  const { user, role } = useAuth();
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTicket, setNewTicket] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  React.useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      try {
        if (!user.property_id) return;
        const ticketsData = await getTicketsByProperty(user.property_id);
        setTickets(ticketsData || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.property_id) return;

    try {
      const ticket = await createTicket({
        ...newTicket,
        property_id: user.property_id,
        created_by: user.id,
        status: 'open',
      });

      setTickets((prev) => [ticket, ...prev]);
      setNewTicket({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const openNewTicketModal = () => {
    const dialog = document.getElementById('new-ticket-modal') as HTMLDialogElement;
    if (dialog) {
      dialog.showModal();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Maintenance Tickets</h1>
        {role === 'tenant' && (
          <Button onClick={openNewTicketModal}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{ticket.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created by {ticket.created_by.name}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
              <div className="flex items-center mt-4 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4 mr-2" />
                Priority: {ticket.priority}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <dialog id="new-ticket-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Ticket</h3>
          <form onSubmit={handleCreateTicket}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                required
              />
            </div>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                required
              />
            </div>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
} 
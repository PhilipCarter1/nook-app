'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building
} from 'lucide-react';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  property_id: string;
  tenant_id: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    property_id: '',
    tenant_id: ''
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        toast.error('Failed to load maintenance tickets');
        return;
      }

      setTickets(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load maintenance tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('maintenance_tickets')
        .insert([{
          ...newTicket,
          status: 'open'
        }]);

      if (error) {
        toast.error('Failed to create ticket');
        return;
      }

      toast.success('Maintenance ticket created successfully');
      setShowForm(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        property_id: '',
        tenant_id: ''
      });
      loadTickets();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-gray-600">Track and manage maintenance requests</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-nook-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        Property #{ticket.property_id}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Tenant #{ticket.tenant_id}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {ticket.status === 'open' && (
                      <Button variant="outline" size="sm">
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tickets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tickets</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first maintenance ticket.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Ticket Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create Maintenance Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="property_id">Property ID</Label>
                    <Input
                      id="property_id"
                      value={newTicket.property_id}
                      onChange={(e) => setNewTicket({...newTicket, property_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant_id">Tenant ID</Label>
                    <Input
                      id="tenant_id"
                      value={newTicket.tenant_id}
                      onChange={(e) => setNewTicket({...newTicket, tenant_id: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Create Ticket
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 
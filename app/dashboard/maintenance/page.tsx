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
  Building,
  ArrowLeft,
  Search,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    property_id: '',
    tenant_id: ''
  });

  const router = useRouter();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      // TEMPORARY: Use simulated data
      setTickets([
        {
          id: '1',
          title: 'Leaky Faucet in Unit 3A',
          description: 'Kitchen faucet is dripping constantly, needs repair',
          priority: 'medium',
          status: 'open',
          property_id: '1',
          tenant_id: '1',
          assigned_to: '',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Broken Air Conditioning',
          description: 'AC unit not cooling properly, temperature stays at 80°F',
          priority: 'high',
          status: 'in_progress',
          property_id: '2',
          tenant_id: '2',
          assigned_to: 'maintenance-team',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-15T09:15:00Z'
        },
        {
          id: '3',
          title: 'Electrical Outlet Not Working',
          description: 'Outlet in bedroom stopped working, no power',
          priority: 'urgent',
          status: 'open',
          property_id: '1',
          tenant_id: '3',
          assigned_to: '',
          created_at: '2024-01-16T08:45:00Z',
          updated_at: '2024-01-16T08:45:00Z'
        }
      ]);
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        toast.error('Failed to load tickets');
        return;
      }

      setTickets(data || []);
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.title || !newTicket.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TEMPORARY: Add to local state
      const ticket = {
        id: Date.now().toString(),
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: 'open' as const,
        property_id: newTicket.property_id || '1',
        tenant_id: newTicket.tenant_id || '1',
        assigned_to: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setTickets([ticket, ...tickets]);
      setShowForm(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        property_id: '',
        tenant_id: ''
      });
      toast.success('Maintenance ticket created successfully!');
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { error } = await supabase
        .from('maintenance_tickets')
        .insert([{
          title: newTicket.title,
          description: newTicket.description,
          priority: newTicket.priority,
          property_id: newTicket.property_id,
          tenant_id: newTicket.tenant_id
        }]);

      if (error) {
        toast.error('Failed to create ticket');
        return;
      }

      toast.success('Maintenance ticket created successfully!');
      setShowForm(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        property_id: '',
        tenant_id: ''
      });
      loadTickets();
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create ticket');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/admin')}
                className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Maintenance</h1>
                <p className="text-gray-600 text-lg">Track and manage maintenance requests</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {tickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {tickets.filter(t => t.status === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-nook-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-nook-purple-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-nook-purple-900">{tickets.length}</p>
                </div>
                <div className="w-12 h-12 bg-nook-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
            />
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                        <Wrench className="h-6 w-6 text-nook-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-nook-purple-600 transition-colors duration-200">{ticket.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`${getPriorityColor(ticket.priority)} font-semibold px-3 py-1`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                          </Badge>
                          <Badge className={`${getStatusColor(ticket.status)} font-semibold px-3 py-1`}>
                            {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg mb-4">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-nook-purple-500" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-nook-purple-500" />
                        Property #{ticket.property_id}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-nook-purple-500" />
                        Tenant #{ticket.tenant_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300">
                      <Wrench className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="h-10 w-10 text-nook-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No maintenance tickets found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Get started by creating your first maintenance ticket to begin tracking repairs and issues</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Create Maintenance Ticket</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">Ticket Title</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    placeholder="Enter ticket title"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Describe the issue in detail"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 mb-2 block">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Create Ticket
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 
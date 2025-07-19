'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { getClient } from '@/lib/supabase/client';
import { AlertCircle, Wrench, DollarSign, FileText } from 'lucide-react';
import { log } from '@/lib/logger';
interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
}

interface Lease {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  due_date: string;
  paid_date: string | null;
}

export default function PostLeasePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = getClient();

  const [property, setProperty] = React.useState<Property | null>(null);
  const [lease, setLease] = React.useState<Lease | null>(null);
  const [maintenanceTickets, setMaintenanceTickets] = React.useState<MaintenanceTicket[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showMaintenanceForm, setShowMaintenanceForm] = React.useState(false);
  const [maintenanceForm, setMaintenanceForm] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  React.useEffect(() => {
    if (!params?.id || !user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);

        // Fetch lease details
        const { data: leaseData, error: leaseError } = await supabase
          .from('leases')
          .select('*')
          .eq('property_id', params.id)
          .eq('tenant_id', user.id)
          .single();

        if (leaseError && leaseError.code !== 'PGRST116') throw leaseError;
        setLease(leaseData);

        // Fetch maintenance tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('maintenance_tickets')
          .select('*')
          .eq('property_id', params.id)
          .order('created_at', { ascending: false });

        if (ticketsError) throw ticketsError;
        setMaintenanceTickets(ticketsData);

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('lease_id', leaseData?.id)
          .order('due_date', { ascending: true });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData);
      } catch (error) {
        log.error('Error fetching data:', error as Error);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.id, user?.id]);

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?.id || !user?.id) return;

    try {
      const { error } = await supabase.from('maintenance_tickets').insert({
        property_id: property.id,
        tenant_id: user.id,
        title: maintenanceForm.title,
        description: maintenanceForm.description,
        priority: maintenanceForm.priority,
        status: 'open',
      });

      if (error) throw error;

      // Refresh maintenance tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .eq('property_id', property.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setMaintenanceTickets(ticketsData);

      // Reset form
      setMaintenanceForm({
        title: '',
        description: '',
        priority: 'medium',
      });
      setShowMaintenanceForm(false);
    } catch (error) {
      log.error('Error submitting maintenance ticket:', error as Error);
      setError('Failed to submit maintenance ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property || !user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-500">{error || 'Property not found'}</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/dashboard/properties')}
          >
            Return to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-gray-500">{property.address}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Maintenance Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Requests
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
              >
                {showMaintenanceForm ? 'Cancel' : 'New Request'}
              </Button>
            </CardHeader>
            <CardContent>
              {showMaintenanceForm ? (
                <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={maintenanceForm.title}
                      onChange={(e) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={maintenanceForm.description}
                      onChange={(e) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={maintenanceForm.priority}
                      onValueChange={(value) =>
                        setMaintenanceForm((prev) => ({
                          ...prev,
                          priority: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {maintenanceTickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{ticket.title}</h3>
                            <p className="text-sm text-gray-500">{ticket.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium capitalize">{ticket.status}</div>
                            <div className="text-xs text-gray-500 capitalize">{ticket.priority}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium capitalize">{payment.type}</h3>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(payment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${payment.amount}</div>
                          <div className="text-sm capitalize">{payment.status}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
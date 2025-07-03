'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MaintenanceTicketList } from '@/components/maintenance/MaintenanceTicketList';
import { MaintenanceTicketForm } from '@/components/maintenance/MaintenanceTicketForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTicketStats } from '@/lib/services/maintenance';
import { useQuery } from '@tanstack/react-query';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export default function MaintenancePage() {
  const { role } = useAuth();
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  const { data: stats } = useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: () => getTicketStats({}),
  });

  // Mock data for now - will be replaced with actual data fetching
  const mockTickets: MaintenanceTicket[] = [
    {
      id: '1',
      title: 'Leaking Faucet',
      description: 'Kitchen sink faucet is leaking water',
      status: 'open',
      priority: 'high',
      created_at: '2024-03-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Broken Light',
      description: 'Living room light fixture not working',
      status: 'in_progress',
      priority: 'medium',
      created_at: '2024-03-14T15:30:00Z',
    },
    {
      id: '3',
      title: 'AC Not Working',
      description: 'Air conditioning unit making strange noise',
      status: 'resolved',
      priority: 'high',
      created_at: '2024-03-13T09:15:00Z',
    },
  ];

  React.useEffect(() => {
    // TODO: Fetch maintenance tickets
    setTickets(mockTickets);
  }, [mockTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit maintenance ticket
    setShowForm(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byStatus.open || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byStatus.in_progress || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byPriority.high + stats?.byPriority.emergency || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceTicketList />
          </Suspense>
        </TabsContent>
        <TabsContent value="open" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceTicketList status="open" />
          </Suspense>
        </TabsContent>
        <TabsContent value="in_progress" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceTicketList status="in_progress" />
          </Suspense>
        </TabsContent>
        <TabsContent value="resolved" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <MaintenanceTicketList status="resolved" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
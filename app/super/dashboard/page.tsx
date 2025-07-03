'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingPage } from '@/components/ui/loading';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  property_id: string;
  tenant_id: string;
  assigned_to: string | null;
  properties?: {
    name: string;
    address: string;
  };
  tenants?: {
    name: string;
    email: string;
  };
}

export default function SuperDashboard() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Fetch maintenance requests assigned to this super
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          properties:property_id (name, address),
          tenants:tenant_id (name, email)
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMaintenanceRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching maintenance requests:', error);
      toast.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: MaintenanceRequest['status']) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Request status updated');
      fetchMaintenanceRequests();
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  const pendingRequests = maintenanceRequests.filter(req => req.status === 'pending');
  const inProgressRequests = maintenanceRequests.filter(req => req.status === 'in_progress');
  const completedRequests = maintenanceRequests.filter(req => req.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance Dashboard</h1>
        <Button className="bg-nook-purple-600 hover:bg-nook-purple-500">
          <Wrench className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-lg">{request.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p>Priority: <span className="font-medium">{request.priority}</span></p>
                    <p>Property: <span className="font-medium">{request.properties?.name}</span></p>
                  </div>
                  <Button
                    onClick={() => updateRequestStatus(request.id, 'in_progress')}
                    className="bg-nook-purple-600 hover:bg-nook-purple-500"
                  >
                    Start Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="in_progress" className="space-y-4">
          {inProgressRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-lg">{request.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p>Priority: <span className="font-medium">{request.priority}</span></p>
                    <p>Property: <span className="font-medium">{request.properties?.name}</span></p>
                  </div>
                  <Button
                    onClick={() => updateRequestStatus(request.id, 'completed')}
                    className="bg-nook-purple-600 hover:bg-nook-purple-500"
                  >
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {completedRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-lg">{request.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{request.description}</p>
                <div className="text-sm">
                  <p>Priority: <span className="font-medium">{request.priority}</span></p>
                  <p>Property: <span className="font-medium">{request.properties?.name}</span></p>
                  <p>Completed: <span className="font-medium">{new Date(request.created_at).toLocaleDateString()}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CreditCard, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload } from '@/components/DocumentUpload';
import PaymentOptions from '@/components/PaymentOptions';
import SplitRentSetup from '@/components/SplitRentSetup';
import { redirect } from 'next/navigation';
import LeaseOverview from '@/components/LeaseOverview';
import MaintenanceTicket from '@/components/MaintenanceTicket';

interface TenantOnboarding {
  id: string;
  status: 'pending_documents' | 'pending_verification' | 'pending_payment' | 'active';
  documents: {
    id: string;
    type: string;
    url: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
  payment_status: 'pending' | 'completed';
  split_rent: {
    enabled: boolean;
    tenants: {
      id: string;
      name: string;
      email: string;
      percentage: number;
    }[];
  };
}

export default async function TenantDashboard() {
  const supabase = getClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get tenant record
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, unit_id')
    .eq('user_id', user.id)
    .single();

  if (!tenant) {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tenant Dashboard</h1>
      
      <Tabs defaultValue="lease" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lease">Lease & Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="lease">
          <LeaseOverview tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTicket unitId={tenant.unit_id} tenantId={tenant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 
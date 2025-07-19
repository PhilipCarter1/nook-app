'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { getClient } from '@/lib/supabase/client';
import { User, CreditCard, AlertCircle, CheckCircle2, Clock, Send, Download } from 'lucide-react';
import { log } from '@/lib/logger';
interface Tenant {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  share_percentage: number;
  share_amount: number;
  paid_amount: number;
  status: 'paid' | 'partial' | 'unpaid';
  last_payment_date?: string;
}

interface SplitRentManagementProps {
  propertyId: string;
  totalAmount: number;
  dueDate: string;
}

export default function SplitRentManagement({
  propertyId,
  totalAmount,
  dueDate,
}: SplitRentManagementProps) {
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const supabase = getClient();

  React.useEffect(() => {
    fetchTenants();
  }, [propertyId, selectedMonth]);

  const fetchTenants = async () => {
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString();

      const { data, error } = await supabase
        .from('rent_splits')
        .select(`
          *,
          tenant:users (
            id,
            name,
            email,
            avatar_url
          ),
          payments (
            amount,
            created_at
          )
        `)
        .eq('property_id', propertyId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const formattedTenants = data.map((split: any) => {
        const totalPaid = split.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
        return {
          id: split.tenant.id,
          name: split.tenant.name,
          email: split.tenant.email,
          avatar_url: split.tenant.avatar_url,
          share_percentage: split.share_percentage,
          share_amount: (totalAmount * split.share_percentage) / 100,
          paid_amount: totalPaid,
          status: getPaymentStatus(totalPaid, (totalAmount * split.share_percentage) / 100),
          last_payment_date: split.payments[0]?.created_at,
        };
      });

      setTenants(formattedTenants);
    } catch (error) {
      log.error('Error fetching tenants:', error);
      setError('Failed to load tenant information');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (paid: number, total: number): 'paid' | 'partial' | 'unpaid' => {
    if (paid >= total) return 'paid';
    if (paid > 0) return 'partial';
    return 'unpaid';
  };

  const handleSendReminder = async (tenantId: string) => {
    try {
      const tenant = tenants.find(t => t.id === tenantId);
      if (!tenant) return;

      const { error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          tenantId,
          propertyId,
          amount: tenant.share_amount - tenant.paid_amount,
          dueDate,
        },
      });

      if (error) throw error;
    } catch (error) {
      log.error('Error sending reminder:', error);
      setError('Failed to send payment reminder');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-rent-report', {
        body: {
          propertyId,
          month: selectedMonth,
        },
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rent-report-${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      log.error('Error generating report:', error);
      setError('Failed to generate rent report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const totalPaid = tenants.reduce((sum, tenant) => sum + tenant.paid_amount, 0);
  const progress = (totalPaid / totalAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rent Payment Management</CardTitle>
          <div className="flex items-center gap-4">
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                  const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount</span>
              <span className="font-medium">${totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Due Date</span>
              <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Paid: ${totalPaid}</span>
              <span>Remaining: ${totalAmount - totalPaid}</span>
            </div>
          </div>

          <div className="space-y-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={tenant.avatar_url} />
                        <AvatarFallback>
                          {tenant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                        {tenant.last_payment_date && (
                          <p className="text-xs text-gray-500">
                            Last payment: {new Date(tenant.last_payment_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tenant.status)}
                        <span className="text-sm capitalize">{tenant.status}</span>
                      </div>
                      <p className="text-sm">
                        Share: ${tenant.share_amount} ({tenant.share_percentage}%)
                      </p>
                      <p className="text-sm">
                        Paid: ${tenant.paid_amount}
                      </p>
                      {tenant.status !== 'paid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => handleSendReminder(tenant.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
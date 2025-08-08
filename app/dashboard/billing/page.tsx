'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  Users
} from 'lucide-react';

interface BillingData {
  plan: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled';
  trialEndsAt: string;
  nextBillingDate: string;
  amount: number;
  usage: {
    properties: number;
    tenants: number;
    storage: number;
  };
  limits: {
    properties: number;
    tenants: number;
    storage: number;
  };
}

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData>({
    plan: 'Pro',
    status: 'trial',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 49.99,
    usage: {
      properties: 3,
      tenants: 8,
      storage: 2.5
    },
    limits: {
      properties: 10,
      tenants: 25,
      storage: 10
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription and monitor usage</p>
        </div>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Current Plan</CardTitle>
                <p className="text-gray-600">You're currently on the {billingData.plan} plan</p>
              </div>
              <Badge className={getStatusColor(billingData.status)}>
                {billingData.status === 'trial' ? 'Trial' : billingData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">${billingData.amount}</p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Next billing date</p>
                <p className="font-medium text-gray-900">
                  {new Date(billingData.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Status */}
        {billingData.status === 'trial' && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Trial Period Active</h3>
                  <p className="text-blue-700">
                    Your trial ends on {new Date(billingData.trialEndsAt).toLocaleDateString()}. 
                    Upgrade to continue using all features.
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{billingData.usage.properties} / {billingData.limits.properties}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.properties, billingData.limits.properties))}`}
                    style={{ width: `${getUsagePercentage(billingData.usage.properties, billingData.limits.properties)}%` }}
                  ></div>
                </div>
                {getUsagePercentage(billingData.usage.properties, billingData.limits.properties) >= 75 && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Approaching limit
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{billingData.usage.tenants} / {billingData.limits.tenants}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.tenants, billingData.limits.tenants))}`}
                    style={{ width: `${getUsagePercentage(billingData.usage.tenants, billingData.limits.tenants)}%` }}
                  ></div>
                </div>
                {getUsagePercentage(billingData.usage.tenants, billingData.limits.tenants) >= 75 && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Approaching limit
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{billingData.usage.storage}GB / {billingData.limits.storage}GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(billingData.usage.storage, billingData.limits.storage))}`}
                    style={{ width: `${getUsagePercentage(billingData.usage.storage, billingData.limits.storage)}%` }}
                  ></div>
                </div>
                {getUsagePercentage(billingData.usage.storage, billingData.limits.storage) >= 75 && (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Approaching limit
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Billing History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Pro Plan - Monthly</p>
                  <p className="text-sm text-gray-600">March 2024</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">$49.99</span>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Pro Plan - Monthly</p>
                  <p className="text-sm text-gray-600">February 2024</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">$49.99</span>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Pro Plan - Monthly</p>
                  <p className="text-sm text-gray-600">January 2024</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">$49.99</span>
                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
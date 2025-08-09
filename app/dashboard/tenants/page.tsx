'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Users, Plus, Search, Mail, Phone, Calendar, Edit, Trash2, ArrowLeft, Building, X } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_id: string;
  lease_start: string;
  lease_end: string;
  status: 'active' | 'inactive' | 'pending';
  rent_amount: number;
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    property_id: '',
    lease_start: '',
    lease_end: '',
    rent_amount: '',
    onboarding_status: 'pending'
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      // TEMPORARY: Use simulated data
      setTenants([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          property_id: '1',
          lease_start: '2024-01-01',
          lease_end: '2024-12-31',
          status: 'active',
          rent_amount: 2500
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1 (555) 234-5678',
          property_id: '2',
          lease_start: '2024-02-01',
          lease_end: '2025-01-31',
          status: 'active',
          rent_amount: 3200
        },
        {
          id: '3',
          name: 'Mike Davis',
          email: 'mike.davis@email.com',
          phone: '+1 (555) 345-6789',
          property_id: '1',
          lease_start: '2024-03-01',
          lease_end: '2025-02-28',
          status: 'pending',
          rent_amount: 2800
        }
      ]);
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tenants:', error);
        toast.error('Failed to load tenants');
        return;
      }

      setTenants(data || []);
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTenant.name || !newTenant.email || !newTenant.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TEMPORARY: Add to local state
      const tenant = {
        id: Date.now().toString(),
        name: newTenant.name,
        email: newTenant.email,
        phone: newTenant.phone,
        property_id: newTenant.property_id || '1',
        lease_start: newTenant.lease_start || '2024-01-01',
        lease_end: newTenant.lease_end || '2024-12-31',
        status: 'pending' as const,
        rent_amount: parseInt(newTenant.rent_amount) || 0
      };
      
      setTenants([tenant, ...tenants]);
      setShowAddForm(false);
      setNewTenant({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '',
        onboarding_status: 'pending'
      });
      toast.success('Tenant added successfully!');
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { error } = await supabase
        .from('tenants')
        .insert([{
          name: newTenant.name,
          email: newTenant.email,
          phone: newTenant.phone,
          property_id: newTenant.property_id,
          lease_start: newTenant.lease_start,
          lease_end: newTenant.lease_end,
          rent_amount: parseInt(newTenant.rent_amount)
        }]);

      if (error) {
        toast.error('Failed to add tenant');
        return;
      }

      toast.success('Tenant added successfully!');
      setShowAddForm(false);
      setNewTenant({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: '',
        onboarding_status: 'pending'
      });
      loadTenants();
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add tenant');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tenant Management</h1>
                <p className="text-gray-600 text-lg">Onboard and manage tenants for your properties</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Onboard Tenant
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                <span className="text-sm font-medium text-gray-600">Total Tenants:</span>
                <span className="ml-2 text-lg font-bold text-nook-purple-600">{tenants.length}</span>
              </div>
              <Select>
                <SelectTrigger className="w-48 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tenants List */}
        <div className="space-y-6">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="h-6 w-6 text-nook-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-nook-purple-600 transition-colors duration-200">{tenant.name}</h3>
                        <Badge className={`${getStatusColor(tenant.status)} font-semibold px-3 py-1`}>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <Mail className="h-4 w-4 mr-3 text-nook-purple-500" />
                        <span className="font-medium text-gray-700">{tenant.email}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <Phone className="h-4 w-4 mr-3 text-nook-purple-500" />
                        <span className="font-medium text-gray-700">{tenant.phone}</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <Calendar className="h-4 w-4 mr-3 text-nook-purple-500" />
                        <span className="font-medium text-gray-700">${tenant.rent_amount.toLocaleString()}/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-nook-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No tenants found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Get started by onboarding your first tenant to begin managing your property portfolio</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Onboard Your First Tenant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Tenant Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Onboard New Tenant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddTenant} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</Label>
                  <Input
                    id="name"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                    placeholder="Enter tenant's full name"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                    placeholder="Enter phone number"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="rent_amount" className="text-sm font-semibold text-gray-700 mb-2 block">Monthly Rent</Label>
                  <Input
                    id="rent_amount"
                    type="number"
                    value={newTenant.rent_amount}
                    onChange={(e) => setNewTenant({...newTenant, rent_amount: e.target.value})}
                    placeholder="Enter monthly rent amount"
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Onboard Tenant
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
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
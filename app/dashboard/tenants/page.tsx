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
import { Users, Plus, Search, Mail, Phone, Calendar, Edit, Trash2, ArrowLeft } from 'lucide-react';

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
    
    try {
      // TEMPORARY: Add to local state
      const tenant = {
        id: Date.now().toString(),
        name: newTenant.name,
        email: newTenant.email,
        phone: newTenant.phone,
        property_id: newTenant.property_id,
        lease_start: newTenant.lease_start,
        lease_end: newTenant.lease_end,
        rent_amount: parseFloat(newTenant.rent_amount),
        status: 'active' as const
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
      toast.success('Tenant added successfully');
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      const { error } = await supabase
        .from('tenants')
        .insert([{
          ...newTenant,
          rent_amount: parseFloat(newTenant.rent_amount),
          status: 'active'
        }]);

      if (error) {
        toast.error('Failed to add tenant');
        return;
      }

      toast.success('Tenant added successfully');
      setShowAddForm(false);
      setNewTenant({
        name: '',
        email: '',
        phone: '',
        property_id: '',
        lease_start: '',
        lease_end: '',
        rent_amount: ''
      });
      loadTenants();
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add tenant');
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/admin')}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
              <p className="text-gray-600">Onboard and manage tenants for your properties</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-nook-purple-600 hover:bg-nook-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Onboard Tenant
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Tenants List */}
        <div className="space-y-4">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {tenant.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        ${tenant.rent_amount}/month
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tenants found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first tenant.'}
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-nook-purple-600 hover:bg-nook-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Tenant Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTenant} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newTenant.name}
                      onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant({...newTenant, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newTenant.phone}
                      onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rent_amount">Monthly Rent</Label>
                    <Input
                      id="rent_amount"
                      type="number"
                      value={newTenant.rent_amount}
                      onChange={(e) => setNewTenant({...newTenant, rent_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lease_start">Lease Start</Label>
                      <Input
                        id="lease_start"
                        type="date"
                        value={newTenant.lease_start}
                        onChange={(e) => setNewTenant({...newTenant, lease_start: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lease_end">Lease End</Label>
                      <Input
                        id="lease_end"
                        type="date"
                        value={newTenant.lease_end}
                        onChange={(e) => setNewTenant({...newTenant, lease_end: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Add Tenant
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
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
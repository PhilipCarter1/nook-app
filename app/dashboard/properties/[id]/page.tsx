'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Building, 
  MapPin, 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Settings,
  DollarSign
} from 'lucide-react';
import TenantOnboardingModal from '@/components/tenant-onboarding/TenantOnboardingModal';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  created_at: string;
  tenants?: Tenant[];
  units_list?: Unit[];
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'inactive';
  unit_id?: string;
  lease_start?: string;
  lease_end?: string;
  rent_amount?: number;
}

interface Unit {
  id: string;
  unit_number: string;
  status: 'available' | 'occupied';
  tenant_id?: string;
  rent_amount?: number;
}

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params?.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      // TEMPORARY: Use simulated data
      const mockProperty: Property = {
        id: propertyId,
        name: 'Sunset Apartments',
        address: '123 Main St, City, State',
        units: 24,
        created_at: new Date().toISOString(),
        tenants: [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+1 (555) 123-4567',
            status: 'active',
            unit_id: 'unit-1',
            lease_start: '2024-01-01',
            lease_end: '2024-12-31',
            rent_amount: 2500
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+1 (555) 234-5678',
            status: 'active',
            unit_id: 'unit-2',
            lease_start: '2024-02-01',
            lease_end: '2025-01-31',
            rent_amount: 3200
          },
          {
            id: '3',
            name: 'Mike Davis',
            email: 'mike.davis@email.com',
            phone: '+1 (555) 345-6789',
            status: 'pending',
            unit_id: 'unit-3',
            lease_start: '2024-03-01',
            lease_end: '2025-02-28',
            rent_amount: 2800
          }
        ],
        units_list: Array.from({ length: 24 }, (_, i) => ({
          id: `unit-${i + 1}`,
          unit_number: `Unit ${i + 1}`,
          status: i < 3 ? 'occupied' : 'available',
          tenant_id: i < 3 ? `tenant-${i + 1}` : undefined,
          rent_amount: 2500 + (i * 100)
        }))
      };

      setProperty(mockProperty);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleTenantAdded = (tenant: Tenant) => {
    if (property) {
      setProperty({
        ...property,
        tenants: [...(property.tenants || []), tenant]
      });
    }
  };

  const filteredTenants = property?.tenants?.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getOccupancyRate = () => {
    if (!property || property.units === 0) return 0;
    return Math.round(((property.tenants?.length || 0) / property.units) * 100);
  };

  const getTotalRevenue = () => {
    if (!property?.tenants) return 0;
    return property.tenants.reduce((total, tenant) => total + (tenant.rent_amount || 0), 0);
  };

  const getAvailableUnits = () => {
    if (!property?.units_list) return 0;
    return property.units_list.filter(unit => unit.status === 'available').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-nook-purple-700">Property not found</h1>
          <p className="text-gray-600 mt-2">The property you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-nook-purple-700">{property.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <p className="text-gray-600">{property.address}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowTenantModal(true)}
            className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Onboard Tenant
          </Button>
        </div>
      </div>

      {/* Property Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Units</p>
                <p className="text-3xl font-bold text-blue-700">{property.units}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Occupied</p>
                <p className="text-3xl font-bold text-green-700">{property.tenants?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-purple-700">{getOccupancyRate()}%</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-orange-700">${getTotalRevenue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
          />
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenants</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenants List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tenants ({filteredTenants.length})</span>
            <Badge className="bg-nook-purple-100 text-nook-purple-700">
              {property.tenants?.length || 0} total tenant{property.tenants?.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-nook-purple-700">No tenants found</h3>
              <p className="mt-1 text-sm text-nook-purple-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by onboarding your first tenant.'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <div className="mt-6">
                  <Button onClick={() => setShowTenantModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Onboard First Tenant
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((tenant) => (
                <Card key={tenant.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-nook-purple-800">{tenant.name}</h3>
                          <div className="flex items-center space-x-1 text-sm text-nook-purple-600">
                            <Mail className="h-3 w-3" />
                            <span>{tenant.email}</span>
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center space-x-1 text-sm text-nook-purple-600">
                              <Phone className="h-3 w-3" />
                              <span>{tenant.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge 
                        className={`${
                          tenant.status === 'active' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' 
                            : tenant.status === 'pending'
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200'
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {tenant.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      {tenant.unit_id && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-nook-purple-600">Unit:</span>
                          <span className="font-medium text-nook-purple-700">{tenant.unit_id.replace('unit-', 'Unit ')}</span>
                        </div>
                      )}
                      {tenant.rent_amount && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-nook-purple-600">Rent:</span>
                          <span className="font-medium text-nook-purple-700">${tenant.rent_amount.toLocaleString()}</span>
                        </div>
                      )}
                      {tenant.lease_start && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-nook-purple-600">Lease Start:</span>
                          <span className="font-medium text-nook-purple-700">{new Date(tenant.lease_start).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" className="flex-1 border-nook-purple-300 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-400 hover:text-nook-purple-800 transition-all duration-200">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-nook-purple-300 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-400 hover:text-nook-purple-800 transition-all duration-200">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant Onboarding Modal */}
      {property && (
        <TenantOnboardingModal
          property={property}
          isOpen={showTenantModal}
          onClose={() => setShowTenantModal(false)}
          onTenantAdded={handleTenantAdded}
        />
      )}
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Users, 
  CheckCircle, 
  X,
  ArrowRight,
  Eye
} from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  tenants?: Tenant[];
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
}

interface Unit {
  id: string;
  unit_number: string;
  status: 'available' | 'occupied';
  tenant_id?: string;
}

interface TenantOnboardingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (tenant: Tenant) => void;
}

export default function TenantOnboardingModal({
  property,
  isOpen,
  onClose,
  onTenantAdded
}: TenantOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(property.tenants || []);
  const [newTenant, setNewTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    unitId: '',
    moveInDate: '',
    rentAmount: ''
  });
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableUnits();
      setTenants(property.tenants || []);
    }
  }, [isOpen, property]);

  const loadAvailableUnits = async () => {
    try {
      // TEMPORARY: Generate simulated available units
      const units: Unit[] = [];
      for (let i = 1; i <= property.units; i++) {
        const isOccupied = tenants.some(tenant => tenant.unit_id === `unit-${i}`);
        units.push({
          id: `unit-${i}`,
          unit_number: `Unit ${i}`,
          status: isOccupied ? 'occupied' : 'available',
          tenant_id: isOccupied ? tenants.find(t => t.unit_id === `unit-${i}`)?.id : undefined
        });
      }
      setAvailableUnits(units);
    } catch (error) {
      console.error('Error loading units:', error);
      toast.error('Failed to load available units');
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // TEMPORARY: Add tenant to local state
      const tenant: Tenant = {
        id: Date.now().toString(),
        name: `${newTenant.firstName} ${newTenant.lastName}`,
        email: newTenant.email,
        phone: newTenant.phone,
        status: 'pending',
        unit_id: newTenant.unitId || undefined,
        lease_start: newTenant.moveInDate || undefined,
        lease_end: undefined
      };

      // Add to selected tenants for batch processing
      setSelectedTenants([...selectedTenants, tenant]);
      setStep(2);

      // Reset form
      setNewTenant({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        unitId: '',
        moveInDate: '',
        rentAmount: ''
      });

      toast.success('Tenant added to onboarding list!');
    } catch (error) {
      console.error('Error adding tenant:', error);
      toast.error('Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);

    try {
      // TEMPORARY: Process all selected tenants
      for (const tenant of selectedTenants) {
        // In a real implementation, this would:
        // 1. Create tenant invitation
        // 2. Send invitation email
        // 3. Create tenant record
        // 4. Associate with property/unit
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add tenant to the list
        onTenantAdded(tenant);
      }

      toast.success(`Successfully onboarded ${selectedTenants.length} tenant${selectedTenants.length !== 1 ? 's' : ''}!`);
      setSelectedTenants([]);
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTenant = (tenantId: string) => {
    setSelectedTenants(selectedTenants.filter(t => t.id !== tenantId));
  };

  const getAvailableUnitsForSelection = () => {
    return availableUnits.filter(unit => unit.status === 'available');
  };

  const getOccupancyRate = () => {
    if (!property.tenants || property.units === 0) return 0;
    return Math.round((property.tenants.length / property.units) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-nook-purple-600" />
            <span>Onboard Tenants to {property.name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-nook-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-nook-purple-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Add Tenants</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-nook-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-nook-purple-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Review & Complete</span>
          </div>
        </div>

        {/* Step 1: Add Tenants */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Property Overview */}
            <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-nook-purple-600" />
                    <div>
                      <h3 className="font-semibold text-nook-purple-800">{property.name}</h3>
                      <p className="text-sm text-nook-purple-600">{property.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-nook-purple-700">{property.units}</p>
                    <p className="text-xs text-nook-purple-600">Total Units</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">{property.tenants?.length || 0}</p>
                    <p className="text-xs text-green-600">Current Tenants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-700">{getAvailableUnitsForSelection().length}</p>
                    <p className="text-xs text-blue-600">Available Units</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-700">{getOccupancyRate()}%</p>
                    <p className="text-xs text-purple-600">Occupancy Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Tenant Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-nook-purple-800">Add New Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTenant} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newTenant.firstName}
                        onChange={(e) => setNewTenant({ ...newTenant, firstName: e.target.value })}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newTenant.lastName}
                        onChange={(e) => setNewTenant({ ...newTenant, lastName: e.target.value })}
                        placeholder="Smith"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newTenant.email}
                      onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                      placeholder="john.smith@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={newTenant.phone}
                      onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unitId">Assign Unit</Label>
                      <Select value={newTenant.unitId} onValueChange={(value) => setNewTenant({ ...newTenant, unitId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableUnitsForSelection().map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.unit_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="moveInDate">Move-in Date</Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={newTenant.moveInDate}
                        onChange={(e) => setNewTenant({ ...newTenant, moveInDate: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button type="submit" className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Tenant
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={selectedTenants.length === 0}>
                      Continue ({selectedTenants.length} tenant{selectedTenants.length !== 1 ? 's' : ''})
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Review & Complete */}
        {step === 2 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Review Tenant Details</span>
                  <Badge className="bg-nook-purple-100 text-nook-purple-700">
                    {selectedTenants.length} tenant{selectedTenants.length !== 1 ? 's' : ''} ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-nook-purple-700">{tenant.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span>{tenant.email}</span>
                            {tenant.phone && (
                              <>
                                <Phone className="h-3 w-3" />
                                <span>{tenant.phone}</span>
                              </>
                            )}
                          </div>
                          {tenant.lease_start && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Move-in: {new Date(tenant.lease_start).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {tenant.unit_id && (
                          <Badge variant="outline" className="text-xs">
                            Unit {tenant.unit_id.replace('unit-', '')}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTenant(tenant.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back to Add More
                  </Button>
                  <Button
                    onClick={handleCompleteOnboarding}
                    className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700"
                    disabled={loading || selectedTenants.length === 0}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Onboarding ({selectedTenants.length} tenant{selectedTenants.length !== 1 ? 's' : ''})
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 
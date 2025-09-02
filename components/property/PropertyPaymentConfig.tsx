'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  CreditCard, 
  Building2, 
  Users,
  DollarSign,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getPropertyPaymentMethods,
  addPropertyPaymentMethod,
  updatePropertyPaymentMethod,
  deletePropertyPaymentMethod,
  getPropertyPaymentSettings,
  updatePropertyPaymentSettings,
  getPropertyRentSplits,
  addRentSplit,
  updateRentSplit,
  deleteRentSplit,
  type PropertyPaymentMethod,
  type PropertyPaymentSettings,
  type RentSplit
} from '@/lib/services/property-payments';

interface PropertyPaymentConfigProps {
  propertyId: string;
  propertyName: string;
  monthlyRent: number;
}

export function PropertyPaymentConfig({ propertyId, propertyName, monthlyRent }: PropertyPaymentConfigProps) {
  const [paymentMethods, setPaymentMethods] = useState<PropertyPaymentMethod[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PropertyPaymentSettings | null>(null);
  const [rentSplits, setRentSplits] = useState<RentSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  const [editingSplit, setEditingSplit] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showAddSplit, setShowAddSplit] = useState(false);

  // Form states
  const [newMethod, setNewMethod] = useState<Partial<PropertyPaymentMethod>>({
    type: 'bank_transfer',
    name: '',
    is_default: false,
    is_active: true,
    details: {},
    instructions: ''
  });

  const [newSplit, setNewSplit] = useState<Partial<RentSplit>>({
    tenant_id: '',
    split_amount: 0,
    split_percentage: 0
  });

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [methodsResult, settingsResult, splitsResult] = await Promise.all([
        getPropertyPaymentMethods(propertyId),
        getPropertyPaymentSettings(propertyId),
        getPropertyRentSplits(propertyId)
      ]);

      if (methodsResult.success) {
        setPaymentMethods(methodsResult.paymentMethods || []);
      }

      if (settingsResult.success) {
        setPaymentSettings(settingsResult.settings || null);
      }

      if (splitsResult.success) {
        setRentSplits(splitsResult.rentSplits || []);
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newMethod.type || !newMethod.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await addPropertyPaymentMethod(propertyId, newMethod as PropertyPaymentMethod);
    
    if (result.success) {
      toast.success('Payment method added successfully');
      setShowAddMethod(false);
      setNewMethod({
        type: 'bank_transfer',
        name: '',
        is_default: false,
        is_active: true,
        details: {},
        instructions: ''
      });
      loadData();
    } else {
      toast.error(result.error || 'Failed to add payment method');
    }
  };

  const handleUpdatePaymentMethod = async (methodId: string, updates: Partial<PropertyPaymentMethod>) => {
    const result = await updatePropertyPaymentMethod(methodId, updates);
    
    if (result.success) {
      toast.success('Payment method updated successfully');
      setEditingMethod(null);
      loadData();
    } else {
      toast.error(result.error || 'Failed to update payment method');
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    const result = await deletePropertyPaymentMethod(methodId);
    
    if (result.success) {
      toast.success('Payment method deleted successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete payment method');
    }
  };

  const handleUpdatePaymentSettings = async (updates: Partial<PropertyPaymentSettings>) => {
    const result = await updatePropertyPaymentSettings(propertyId, updates);
    
    if (result.success) {
      toast.success('Payment settings updated successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to update payment settings');
    }
  };

  const handleAddRentSplit = async () => {
    if (!newSplit.tenant_id || !newSplit.split_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await addRentSplit(
      propertyId,
      newSplit.tenant_id,
      newSplit.split_amount,
      newSplit.split_percentage
    );
    
    if (result.success) {
      toast.success('Rent split added successfully');
      setShowAddSplit(false);
      setNewSplit({
        tenant_id: '',
        split_amount: 0,
        split_percentage: 0
      });
      loadData();
    } else {
      toast.error(result.error || 'Failed to add rent split');
    }
  };

  const handleDeleteRentSplit = async (splitId: string) => {
    if (!confirm('Are you sure you want to delete this rent split?')) {
      return;
    }

    const result = await deleteRentSplit(splitId);
    
    if (result.success) {
      toast.success('Rent split deleted successfully');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete rent split');
    }
  };

  const renderPaymentMethodDetails = (method: PropertyPaymentMethod) => {
    const { details } = method;
    
    switch (method.type) {
      case 'bank_transfer':
        return (
          <div className="space-y-2">
            <div><strong>Bank:</strong> {details.bankName}</div>
            <div><strong>Account:</strong> ****{details.accountNumber?.slice(-4)}</div>
            <div><strong>Routing:</strong> {details.routingNumber}</div>
            <div><strong>Account Holder:</strong> {details.accountHolderName}</div>
          </div>
        );
      case 'zelle':
        return (
          <div className="space-y-2">
            <div><strong>Email:</strong> {details.zelleEmail}</div>
            <div><strong>Phone:</strong> {details.zellePhone}</div>
          </div>
        );
      case 'venmo':
        return (
          <div className="space-y-2">
            <div><strong>Username:</strong> @{details.venmoUsername}</div>
          </div>
        );
      case 'paypal':
        return (
          <div className="space-y-2">
            <div><strong>Email:</strong> {details.paypalEmail}</div>
            <div><strong>Link:</strong> {details.paypalLink}</div>
          </div>
        );
      case 'check':
        return (
          <div className="space-y-2">
            <div><strong>Payable To:</strong> {details.checkPayableTo}</div>
            <div><strong>Address:</strong> {details.mailingAddress}</div>
          </div>
        );
      default:
        return <div>No details available</div>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="split-rent">Enable Split Rent</Label>
              <p className="text-sm text-gray-600">Allow tenants to pay their share individually</p>
            </div>
            <Switch
              id="split-rent"
              checked={paymentSettings?.split_rent_enabled || false}
              onCheckedChange={(checked) => 
                handleUpdatePaymentSettings({ split_rent_enabled: checked })
              }
            />
          </div>

          {paymentSettings?.split_rent_enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-nook-purple-200">
              <div>
                <Label htmlFor="split-type">Split Type</Label>
                <Select
                  value={paymentSettings?.split_type || 'equal'}
                  onValueChange={(value: 'equal' | 'percentage' | 'custom') =>
                    handleUpdatePaymentSettings({ split_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal Split</SelectItem>
                    <SelectItem value="percentage">Percentage Split</SelectItem>
                    <SelectItem value="custom">Custom Amounts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="late-fee">Late Fee Percentage</Label>
                  <Input
                    id="late-fee"
                    type="number"
                    step="0.01"
                    value={paymentSettings?.late_fee_percentage || 5}
                    onChange={(e) =>
                      handleUpdatePaymentSettings({ late_fee_percentage: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="grace-period">Grace Period (days)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    value={paymentSettings?.grace_period_days || 5}
                    onChange={(e) =>
                      handleUpdatePaymentSettings({ grace_period_days: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </div>
            <Button onClick={() => setShowAddMethod(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods configured</p>
              <p className="text-sm">Add payment methods so tenants know how to pay rent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={method.is_default ? "default" : "secondary"}>
                        {method.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <h4 className="font-medium">{method.name}</h4>
                      {method.is_default && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMethod(method.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {renderPaymentMethodDetails(method)}
                  
                  {method.instructions && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Instructions:</strong> {method.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rent Splits */}
      {paymentSettings?.split_rent_enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Rent Splits
              </div>
              <Button onClick={() => setShowAddSplit(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Split
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Total Property Rent</span>
                </div>
                <span className="font-bold text-lg">${monthlyRent.toFixed(2)}</span>
              </div>

              {rentSplits.map((split) => (
                <div key={split.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Tenant Split</p>
                    <p className="text-sm text-gray-600">
                      ${split.split_amount.toFixed(2)}
                      {split.split_percentage && ` (${split.split_percentage}%)`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRentSplit(split.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {rentSplits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rent splits configured</p>
                  <p className="text-sm">Add rent splits to allow individual tenant payments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Payment Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="method-type">Payment Type</Label>
                <Select
                  value={newMethod.type}
                  onValueChange={(value) => setNewMethod({ ...newMethod, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="method-name">Display Name</Label>
                <Input
                  id="method-name"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  placeholder="e.g., Main Bank Account"
                />
              </div>

              <div>
                <Label htmlFor="method-instructions">Instructions for Tenants</Label>
                <Textarea
                  id="method-instructions"
                  value={newMethod.instructions}
                  onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                  placeholder="e.g., Include property address in memo"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default-method"
                  checked={newMethod.is_default}
                  onCheckedChange={(checked) => setNewMethod({ ...newMethod, is_default: checked })}
                />
                <Label htmlFor="default-method">Set as default payment method</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddPaymentMethod} className="flex-1">
                  Add Method
                </Button>
                <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

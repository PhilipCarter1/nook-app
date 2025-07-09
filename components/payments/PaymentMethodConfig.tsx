"use client";

import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  PaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '@/lib/services/payment-methods';
import { toast } from 'sonner';
import { Plus, Trash2, Star, StarOff } from 'lucide-react';

interface PaymentMethodConfigProps {
  id: string;
  initialMethods?: PaymentMethod[];
}

export function PaymentMethodConfig({
  id,
  initialMethods = [],
}: PaymentMethodConfigProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'bank_transfer' as PaymentMethod['type'],
    name: '',
    details: {
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      checkPayableTo: '',
      mailingAddress: '',
      zelleEmail: '',
      zellePhone: '',
      venmoUsername: '',
      venmoQRCode: '',
      paypalEmail: '',
      paypalLink: '',
      applePayEmail: '',
      applePayPhone: '',
      instructions: '',
      processingTime: '',
      minimumAmount: 0,
      maximumAmount: 0,
      fees: {
        type: 'percentage' as const,
        amount: 0,
      },
    },
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMethod = await createPaymentMethod({
        id: id,
        ...formData,
      });
      setMethods([...methods, newMethod]);
      setShowForm(false);
      setFormData({
        type: 'bank_transfer',
        name: '',
        details: {
          accountNumber: '',
          routingNumber: '',
          bankName: '',
          checkPayableTo: '',
          mailingAddress: '',
          zelleEmail: '',
          zellePhone: '',
          venmoUsername: '',
          venmoQRCode: '',
          paypalEmail: '',
          paypalLink: '',
          applePayEmail: '',
          applePayPhone: '',
          instructions: '',
          processingTime: '',
          minimumAmount: 0,
          maximumAmount: 0,
          fees: {
            type: 'percentage' as const,
            amount: 0,
          },
        },
        isDefault: false,
      });
      toast.success('Payment method added successfully');
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      setMethods(methods.filter((method) => method.id !== id));
      toast.success('Payment method deleted');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id, id);
      setMethods(
        methods.map((method) => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
      toast.success('Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const renderDetailsFields = () => {
    switch (formData.type) {
      case 'bank_transfer':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.details.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, bankName: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.details.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, accountNumber: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                value={formData.details.routingNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, routingNumber: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'zelle':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="zelleEmail">Zelle Email</Label>
              <Input
                id="zelleEmail"
                type="email"
                value={formData.details.zelleEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, zelleEmail: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zellePhone">Zelle Phone</Label>
              <Input
                id="zellePhone"
                type="tel"
                value={formData.details.zellePhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, zellePhone: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'venmo':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="venmoUsername">Venmo Username</Label>
              <Input
                id="venmoUsername"
                value={formData.details.venmoUsername}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, venmoUsername: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venmoQRCode">Venmo QR Code URL</Label>
              <Input
                id="venmoQRCode"
                value={formData.details.venmoQRCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, venmoQRCode: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'apple_pay':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="applePayEmail">Apple Pay Email</Label>
              <Input
                id="applePayEmail"
                type="email"
                value={formData.details.applePayEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, applePayEmail: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applePayPhone">Apple Pay Phone</Label>
              <Input
                id="applePayPhone"
                type="tel"
                value={formData.details.applePayPhone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, applePayPhone: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'paypal':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="paypalEmail">PayPal Email</Label>
              <Input
                id="paypalEmail"
                type="email"
                value={formData.details.paypalEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, paypalEmail: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypalLink">PayPal.me Link</Label>
              <Input
                id="paypalLink"
                value={formData.details.paypalLink}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, paypalLink: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      case 'check':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="checkPayableTo">Make Checks Payable To</Label>
              <Input
                id="checkPayableTo"
                value={formData.details.checkPayableTo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, checkPayableTo: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailingAddress">Mailing Address</Label>
              <Textarea
                id="mailingAddress"
                value={formData.details.mailingAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: { ...formData.details, mailingAddress: e.target.value },
                  })
                }
              />
            </div>
          </>
        );
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor="instructions">Payment Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.details.instructions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  details: { ...formData.details, instructions: e.target.value },
                })
              }
            />
          </div>
        );
    }
  };

  const renderPaymentMethodDetails = (method: PaymentMethod) => {
    switch (method.type) {
      case 'bank_transfer':
        return (
          <div className="text-sm text-gray-500">
            <p>Bank: {method.details.bankName}</p>
            <p>Account: {method.details.accountNumber}</p>
            <p>Routing: {method.details.routingNumber}</p>
          </div>
        );
      case 'zelle':
        return (
          <div className="text-sm text-gray-500">
            <p>Email: {method.details.zelleEmail}</p>
            <p>Phone: {method.details.zellePhone}</p>
          </div>
        );
      case 'venmo':
        return (
          <div className="text-sm text-gray-500">
            <p>Username: {method.details.venmoUsername}</p>
            {method.details.venmoQRCode && (
              <img
                src={method.details.venmoQRCode}
                alt="Venmo QR Code"
                className="w-24 h-24 mt-2"
              />
            )}
          </div>
        );
      case 'apple_pay':
        return (
          <div className="text-sm text-gray-500">
            <p>Email: {method.details.applePayEmail}</p>
            <p>Phone: {method.details.applePayPhone}</p>
          </div>
        );
      case 'paypal':
        return (
          <div className="text-sm text-gray-500">
            <p>Email: {method.details.paypalEmail}</p>
            <p>Link: {method.details.paypalLink}</p>
          </div>
        );
      case 'check':
        return (
          <div className="text-sm text-gray-500">
            <p>Payable to: {method.details.checkPayableTo}</p>
            <p>Address: {method.details.mailingAddress}</p>
          </div>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            <p>{method.details.instructions}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: PaymentMethod['type']) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Main Bank Account"
                />
              </div>

              {renderDetailsFields()}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumAmount">Minimum Amount</Label>
                  <Input
                    id="minimumAmount"
                    type="number"
                    value={formData.details.minimumAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          minimumAmount: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maximumAmount">Maximum Amount</Label>
                  <Input
                    id="maximumAmount"
                    type="number"
                    value={formData.details.maximumAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          maximumAmount: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">Processing Time</Label>
                <Input
                  id="processingTime"
                  value={formData.details.processingTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      details: { ...formData.details, processingTime: e.target.value },
                    })
                  }
                  placeholder="e.g., 1-2 business days"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isDefault: checked })
                  }
                />
                <Label htmlFor="isDefault">Set as default payment method</Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Payment Method</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{method.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {method.type.replace('_', ' ')}
                  </p>
                  {renderPaymentMethodDetails(method)}
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSetDefault(method.id)}
                    title={method.isDefault ? 'Default payment method' : 'Set as default'}
                  >
                    {method.isDefault ? (
                      <Star className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(method.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
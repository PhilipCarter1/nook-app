'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Plus, 
  Download, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  amount: number;
  type: 'rent' | 'deposit' | 'fee' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  tenant_id: string;
  property_id: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    type: 'rent',
    tenant_id: '',
    property_id: '',
    due_date: ''
  });

  const router = useRouter();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        toast.error('Failed to load payments');
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('payments')
        .insert([{
          ...newPayment,
          amount: parseFloat(newPayment.amount),
          status: 'pending'
        }]);

      if (error) {
        toast.error('Failed to create payment');
        return;
      }

      toast.success('Payment created successfully');
      setShowForm(false);
      setNewPayment({
        amount: '',
        type: 'rent',
        tenant_id: '',
        property_id: '',
        due_date: ''
      });
      loadPayments();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'fee': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => 
    p.status === 'pending' && new Date(p.due_date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nook-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">Manage rent and other payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{overduePayments.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
                <CreditCard className="h-8 w-8 text-nook-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </h3>
                      <Badge className={getTypeColor(payment.type)}>
                        {payment.type}
                      </Badge>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                      </div>
                      {payment.paid_date && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Paid: {new Date(payment.paid_date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        Tenant #{payment.tenant_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {payment.status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {payments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first payment record.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Payment Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create Payment Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Payment Type</Label>
                    <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="fee">Fee</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tenant_id">Tenant ID</Label>
                    <Input
                      id="tenant_id"
                      value={newPayment.tenant_id}
                      onChange={(e) => setNewPayment({...newPayment, tenant_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="property_id">Property ID</Label>
                    <Input
                      id="property_id"
                      value={newPayment.property_id}
                      onChange={(e) => setNewPayment({...newPayment, property_id: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newPayment.due_date}
                      onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Create Payment
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
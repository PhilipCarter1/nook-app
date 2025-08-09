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
  ArrowLeft,
  Search,
  X
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
  const [searchTerm, setSearchTerm] = useState('');
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
      // TEMPORARY: Use simulated data
      setPayments([
        {
          id: '1',
          amount: 2500,
          type: 'rent',
          status: 'completed',
          tenant_id: '1',
          property_id: '1',
          due_date: '2024-01-01',
          paid_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          amount: 3200,
          type: 'rent',
          status: 'pending',
          tenant_id: '2',
          property_id: '2',
          due_date: '2024-02-01',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '3',
          amount: 500,
          type: 'deposit',
          status: 'completed',
          tenant_id: '3',
          property_id: '1',
          due_date: '2024-01-15',
          paid_date: '2024-01-15',
          created_at: '2024-01-15T00:00:00Z'
        }
      ]);
      
      /* Comment out actual Supabase code for now
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
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPayment.amount || !newPayment.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TEMPORARY: Add to local state
      const payment = {
        id: Date.now().toString(),
        amount: parseFloat(newPayment.amount),
        type: newPayment.type as 'rent' | 'deposit' | 'fee' | 'other',
        status: 'pending' as const,
        tenant_id: newPayment.tenant_id || '1',
        property_id: newPayment.property_id || '1',
        due_date: newPayment.due_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
      
      setPayments([payment, ...payments]);
      setShowForm(false);
      setNewPayment({
        amount: '',
        type: 'rent',
        tenant_id: '',
        property_id: '',
        due_date: ''
      });
      toast.success('Payment created successfully!');
      
      /* Comment out actual Supabase code for now
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
      */
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to create payment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rent':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200';
      case 'deposit':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200';
      case 'fee':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200';
      case 'other':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payments</h1>
                <p className="text-gray-600 text-lg">Manage rent and other payments</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-900">${pendingPayments.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-nook-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-nook-purple-600">Total Payments</p>
                  <p className="text-2xl font-bold text-nook-purple-900">{payments.length}</p>
                </div>
                <div className="w-12 h-12 bg-nook-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
            />
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-6">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-xl flex items-center justify-center shadow-lg">
                        <CreditCard className="h-6 w-6 text-nook-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-nook-purple-600 transition-colors duration-200">
                            ${payment.amount.toLocaleString()}
                          </h3>
                          <Badge className={`${getTypeColor(payment.type)} font-semibold px-3 py-1`}>
                            {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                          </Badge>
                          <Badge className={`${getStatusColor(payment.status)} font-semibold px-3 py-1`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-nook-purple-500" />
                            Due: {new Date(payment.due_date).toLocaleDateString()}
                          </div>
                          {payment.paid_date && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Paid: {new Date(payment.paid_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-nook-purple-200 text-nook-purple-700 hover:bg-nook-purple-50 hover:border-nook-purple-300">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-nook-purple-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-10 w-10 text-nook-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No payments found</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">Get started by creating your first payment to begin managing your financial transactions</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Payment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-gray-200">
              <CardTitle className="text-2xl font-bold text-gray-900">Create New Payment</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div>
                  <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 mb-2 block">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="Enter payment amount"
                    required
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 mb-2 block">Payment Type</Label>
                  <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                    <SelectTrigger className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500">
                      <SelectValue placeholder="Select payment type" />
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
                  <Label htmlFor="due_date" className="text-sm font-semibold text-gray-700 mb-2 block">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newPayment.due_date}
                    onChange={(e) => setNewPayment({...newPayment, due_date: e.target.value})}
                    className="border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    Create Payment
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
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
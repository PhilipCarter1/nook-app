'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, User, CheckCircle, AlertCircle, Loader2, Building2 } from 'lucide-react';

interface InvitationData {
  id: string;
  landlord_id: string;
  property_id: string;
  unit_id?: string;
  tenant_email: string;
  tenant_first_name: string;
  tenant_last_name: string;
  message: string;
  status: string;
  expires_at: string;
  property?: {
    name: string;
    address: string;
  };
  unit?: {
    unit_number: string;
  };
}

export default function TenantInvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.id) {
      fetchInvitation(params.id);
    } else {
      setError('Invalid invitation link.');
      setIsLoading(false);
    }
  }, [params?.id]);

  const fetchInvitation = async (invitationId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select(`
          *,
          property:properties(name, address),
          unit:units(unit_number)
        `)
        .eq('id', invitationId)
        .single();

      if (error) {
        throw error;
      }

      if (data.status !== 'pending') {
        setError('This invitation has already been used or expired.');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired.');
        return;
      }

      setInvitation(data);
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      setError('Invalid invitation link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsAccepting(true);

    try {
      const supabase = createClient();

      // Create tenant user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation!.tenant_email,
        password: formData.password,
        options: {
          data: {
            full_name: `${invitation!.tenant_first_name} ${invitation!.tenant_last_name}`,
            role: 'tenant'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create tenant profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              role: 'tenant',
              display_name: `${invitation!.tenant_first_name} ${invitation!.tenant_last_name}`,
              bio: `Tenant at ${invitation!.property?.name || 'a property'}`,
              phone_number: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              lease_status: 'pending',
              lease_signed: false,
              document_verification_status: 'pending',
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.warning('Account created but profile setup incomplete.');
        }

        // Create tenant record
        const { error: tenantError } = await supabase
          .from('tenants')
          .insert([
            {
              user_id: authData.user.id,
              unit_id: invitation!.unit_id || null,
              status: 'active',
              documents: {},
              payment_status: 'pending',
              payment_method: null,
              payment_receipt: null,
              split_rent: { enabled: false, amount: 0, paid: 0 },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (tenantError) {
          console.error('Tenant record creation error:', tenantError);
        }

        // Update invitation status
        await supabase
          .from('tenant_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation!.id);

        toast.success('Account created successfully! Welcome to Nook.');
        
        // Redirect to tenant dashboard
        setTimeout(() => {
          router.push('/dashboard/tenant');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(`Failed to create account: ${error.message}`);
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/signup')} 
              className="w-full"
            >
              Create Account Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-nook-purple-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">You're Invited!</h2>
          <p className="text-gray-600">Join {invitation.property?.name || 'a property'} on Nook</p>
        </div>

        <Card className="shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Invitation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">{invitation.property?.name}</p>
                <p className="text-sm text-gray-600">{invitation.property?.address}</p>
                {invitation.unit && (
                  <p className="text-xs text-gray-500">Unit {invitation.unit.unit_number}</p>
                )}
              </div>
            </div>
            
            {invitation.message && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{invitation.message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Create Your Account</CardTitle>
            <p className="text-sm text-gray-600">
              Hi {invitation.tenant_first_name}! Create a password to complete your account setup.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.tenant_email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">This is the email you were invited with</p>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isAccepting || !formData.password || !formData.confirmPassword}
                className="w-full"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation & Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
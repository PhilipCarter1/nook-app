'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import { User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { log } from '@/lib/logger';

export default function SimpleLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    log('Simple login form submitted');
    
    setIsLoading(true);
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      log('Attempting to sign in with:', formData.email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (signInError) {
        log('Sign in error:', signInError.message);
        toast.error('Invalid email or password');
        return;
      }
      
      if (!data.user) {
        toast.error('No user data received. Please try again.');
        return;
      }
      
      log('Login successful for user:', data.user.id);
      toast.success('Welcome back to Nook!');
      
      // Go directly to a simple dashboard without complex auth provider
      router.push('/simple-dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log('Login error:', msg);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-nook-purple-100 flex items-center justify-center">
            <User className="h-6 w-6 text-nook-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-nook-purple-700">Simple Login Test</CardTitle>
          <p className="text-gray-600 mt-2">Test login without complex auth provider</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  placeholder="test@nook.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10"
                  placeholder="Test123!"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In (Simple Test)'
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Test accounts: test@nook.com, admin@test.com, landlord@test.com
              </p>
              <p className="text-sm text-gray-600">
                Password: Test123!
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

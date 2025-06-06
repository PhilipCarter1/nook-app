'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LoadingPage } from '@/components/ui/loading';
import { supabase } from '@/lib/supabase';

const MotionDiv = motion.div;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Get user role from the auth provider
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData) {
          // Redirect based on role
          switch (userData.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'landlord':
              router.push('/landlord/dashboard');
              break;
            case 'tenant':
              router.push('/tenant/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <div className="container mx-auto px-4 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Welcome Back
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="focus:ring-nook-purple-500"
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="focus:ring-nook-purple-500"
                    disabled={loading}
                    placeholder="Enter your password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-nook-purple-600 hover:bg-nook-purple-500" 
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-nook-purple-600 hover:text-nook-purple-500 font-medium inline-flex items-center"
                  >
                    Sign up <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </MotionDiv>
      </div>
    </div>
  );
} 
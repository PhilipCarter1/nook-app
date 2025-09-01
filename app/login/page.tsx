'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validation, setValidation] = useState({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
  });

  const [hasInteracted, setHasInteracted] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email) return { isValid: false, message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password) return { isValid: false, message: 'Password is required' };
    return { isValid: true, message: '' };
  };

  const updateValidation = (field: 'email' | 'password', value: string) => {
    let validationResult: { isValid: boolean; message: string };
    
    if (field === 'email') {
      validationResult = validateEmail(value);
    } else {
      validationResult = validatePassword(value);
    }

    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasInteracted(prev => ({ ...prev, [field]: true }));
    updateValidation(field as 'email' | 'password', value);
  };

  const isFormValid = () => {
    return formData.email.trim() !== '' && formData.password.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Debug: Log environment variables (first few characters only for security)
      console.log('Environment check:');
      console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('SUPABASE_URL starts with:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...');
      console.log('ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      console.log('ANON_KEY starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

      // Check if environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        toast.error('Configuration error. Please contact support.');
        return;
      }

      // Check if the values are the same (common mistake)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Environment variables have the same value - this is incorrect');
        toast.error('Configuration error: Environment variables are misconfigured. Please check your Vercel settings.');
        return;
      }

      const supabase = createClient();
      
      console.log('Attempting to sign in with:', formData.email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        if (signInError.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else if (signInError.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in');
        } else if (signInError.message.includes('Invalid API key')) {
          toast.error('Configuration error: Invalid Supabase API key');
        } else {
          toast.error('Authentication failed: ' + signInError.message);
        }
        return;
      }
      
      if (!data.user) {
        toast.error('No user data received. Please try again.');
        return;
      }
      
      console.log('Login successful!');
      toast.success('Welcome back to Nook!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
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
          <CardTitle className="text-2xl font-bold text-nook-purple-700">Welcome back</CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your Nook account</p>
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 pr-10 ${
                    hasInteracted.email && !validation.email.isValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : hasInteracted.email && validation.email.isValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500'
                  }`}
                  placeholder="john@example.com"
                  required
                />
                {hasInteracted.email && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {validation.email.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {hasInteracted.email && !validation.email.isValid && (
                <p className="text-xs text-red-500">{validation.email.message}</p>
              )}
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
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${
                    hasInteracted.password && !validation.password.isValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : hasInteracted.password && validation.password.isValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:border-nook-purple-500 focus:ring-nook-purple-500'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {hasInteracted.password && !validation.password.isValid && (
                <p className="text-xs text-red-500">{validation.password.message}</p>
              )}
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
                'Sign In'
              )}
            </Button>

            <div className="text-center space-y-3 pt-4">
              <Link href="/forgot-password" className="text-sm text-nook-purple-600 hover:text-nook-purple-500 font-medium transition-colors duration-200">
                Forgot password?
              </Link>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-nook-purple-600 hover:text-nook-purple-500 font-medium transition-colors duration-200">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
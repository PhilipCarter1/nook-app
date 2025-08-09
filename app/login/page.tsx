'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    // Temporarily simplify validation for debugging
    const hasEmail = formData.email.trim() !== '';
    const hasPassword = formData.password.trim() !== '';
    const isValid = hasEmail && hasPassword;
    
    console.log('Simple form validation:', {
      hasEmail,
      hasPassword,
      isValid,
      email: formData.email,
      password: formData.password
    });
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TEMPORARY: Bypass Supabase for now and simulate success
      console.log('Temporary: Bypassing Supabase login for testing');
      
      // Simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      console.log('Login successful!');
      toast.success('Welcome back to Nook!');
      router.push('/dashboard');
      
      /* Comment out actual Supabase code for now
      alert('Creating Supabase client...');
      const supabase = createClient();
      
      // Test Supabase configuration
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // TEMPORARY: Bypass Supabase for now and simulate success
      alert('Temporary: Bypassing Supabase login for testing');
      console.log('Temporary: Bypassing Supabase login for testing');
      
      // Simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      alert('Login successful! Redirecting...');
      console.log('Login successful!');
      toast.success('Welcome back to Nook!');
      router.push('/dashboard');
      
      /* Comment out actual Supabase code for now
      console.log('Attempting to sign in with:', formData.email);
      alert('Attempting to sign in...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (signInError) {
        alert('Sign in error: ' + signInError.message);
        console.error('Sign in error:', signInError);
        toast.error('Invalid email or password');
        return;
      }
      alert('Login successful! Redirecting...');
      console.log('Login successful!');
      toast.success('Welcome back to Nook!');
      router.push('/dashboard');
      */
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
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
          <p className="text-gray-600 mt-2">Sign in to your Nook account</p>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
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
                      : ''
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
                      : ''
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

            {searchParams?.get('message') && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{searchParams.get('message')}</p>
              </div>
            )}

            {/* Test button to see if form submission works */}
            <Button 
              type="button"
              onClick={() => {
                alert('Test button clicked!');
                console.log('Test button clicked!');
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Test Button (Should Show Alert)
            </Button>

            <Button 
              type="submit" 
              className="w-full bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
              disabled={isLoading}
              onClick={() => {
                alert('Button clicked!');
                console.log('Button clicked! Form valid:', isFormValid(), 'Loading:', isLoading);
                // Also try to manually trigger form submission
                const form = document.getElementById('login-form') as HTMLFormElement;
                if (form) {
                  console.log('Form found, attempting manual submission');
                  form.dispatchEvent(new Event('submit', { bubbles: true }));
                } else {
                  console.log('Form not found');
                }
              }}
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
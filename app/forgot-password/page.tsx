'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { getClient } from '@/lib/supabase/client';
import { log } from '@/lib/logger';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [validation, setValidation] = useState({ isValid: true, message: '' });

  const validateEmail = (email: string): { isValid: boolean; message: string } => {
    if (!email) return { isValid: false, message: 'Email is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    return { isValid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(email);
    setValidation(emailValidation);
    setHasInteracted(true);
    
    if (!emailValidation.isValid) {
      return;
    }
    
    setIsLoading(true);

    try {
      const supabase = getClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
      toast.success('Password reset instructions sent to your email');
    } catch (err) {
      log.error('Password reset error:', err as Error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    setHasInteracted(true);
    setValidation(validateEmail(value));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-nook-purple-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-nook-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Reset your password</CardTitle>
          <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
              <p className="text-gray-600">We've sent password reset instructions to {email}</p>
              <Link 
                href="/login" 
                className="inline-flex items-center text-nook-purple-600 hover:text-nook-purple-500 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to login
              </Link>
            </div>
          ) : (
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
                    value={email}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className={`pl-10 pr-10 ${
                      hasInteracted && !validation.isValid
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : hasInteracted && validation.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                    placeholder="john@example.com"
                    required
                    autoFocus
                  />
                  {hasInteracted && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {hasInteracted && !validation.isValid && (
                  <p className="text-xs text-red-500">{validation.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={isLoading || !validation.isValid || email.trim() === ''}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </Button>

              <div className="text-center pt-4">
                <Link 
                  href="/login" 
                  className="inline-flex items-center text-nook-purple-600 hover:text-nook-purple-500 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
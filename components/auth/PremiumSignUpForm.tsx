'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { log } from '@/lib/logger';

interface ValidationState {
  email: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
  firstName: { isValid: boolean; message: string };
  lastName: { isValid: boolean; message: string };
  role: { isValid: boolean; message: string };
}

export default function PremiumSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'admin', // Default to admin for trial starters
  });

  const [validation, setValidation] = useState({
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
  });

  const [hasInteracted, setHasInteracted] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
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
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters' };
    }
    return { isValid: true, message: '' };
  };

  const validateConfirmPassword = (confirmPassword: string): { isValid: boolean; message: string } => {
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' };
    if (confirmPassword !== formData.password) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
  };

  const validateName = (name: string, field: 'firstName' | 'lastName'): { isValid: boolean; message: string } => {
    if (!name.trim()) return { isValid: false, message: `${field === 'firstName' ? 'First name' : 'Last name'} is required` };
    return { isValid: true, message: '' };
  };

  const updateValidation = (field: keyof ValidationState, value: string) => {
    let validationResult: { isValid: boolean; message: string };
    
    switch (field) {
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value);
        break;
      case 'confirmPassword':
        validationResult = validateConfirmPassword(value);
        break;
      case 'firstName':
        validationResult = validateName(value, 'firstName');
        break;
      case 'lastName':
        validationResult = validateName(value, 'lastName');
        break;
      default:
        return;
    }

    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasInteracted(prev => ({ ...prev, [field]: true }));
    updateValidation(field as keyof ValidationState, value);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return validation.firstName.isValid && hasInteracted.firstName &&
               validation.lastName.isValid && hasInteracted.lastName &&
               formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
      case 2:
        return validation.email.isValid && hasInteracted.email &&
               formData.email.trim() !== '';
      case 3:
        return validation.password.isValid && hasInteracted.password &&
               validation.confirmPassword.isValid && hasInteracted.confirmPassword &&
               formData.password.trim() !== '' && formData.confirmPassword.trim() !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      updateValidation('email', formData.email);
      setHasInteracted(prev => ({ ...prev, email: true }));
      if (validation.email.isValid && formData.email.trim() !== '') {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      updateValidation('password', formData.password);
      updateValidation('confirmPassword', formData.confirmPassword);
      setHasInteracted(prev => ({ ...prev, password: true, confirmPassword: true }));
      if (validation.password.isValid && validation.confirmPassword.isValid && 
          formData.password.trim() !== '' && formData.confirmPassword.trim() !== '') {
        setCurrentStep(3);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Signup form submitted!');
    console.log('Form submitted!');
    console.log('Form data:', formData);

    // Validate all fields
    Object.keys(formData).forEach(field => {
      updateValidation(field as keyof typeof formData, formData[field as keyof typeof formData]);
      setHasInteracted(prev => ({ ...prev, [field]: true }));
    });

    if (!isStepValid(3)) {
      alert('Form validation failed');
      console.log('Form validation failed');
      return;
    }

    alert('Form validation passed, starting signup...');
    console.log('Starting signup process...');
    setIsLoading(true);

    try {
      alert('Creating Supabase client...');
      const supabase = createClient();
      console.log('Supabase client created');
      alert('Supabase client created');

      // Log environment variables (without exposing sensitive data)
      console.log('Environment variables check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      });
      alert('Environment check - URL: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL ? 'EXISTS (' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0) + ' chars)' : 'MISSING') + ', Key: ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS (' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0) + ' chars)' : 'MISSING'));

      // Test basic Supabase connection
      try {
        console.log('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1);
        
        console.log('Connection test result:', { testData, testError });
        alert('Connection test: ' + (testError ? 'FAILED - ' + testError.message : 'SUCCESS'));
        
        if (testError) {
          console.error('Supabase connection failed:', testError);
          alert('Cannot connect to database. Please check Supabase configuration.');
          return;
        }
      } catch (testErr) {
        console.error('Supabase connection test error:', testErr);
        alert('Supabase connection test error: ' + testErr);
        return;
      }

      alert('Attempting to sign up...');
      console.log('Attempting to sign up...');
      console.log('Email:', formData.email);
      console.log('Password length:', formData.password.length);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Invalid email format');
        return;
      }
      
      // Validate password length (Supabase requires at least 6 characters)
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      // TEMPORARY: Bypass Supabase for now and simulate success
      alert('Temporary: Bypassing Supabase signup for testing');
      console.log('Temporary: Bypassing Supabase signup for testing');
      
      // Simulate successful signup
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      console.log('Account created successfully!');
      toast.success('Account created successfully! Welcome to Nook.');
      
      // All trial starters become admins
      router.push('/dashboard/admin');
      
      /* Comment out actual Supabase code for now
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'tenant'
          }
        }
      });

      console.log('Auth response:', { authData, signUpError });
      alert('Auth response received: ' + (signUpError ? 'ERROR' : 'SUCCESS'));
      
      if (signUpError) {
        const errorMessage = signUpError.message || 'Unknown error';
        const errorCode = signUpError.status || 'No status code';
        alert(`Signup error: ${errorMessage} (Code: ${errorCode})`);
        console.error('Signup error details:', signUpError);
        toast.error('Failed to create account. Please try again.');
        return;
      }

      if (authData.user) {
        alert('User created successfully!');
        console.log('User created successfully!');
        toast.success('Account created successfully! Welcome to Nook.');
        router.push('/dashboard');
      } else {
        alert('No user data returned');
        console.log('No user data returned');
        toast.error('Account creation failed. Please try again.');
      }
      */
    } catch (err: any) {
      alert('Sign up error: ' + err.message);
      console.error('Sign up error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Name</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={hasInteracted.firstName && !validation.firstName.isValid ? 'border-red-500' : ''}
                  required
                />
                {hasInteracted.firstName && !validation.firstName.isValid && (
                  <p className="text-xs text-red-500">{validation.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={hasInteracted.lastName && !validation.lastName.isValid ? 'border-red-500' : ''}
                  required
                />
                {hasInteracted.lastName && !validation.lastName.isValid && (
                  <p className="text-xs text-red-500">{validation.lastName.message}</p>
                )}
              </div>
            </div>
            <Button onClick={handleNext} className="w-full mt-6 bg-nook-purple-600 hover:bg-nook-purple-500">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Email</h2>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${hasInteracted.email && !validation.email.isValid ? 'border-red-500' : ''}`}
                  placeholder="john@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {hasInteracted.email && !validation.email.isValid && (
                <p className="text-xs text-red-500">{validation.email.message}</p>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-500">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Set Password</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 ${hasInteracted.password && !validation.password.isValid ? 'border-red-500' : ''}`}
                    placeholder="Min 8 characters"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-10 pr-10 ${hasInteracted.confirmPassword && !validation.confirmPassword.isValid ? 'border-red-500' : ''}`}
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                {hasInteracted.confirmPassword && !validation.confirmPassword.isValid && (
                  <p className="text-xs text-red-500">{validation.confirmPassword.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-500"
                disabled={isLoading || !isStepValid(3)}
                onClick={() => console.log('Create Account button clicked!')}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Start Free Trial
              </Button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
          
          <div className="text-center pt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-nook-purple-600 hover:text-nook-purple-500 font-medium transition-colors duration-200">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
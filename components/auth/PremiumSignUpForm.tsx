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
    role: 'admin' as const,
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
        validationResult = { isValid: true, message: '' };
    }
    
    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasInteracted(prev => ({ ...prev, [field]: true }));
    updateValidation(field, value);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return validation.firstName.isValid && validation.lastName.isValid && formData.firstName && formData.lastName;
      case 2:
        return validation.email.isValid && formData.email;
      case 3:
        return validation.password.isValid && validation.confirmPassword.isValid && formData.password && formData.confirmPassword;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      // Mark all fields in current step as interacted
      if (currentStep === 1) {
        setHasInteracted(prev => ({ ...prev, firstName: true, lastName: true }));
      } else if (currentStep === 2) {
        setHasInteracted(prev => ({ ...prev, email: true }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Validate all fields
      Object.keys(formData).forEach(field => {
        updateValidation(field as keyof typeof formData, formData[field as keyof typeof formData]);
        setHasInteracted(prev => ({ ...prev, [field]: true }));
      });

      if (!isStepValid(3)) {
        toast.error('Please fix the validation errors before submitting.');
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');

      // Create user account with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'admin'
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        toast.dismiss(loadingToast);
        toast.error(`Failed to create account: ${signUpError.message}`);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Create user profile via API
        try {
          const resp = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: authData.user.id,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: 'landlord'
            })
          });

          const result = await resp.json();
          toast.dismiss(loadingToast);
          
          if (!resp.ok) {
            console.error('Profile creation error:', result);
            // If profile creation fails, we still have the auth user, so we can continue
            toast.warning('Account created but profile setup incomplete. You can complete it later.');
          } else {
            toast.success('Account created successfully! Welcome to Nook Admin.');
          }
        } catch (profileError) {
          console.error('Profile API error:', profileError);
          toast.dismiss(loadingToast);
          toast.warning('Account created but profile setup incomplete. You can complete it later.');
        }
        
        // Redirect to admin dashboard
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 1000);
      } else {
        toast.dismiss(loadingToast);
        toast.error('Account creation failed. Please try again.');
      }
    } catch (err: any) {
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
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-nook-purple-700">Your Name</h2>
              <p className="text-gray-600 mt-2">Let's start with your basic information</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`h-11 ${hasInteracted.firstName && !validation.firstName.isValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-nook-purple-500'}`}
                  placeholder="Enter your first name"
                  required
                />
                {hasInteracted.firstName && !validation.firstName.isValid && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validation.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`h-11 ${hasInteracted.lastName && !validation.lastName.isValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-nook-purple-500'}`}
                  placeholder="Enter your last name"
                  required
                />
                {hasInteracted.lastName && !validation.lastName.isValid && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validation.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleNext} 
              className="w-full mt-6 h-11 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-nook-purple-700">Your Email</h2>
              <p className="text-gray-600 mt-2">We'll use this for your account</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-11 pl-10 ${hasInteracted.email && !validation.email.isValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-nook-purple-500'}`}
                  placeholder="john@example.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {hasInteracted.email && !validation.email.isValid && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {validation.email.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)} 
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1 h-11 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-nook-purple-700">Set Password</h2>
              <p className="text-gray-600 mt-2">Create a secure password for your account</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-11 pl-10 pr-10 ${hasInteracted.password && !validation.password.isValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-nook-purple-500'}`}
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
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validation.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`h-11 pl-10 pr-10 ${hasInteracted.confirmPassword && !validation.confirmPassword.isValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-nook-purple-500'}`}
                    placeholder="Confirm your password"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {hasInteracted.confirmPassword && !validation.confirmPassword.isValid && (
                  <p className="text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validation.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(2)} 
                className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading || !isStepValid(3)}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
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
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
          
          <div className="text-center pt-6 border-t border-gray-100 mt-6">
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
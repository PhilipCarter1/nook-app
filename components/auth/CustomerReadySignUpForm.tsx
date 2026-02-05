'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Sparkles, Loader2, Building2, Home, Users } from 'lucide-react';
import { log } from '@/lib/logger';

interface ValidationState {
  email: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
  firstName: { isValid: boolean; message: string };
  lastName: { isValid: boolean; message: string };
  role: { isValid: boolean; message: string };
}

export default function CustomerReadySignUpForm() {
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
    role: '' as 'landlord' | 'property_manager' | 'tenant',
  });

  const [validation, setValidation] = useState<ValidationState>({
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    role: { isValid: true, message: '' },
  });

  const [hasInteracted, setHasInteracted] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
  });

  // Force light theme for this component
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

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

  const validateRequired = (field: string, value: string): { isValid: boolean; message: string } => {
    if (!value.trim()) return { isValid: false, message: `${field} is required` };
    return { isValid: true, message: '' };
  };

  const validateRole = (role: string): { isValid: boolean; message: string } => {
    if (!role) return { isValid: false, message: 'Please select your role' };
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
        validationResult = validateRequired('First name', value);
        break;
      case 'lastName':
        validationResult = validateRequired('Last name', value);
        break;
      case 'role':
        validationResult = validateRole(value);
        break;
      default:
        validationResult = { isValid: true, message: '' };
    }

    setValidation(prev => ({
      ...prev,
      [field]: validationResult
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return validation.firstName.isValid && validation.lastName.isValid;
      case 2:
        return validation.email.isValid && validation.password.isValid && validation.confirmPassword.isValid;
      case 3:
        return validation.role.isValid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!isStepValid(1)) {
        setHasInteracted(prev => ({ ...prev, firstName: true, lastName: true }));
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isStepValid(2)) {
        setHasInteracted(prev => ({ ...prev, email: true, password: true, confirmPassword: true }));
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAccount = async () => {
    if (!isStepValid(3)) {
      log.warn('Validation failed', { validation });
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setIsLoading(true);
    log.info('Starting account creation for user', { email: formData.email });

    try {
      // Test Supabase connection
      const { data: testData, error: testError } = await supabase.auth.getSession();
      if (testError) {
        log.error('Supabase connection failed', testError);
        toast.error(`Connection failed: ${testError.message}`);
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');

      log.info('Attempting to create user account');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role
          }
        }
      });

      if (signUpError) {
        log.error('Signup failed', signUpError);
        toast.dismiss(loadingToast);
        toast.error(`Failed to create account: ${signUpError.message}`);
        setIsLoading(false);
        return;
      }

      // Check if user was created but needs email confirmation
      if (authData.user && !authData.session) {
        log.info('User created but needs email confirmation');
        toast.dismiss(loadingToast);
        toast.success('Account created! Please check your email to confirm your account before signing in.');
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        log.info('User created successfully', { userId: authData.user.id });
        
        // Create user profile via API
        try {
          log.info('Creating user profile');
          const profileResp = await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: authData.user.id,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: formData.role
            })
          });

          const profileResult = await profileResp.json();
          if (!profileResp.ok) {
            log.warn('Error creating user profile', { profileResult });
            // Continue anyway - auth was successful
          } else {
            log.info('User profile created successfully');
          }
        } catch (profileErr: unknown) {
          const msg = profileErr instanceof Error ? profileErr.message : 'Unknown error';
          log.error('Error calling profile API', profileErr instanceof Error ? profileErr : new Error(msg));
          // Continue anyway - auth was successful
        }
        
        toast.dismiss(loadingToast);
        
        log.info('Account created successfully');
        toast.success(`Account created successfully! Welcome to Nook as a ${formData.role.replace('_', ' ')}.`);
        
        // Redirect to login page instead of dashboard
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        log.warn('No user data returned from signup');
        toast.dismiss(loadingToast);
        toast.error('Account creation failed. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      log.error('Unexpected error during signup', err instanceof Error ? err : new Error(msg));
      toast.error(`Unexpected error: ${msg || 'Something went wrong'}`);
    } finally {
      log.info('Signup process completed');
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, firstName: e.target.value }));
                  updateValidation('firstName', e.target.value);
                }}
                onBlur={() => setHasInteracted(prev => ({ ...prev, firstName: true }))}
                className={hasInteracted.firstName && !validation.firstName.isValid ? 'border-red-500' : ''}
                placeholder="Enter your first name"
              />
              {hasInteracted.firstName && !validation.firstName.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, lastName: e.target.value }));
                  updateValidation('lastName', e.target.value);
                }}
                onBlur={() => setHasInteracted(prev => ({ ...prev, lastName: true }))}
                className={hasInteracted.lastName && !validation.lastName.isValid ? 'border-red-500' : ''}
                placeholder="Enter your last name"
              />
              {hasInteracted.lastName && !validation.lastName.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.lastName.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(1)}
              className="w-full"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  updateValidation('email', e.target.value);
                }}
                onBlur={() => setHasInteracted(prev => ({ ...prev, email: true }))}
                className={hasInteracted.email && !validation.email.isValid ? 'border-red-500' : ''}
                placeholder="Enter your email address"
              />
              {hasInteracted.email && !validation.email.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    updateValidation('password', e.target.value);
                  }}
                  onBlur={() => setHasInteracted(prev => ({ ...prev, password: true }))}
                  className={hasInteracted.password && !validation.password.isValid ? 'border-red-500' : ''}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {hasInteracted.password && !validation.password.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.password.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    updateValidation('confirmPassword', e.target.value);
                  }}
                  onBlur={() => setHasInteracted(prev => ({ ...prev, confirmPassword: true }))}
                  className={hasInteracted.confirmPassword && !validation.confirmPassword.isValid ? 'border-gray-300' : ''}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {hasInteracted.confirmPassword && !validation.confirmPassword.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(2)}
                className="flex-1"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">What best describes you?</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, role: value as any }));
                  updateValidation('role', value);
                }}
              >
                <SelectTrigger className={hasInteracted.role && !validation.role.isValid ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Property Owner/Landlord
                    </div>
                  </SelectItem>
                  <SelectItem value="property_manager">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Property Manager
                    </div>
                  </SelectItem>
                  <SelectItem value="tenant">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Tenant
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {hasInteracted.role && !validation.role.isValid && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validation.role.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  console.log('🚨 BUTTON CLICKED! 🚨');
                  handleCreateAccount();
                }}
                disabled={!isStepValid(3) || isLoading}
                className="flex-1 bg-nook-purple-600 hover:bg-nook-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-nook-purple-600 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Nook</h2>
          <p className="text-gray-600">The smart property management platform</p>
        </div>

        <Card className="shadow-xl bg-white border-gray-200">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">Create Your Account</CardTitle>
            <div className="flex items-center justify-center space-x-2 mt-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-nook-purple-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderStep()}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-nook-purple-600 hover:text-nook-purple-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

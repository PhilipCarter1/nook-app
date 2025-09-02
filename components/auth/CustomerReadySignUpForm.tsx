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
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Sparkles, Loader2, Building2, Home, Users } from 'lucide-react';

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
    // Simple test to see if function is called
    console.log('🚨 FUNCTION CALLED! 🚨');
    alert('Create Account button clicked!');
    console.log('=== SIGNUP DEBUG START ===');
    console.log('Create Account button clicked!');
    console.log('Form data:', formData);
    console.log('Current step:', currentStep);
    console.log('Step valid:', isStepValid(3));
    
    // Debug environment variables
    console.log('Environment check:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    if (!isStepValid(3)) {
      console.log('Validation failed:', validation);
      alert('Validation failed!');
      toast.error('Please fix the validation errors before submitting.');
      return;
    }

    setIsLoading(true);
    console.log('Starting account creation...');

    try {
      console.log('Creating Supabase client...');
      console.log('Using supabase client directly...');
      console.log('Supabase client created successfully');

      // Test Supabase connection
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase.auth.getSession();
      console.log('Connection test result:', { testData, testError });

      // Test database access
      console.log('Testing database access...');
      const { data: testTableData, error: testTableError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      console.log('Database access test:', { testTableData, testTableError });

      if (testError) {
        console.error('Supabase connection failed:', testError);
        alert('Supabase connection failed!');
        toast.error(`Connection failed: ${testError.message}`);
        setIsLoading(false);
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading('Creating your account...');

      console.log('Attempting to create user account...');
      console.log('Signup payload:', {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role
          }
        }
      });

      // Try signup with metadata
      console.log('Trying signup with metadata...');
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

      console.log('Simple signup result:', { authData, signUpError });

      if (signUpError) {
        console.error('Signup failed:', signUpError);
        console.error('Signup error details:', {
          message: signUpError.message,
          status: signUpError.status,
          statusText: signUpError.statusText
        });
        alert(`Signup error: ${signUpError.message}`);
        toast.dismiss(loadingToast);
        toast.error(`Failed to create account: ${signUpError.message}`);
        setIsLoading(false);
        return;
      }

      // Check if user was created but needs email confirmation
      if (authData.user && !authData.session) {
        console.log('User created but needs email confirmation');
        toast.dismiss(loadingToast);
        toast.success('Account created! Please check your email to confirm your account before signing in.');
        alert('Account created successfully! Please check your email to confirm your account before signing in.');
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        console.log('=== USER CREATED SUCCESSFULLY ===');
        console.log('User ID:', authData.user.id);
        console.log('User email:', authData.user.email);
        console.log('User metadata:', authData.user.user_metadata);
        
        toast.dismiss(loadingToast);
        
        // For now, skip profile creation and just show success
        console.log('Account created successfully! Profile will be created later.');
        alert('Account created successfully! You can now sign in.');
        toast.success(`Account created successfully! Welcome to Nook as a ${formData.role.replace('_', ' ')}.`);
        
        // Redirect to login page instead of dashboard
        console.log('Redirecting to login page...');
        
        setTimeout(() => {
          console.log('Executing redirect to login...');
          window.location.href = '/login';
        }, 2000);
      } else {
        console.error('=== NO USER DATA RETURNED ===');
        console.error('Auth data structure:', authData);
        alert('No user data returned from signup!');
        toast.dismiss(loadingToast);
        toast.error('Account creation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('=== UNEXPECTED ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Full error object:', err);
      alert(`Unexpected error: ${err.message}`);
      toast.error(`Unexpected error: ${err.message || 'Something went wrong'}`);
    } finally {
      console.log('=== SIGNUP PROCESS COMPLETED ===');
      console.log('Setting loading to false');
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

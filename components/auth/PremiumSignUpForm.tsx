'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { log } from '@/lib/logger';

interface ValidationState {
  email: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
  firstName: { isValid: boolean; message: string };
  lastName: { isValid: boolean; message: string };
}

export default function PremiumSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: true, message: '' },
    password: { isValid: true, message: '' },
    confirmPassword: { isValid: true, message: '' },
    firstName: { isValid: true, message: '' },
    lastName: { isValid: true, message: '' },
  });

  const [hasInteracted, setHasInteracted] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
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

  const isStepValid = (currentStep: number) => {
    if (currentStep === 1) {
      return validation.email.isValid && formData.email.trim() !== '';
    }
    if (currentStep === 2) {
      return validation.password.isValid && validation.confirmPassword.isValid && 
             formData.password.trim() !== '' && formData.confirmPassword.trim() !== '';
    }
    if (currentStep === 3) {
      return validation.firstName.isValid && validation.lastName.isValid && 
             formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
    }
    return false;
  };

  const handleNextStep = () => {
    if (step === 1) {
      updateValidation('email', formData.email);
      setHasInteracted(prev => ({ ...prev, email: true }));
      if (validation.email.isValid && formData.email.trim() !== '') {
        setStep(2);
      }
    } else if (step === 2) {
      updateValidation('password', formData.password);
      updateValidation('confirmPassword', formData.confirmPassword);
      setHasInteracted(prev => ({ ...prev, password: true, confirmPassword: true }));
      if (validation.password.isValid && validation.confirmPassword.isValid && 
          formData.password.trim() !== '' && formData.confirmPassword.trim() !== '') {
        setStep(3);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    alert('Form submitted!'); // Immediate feedback
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      updateValidation(field as keyof ValidationState, formData[field as keyof typeof formData]);
      setHasInteracted(prev => ({ ...prev, [field]: true }));
    });

    if (!isStepValid(3)) {
      console.log('Form validation failed');
      alert('Form validation failed'); // Immediate feedback
      return;
    }
    
    console.log('Starting signup process...');
    alert('Starting signup process...'); // Immediate feedback
    setIsLoading(true);

    try {
      // Temporary: Skip Supabase for now and just simulate success
      console.log('Temporary: Bypassing Supabase for testing');
      alert('Temporary: Bypassing Supabase for testing');
      
      // Simulate successful signup
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      
      console.log('Account created successfully!');
      alert('Account created successfully!'); // Debug
      toast.success('Account created successfully! Welcome to Nook.');
      router.push('/dashboard');
      
      /* Comment out actual Supabase code for now
      const supabase = createClient();
      console.log('Supabase client created');
      alert('Supabase client created'); // Debug
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log('Auth response:', { authData, signUpError });
      alert('Auth response received: ' + (signUpError ? 'ERROR' : 'SUCCESS')); // Debug

      if (signUpError) {
        console.error('Signup error:', signUpError);
        alert('Signup error: ' + signUpError.message); // Debug
        throw signUpError;
      }

      if (authData.user) {
        console.log('User created, creating profile...');
        alert('User created successfully!'); // Debug
        
        // Create user profile with the correct schema
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              role: 'tenant',
            },
          ]);

        console.log('Profile creation result:', { profileError });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          alert('Profile creation error: ' + profileError.message); // Debug
          // Don't throw error, just log it - user can still access the platform
        }

        console.log('Account created successfully!');
        alert('Account created successfully!'); // Debug
        toast.success('Account created successfully! Welcome to Nook.');
        router.push('/dashboard');
      } else {
        console.log('No user data returned');
        alert('No user data returned'); // Debug
        toast.error('Account creation failed. Please try again.');
      }
      */
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      if (err.message?.includes('already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-nook-purple-100 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-nook-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Get started with Nook</h2>
              <p className="text-gray-600 mt-2">Enter your email to create your account</p>
            </div>
            
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
                  autoFocus
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

            <Button 
              onClick={handleNextStep}
              className="w-full bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
              disabled={!validation.email.isValid || formData.email.trim() === ''}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-nook-purple-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-nook-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create your password</h2>
              <p className="text-gray-600 mt-2">Choose a strong password to secure your account</p>
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
                  placeholder="Create a password"
                  required
                  autoFocus
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${
                    hasInteracted.confirmPassword && !validation.confirmPassword.isValid
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : hasInteracted.confirmPassword && validation.confirmPassword.isValid
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                      : ''
                  }`}
                  placeholder="Confirm your password"
                  required
                />
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
                <p className="text-xs text-red-500">{validation.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              onClick={handleNextStep}
              className="w-full bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
              disabled={!validation.password.isValid || !validation.confirmPassword.isValid || 
                       formData.password.trim() === '' || formData.confirmPassword.trim() === ''}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-nook-purple-100 flex items-center justify-center">
                <User className="h-6 w-6 text-nook-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-gray-600 mt-2">We'll personalize your experience</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pr-10 ${
                      hasInteracted.firstName && !validation.firstName.isValid
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : hasInteracted.firstName && validation.firstName.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                    placeholder="John"
                    required
                    autoFocus
                  />
                  {hasInteracted.firstName && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {validation.firstName.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {hasInteracted.firstName && !validation.firstName.isValid && (
                  <p className="text-xs text-red-500">{validation.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`pr-10 ${
                      hasInteracted.lastName && !validation.lastName.isValid
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : hasInteracted.lastName && validation.lastName.isValid
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                        : ''
                    }`}
                    placeholder="Doe"
                    required
                  />
                  {hasInteracted.lastName && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {validation.lastName.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {hasInteracted.lastName && !validation.lastName.isValid && (
                  <p className="text-xs text-red-500">{validation.lastName.message}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-nook-purple-600 hover:bg-nook-purple-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
              disabled={isLoading || !isStepValid(3)}
              onClick={() => {
                console.log('Button clicked!');
                alert('Button clicked!');
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
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
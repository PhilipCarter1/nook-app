'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/auth-provider';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Home,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { log } from '@/lib/logger';

interface ValidationState {
  email: { isValid: boolean; message: string };
  password: { isValid: boolean; message: string };
  confirmPassword: { isValid: boolean; message: string };
  firstName: { isValid: boolean; message: string };
  lastName: { isValid: boolean; message: string };
}

export default function PremiumAuthForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  const [signinData, setSigninData] = useState({
    email: '',
    password: '',
  });

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'landlord' as 'landlord' | 'tenant' | 'property_manager',
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

  const supabase = createClient();

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
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' };
    }
    return { isValid: true, message: '' };
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): { isValid: boolean; message: string } => {
    if (!confirmPassword) return { isValid: false, message: 'Please confirm your password' };
    if (confirmPassword !== password) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    return { isValid: true, message: '' };
  };

  const validateName = (name: string, fieldName: string): { isValid: boolean; message: string } => {
    if (!name) return { isValid: false, message: `${fieldName} is required` };
    if (name.length < 2) {
      return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
    }
    return { isValid: true, message: '' };
  };

  const updateValidation = (field: keyof ValidationState, value: string, additionalValue?: string) => {
    let result: { isValid: boolean; message: string };
    
    switch (field) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        result = validateConfirmPassword(value, additionalValue || signupData.password);
        break;
      case 'firstName':
        result = validateName(value, 'First name');
        break;
      case 'lastName':
        result = validateName(value, 'Last name');
        break;
      default:
        result = { isValid: true, message: '' };
    }
    
    setValidation(prev => ({ ...prev, [field]: result }));
  };

  const isSigninFormValid = () => {
    return signinData.email.trim() !== '' && 
           signinData.password.trim() !== '' &&
           validation.email.isValid && 
           validation.password.isValid;
  };

  const isSignupFormValid = () => {
    return Object.values(signupData).every(v => v.trim() !== '') &&
           Object.values(validation).every(v => v.isValid);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSigninFormValid()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Signing you in...');

    try {
      await signIn(signinData.email, signinData.password);
      
      toast.dismiss(loadingToast);
      toast.success('Welcome back! Signing you in...');
      
      // Small delay to show success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Sign in error:', err);
      toast.dismiss(loadingToast);
      
      // Handle specific error cases
      if (err.message.includes('Invalid email or password')) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message.includes('Email not confirmed')) {
        toast.error('Please check your email and confirm your account before signing in.');
      } else if (err.message.includes('Too many requests')) {
        toast.error('Too many login attempts. Please wait a moment and try again.');
      } else {
        toast.error(`Sign in failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignupFormValid()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');

    try {
      // Step 1: Create auth account
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            full_name: `${signupData.firstName} ${signupData.lastName}`,
            role: signupData.role
          }
        }
      });

      if (error) {
        toast.dismiss(loadingToast);
        console.error('Sign up error:', error);
        
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setActiveTab('signin');
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 8 characters long.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(`Account creation failed: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast.dismiss(loadingToast);
        toast.error('Account creation failed. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Auth account created, now creating user profile...');

      // Step 2: Create user profile via secure server API (uses service role key to avoid RLS issues)
      try {
        const resp = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: signupData.email,
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            role: signupData.role
          })
        });

        const result = await resp.json();
        if (!resp.ok) {
          console.error('❌ Error creating user profile (server):', result);
          toast.dismiss(loadingToast);
          toast.success('Account created! Please sign in.');
          setActiveTab('signin');
          setIsLoading(false);
          return;
        }

        toast.dismiss(loadingToast);

        // Step 3: Handle post-signup flow
        if (data.session) {
          toast.success(`Welcome to Nook, ${signupData.firstName}! Your account has been created.`);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          toast.success('Account created! Please check your email to confirm your account.');
          setActiveTab('signin');
        }
      } catch (profileError) {
        console.error('Unexpected error creating profile (server):', profileError);
        toast.dismiss(loadingToast);
        toast.warning('Account created, but profile setup had issues. Please sign in and complete your profile.');
        setActiveTab('signin');
      }
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      toast.dismiss(loadingToast);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'landlord':
        return <Building2 className="h-4 w-4" />;
      case 'property_manager':
        return <UserCheck className="h-4 w-4" />;
      case 'tenant':
        return <Home className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'landlord':
        return 'Property owner managing rental properties';
      case 'property_manager':
        return 'Professional managing properties for owners';
      case 'tenant':
        return 'Renting a property or unit';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-nook-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Nook
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your premium property management platform
          </p>
        </div>

        {/* Auth Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={signinData.email}
                        onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signinData.password}
                        onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isSigninFormValid()}
                    className="w-full bg-nook-purple-600 hover:bg-nook-purple-700 text-white font-medium py-2.5"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-firstName">First Name</Label>
                      <Input
                        id="signup-firstName"
                        type="text"
                        value={signupData.firstName}
                        onChange={(e) => {
                          setSignupData(prev => ({ ...prev, firstName: e.target.value }));
                          updateValidation('firstName', e.target.value);
                        }}
                        onBlur={() => setHasInteracted(prev => ({ ...prev, firstName: true }))}
                        className={hasInteracted.firstName && !validation.firstName.isValid ? 'border-red-500' : ''}
                        placeholder="First name"
                        required
                      />
                      {hasInteracted.firstName && !validation.firstName.isValid && (
                        <p className="text-red-500 text-xs mt-1">{validation.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="signup-lastName">Last Name</Label>
                      <Input
                        id="signup-lastName"
                        type="text"
                        value={signupData.lastName}
                        onChange={(e) => {
                          setSignupData(prev => ({ ...prev, lastName: e.target.value }));
                          updateValidation('lastName', e.target.value);
                        }}
                        onBlur={() => setHasInteracted(prev => ({ ...prev, lastName: true }))}
                        className={hasInteracted.lastName && !validation.lastName.isValid ? 'border-red-500' : ''}
                        placeholder="Last name"
                        required
                      />
                      {hasInteracted.lastName && !validation.lastName.isValid && (
                        <p className="text-red-500 text-xs mt-1">{validation.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => {
                          setSignupData(prev => ({ ...prev, email: e.target.value }));
                          updateValidation('email', e.target.value);
                        }}
                        onBlur={() => setHasInteracted(prev => ({ ...prev, email: true }))}
                        className={`pl-10 ${hasInteracted.email && !validation.email.isValid ? 'border-red-500' : ''}`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    {hasInteracted.email && !validation.email.isValid && (
                      <p className="text-red-500 text-xs mt-1">{validation.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-role">Account Type</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {(['landlord', 'property_manager', 'tenant'] as const).map((role) => (
                        <label
                          key={role}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            signupData.role === role
                              ? 'border-nook-purple-500 bg-nook-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={signupData.role === role}
                            onChange={(e) => setSignupData(prev => ({ ...prev, role: e.target.value as any }))}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            {getRoleIcon(role)}
                            <div>
                              <div className="font-medium capitalize">
                                {role.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {getRoleDescription(role)}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signupData.password}
                        onChange={(e) => {
                          setSignupData(prev => ({ ...prev, password: e.target.value }));
                          updateValidation('password', e.target.value);
                          // Re-validate confirm password if it exists
                          if (signupData.confirmPassword) {
                            updateValidation('confirmPassword', signupData.confirmPassword, e.target.value);
                          }
                        }}
                        onBlur={() => setHasInteracted(prev => ({ ...prev, password: true }))}
                        className={`pl-10 pr-10 ${hasInteracted.password && !validation.password.isValid ? 'border-red-500' : ''}`}
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {hasInteracted.password && !validation.password.isValid && (
                      <p className="text-red-500 text-xs mt-1">{validation.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={signupData.confirmPassword}
                        onChange={(e) => {
                          setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }));
                          updateValidation('confirmPassword', e.target.value, signupData.password);
                        }}
                        onBlur={() => setHasInteracted(prev => ({ ...prev, confirmPassword: true }))}
                        className={`pl-10 pr-10 ${hasInteracted.confirmPassword && !validation.confirmPassword.isValid ? 'border-red-500' : ''}`}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {hasInteracted.confirmPassword && !validation.confirmPassword.isValid && (
                      <p className="text-red-500 text-xs mt-1">{validation.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isSignupFormValid()}
                    className="w-full bg-nook-purple-600 hover:bg-nook-purple-700 text-white font-medium py-2.5"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-nook-purple-600 hover:text-nook-purple-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-nook-purple-600 hover:text-nook-purple-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

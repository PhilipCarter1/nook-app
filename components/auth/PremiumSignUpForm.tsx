'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Eye, EyeOff, User, Mail, Lock, CheckCircle, Loader2, Building2, Users, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { log } from '@/lib/logger';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'tenant' | 'landlord' | 'admin';
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /\d/ },
  { id: 'special', label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

export default function PremiumSignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant',
  });

  // Clear errors when form data changes
  useEffect(() => {
    if (errors.firstName && formData.firstName) {
      setErrors(prev => ({ ...prev, firstName: undefined }));
    }
    if (errors.lastName && formData.lastName) {
      setErrors(prev => ({ ...prev, lastName: undefined }));
    }
    if (errors.email && formData.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (errors.password && formData.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (errors.confirmPassword && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  }, [formData, errors]);

  // Check password strength
  useEffect(() => {
    const strength: { [key: string]: boolean } = {};
    passwordRequirements.forEach(req => {
      strength[req.id] = req.regex.test(formData.password);
    });
    setPasswordStrength(strength);
  }, [formData.password]);

  const validateField = (field: keyof FormData, value: string): boolean => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
          return false;
        }
        if (value.length < 2) {
          setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 characters' }));
          return false;
        }
        return true;

      case 'lastName':
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
          return false;
        }
        if (value.length < 2) {
          setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 characters' }));
          return false;
        }
        return true;

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          setErrors(prev => ({ ...prev, email: 'Email is required' }));
          return false;
        }
        if (!emailRegex.test(value)) {
          setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
          return false;
        }
        return true;
      }

      case 'password':
        if (!value) {
          setErrors(prev => ({ ...prev, password: 'Password is required' }));
          return false;
        }
        if (value.length < 8) {
          setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
          return false;
        }
        if (!/[A-Z]/.test(value)) {
          setErrors(prev => ({ ...prev, password: 'Password must contain at least one uppercase letter' }));
          return false;
        }
        if (!/[a-z]/.test(value)) {
          setErrors(prev => ({ ...prev, password: 'Password must contain at least one lowercase letter' }));
          return false;
        }
        if (!/\d/.test(value)) {
          setErrors(prev => ({ ...prev, password: 'Password must contain at least one number' }));
          return false;
        }
        return true;

      case 'confirmPassword':
        if (!value) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
          return false;
        }
        if (value !== formData.password) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const validateForm = (): boolean => {
    const validations = [
      validateField('firstName', formData.firstName),
      validateField('lastName', formData.lastName),
      validateField('email', formData.email),
      validateField('password', formData.password),
      validateField('confirmPassword', formData.confirmPassword),
    ];
    return validations.every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
        } else if (signUpError.message.includes('Password should be at least')) {
          setErrors({ general: 'Password does not meet security requirements. Please choose a stronger password.' });
        } else {
          setErrors({ general: 'Failed to create account. Please try again.' });
        }
        log.error('Sign up error:', signUpError);
        return;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`,
              role: formData.role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          log.error('Profile creation error:', profileError);
          setErrors({ general: 'Account created but profile setup failed. Please contact support.' });
          return;
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        
        // Redirect to login page
        router.push('/login?message=Account created successfully! Please check your email to verify your account.');
      }
    } catch (err) {
      log.error('Sign up error:', err as Error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof FormData) => {
    // Clear field-specific error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'landlord':
        return <Building2 className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getPasswordStrengthColor = () => {
    const metRequirements = Object.values(passwordStrength).filter(Boolean).length;
    if (metRequirements <= 2) return 'text-red-500';
    if (metRequirements <= 3) return 'text-yellow-500';
    if (metRequirements <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nook-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 px-4 sm:px-6 lg:px-8"
    >
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-16 h-16 bg-nook-purple-100 dark:bg-nook-purple-900/30 rounded-full flex items-center justify-center mb-4"
          >
            <User className="w-8 h-8 text-nook-purple-600 dark:text-nook-purple-400" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join Nook and start managing your properties
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  First name
                </Label>
                <div className="relative">
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName')}
                    className={`pl-10 pr-4 h-12 transition-all duration-200 ${
                      errors.firstName ? 'border-red-500 focus:border-red-500' : 'focus:border-nook-purple-500'
                    }`}
                    placeholder="Enter first name"
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.firstName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName')}
                    className={`pl-10 pr-4 h-12 transition-all duration-200 ${
                      errors.lastName ? 'border-red-500 focus:border-red-500' : 'focus:border-nook-purple-500'
                    }`}
                    placeholder="Enter last name"
                    disabled={isLoading}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.lastName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email')}
                  className={`pl-10 pr-4 h-12 transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-nook-purple-500'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                I am a
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'tenant' | 'landlord' | 'admin') => handleFieldChange('role')}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant" className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Tenant
                  </SelectItem>
                  <SelectItem value="landlord" className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Landlord
                  </SelectItem>
                  <SelectItem value="admin" className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Administrator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password')}
                  className={`pl-10 pr-12 h-12 transition-all duration-200 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-nook-purple-500'
                  }`}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium mb-2">Password requirements:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className="flex items-center text-sm">
                        {passwordStrength[req.id] ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className={passwordStrength[req.id] ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword')}
                  className={`pl-10 pr-12 h-12 transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-nook-purple-500'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {errors.general}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full h-12 bg-nook-purple-600 hover:bg-nook-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-nook-purple-600 hover:text-nook-purple-700 dark:text-nook-purple-400 dark:hover:text-nook-purple-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 
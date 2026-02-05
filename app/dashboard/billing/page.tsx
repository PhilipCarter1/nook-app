'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Building, Users, Zap, Shield, TrendingUp, Settings, ArrowRight, FileText } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { SUBSCRIPTION_PLANS, getUserSubscription, getUserUsage, canUpgradeToPlan, createCheckoutSession, UserSubscription, BillingUsage } from '@/lib/services/billing';
import { toast } from 'sonner';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<BillingUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const loadUserData = async () => {
    try {
      const [subscriptionResult, usageResult] = await Promise.all([
        getUserSubscription(user!.id),
        getUserUsage(user!.id)
      ]);

      if (subscriptionResult.success) {
        setCurrentSubscription(subscriptionResult.subscription ?? null);
      }

      if (usageResult.success) {
        setUsage(usageResult.usage ?? null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) return;

    setUpgrading(planId);
    try {
      // Check if user can upgrade
      const canUpgrade = await canUpgradeToPlan(user.id, planId);
      
      if (!canUpgrade.success) {
        toast.error(canUpgrade.error || 'Failed to check upgrade eligibility');
        return;
      }

      if (!canUpgrade.canUpgrade) {
        toast.error(canUpgrade.reason || 'Cannot upgrade to this plan');
        return;
      }

      // Create checkout session
      const checkoutResult = await createCheckoutSession(
        planId,
        user.id,
        `${window.location.origin}/dashboard/billing?success=true`,
        `${window.location.origin}/dashboard/billing?canceled=true`
      );

      if (checkoutResult.success && checkoutResult.sessionId) {
        // Redirect to Stripe checkout
        const stripe = await import('@stripe/stripe-js');
        const stripeInstance = await stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (stripeInstance) {
          const { error } = await stripeInstance.redirectToCheckout({
            sessionId: checkoutResult.sessionId,
          });
          
          if (error) {
            console.error('Stripe checkout error:', error);
            toast.error('Failed to redirect to checkout');
          }
        } else {
          toast.error('Stripe not loaded');
        }
      } else {
        toast.error(checkoutResult.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setUpgrading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    return SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.planId);
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-nook-purple-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your subscription and billing</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/settings')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Status */}
        {currentSubscription && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-nook-purple-50 to-purple-100 dark:from-nook-purple-900/20 dark:to-purple-800/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-nook-purple-700 dark:text-nook-purple-300">
                <Crown className="h-5 w-5 mr-2" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-nook-purple-800 dark:text-nook-purple-200">
                    {getCurrentPlan()?.name} Plan
                  </h3>
                  <p className="text-nook-purple-600 dark:text-nook-purple-400">
                    ${getCurrentPlan()?.price}/month
                  </p>
                  <p className="text-sm text-nook-purple-500 dark:text-nook-purple-400 mt-1">
                    Next billing date: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Overview */}
        {usage && (
          <Card className="mb-8 border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                <TrendingUp className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
                Current Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Properties</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.propertiesCount}
                    {getCurrentPlan()?.maxProperties !== -1 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{getCurrentPlan()?.maxProperties}</span>
                    )}
                  </p>
                  {getCurrentPlan()?.maxProperties !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(usage.propertiesCount, getCurrentPlan()?.maxProperties || 0)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.unitsCount}
                    {getCurrentPlan()?.maxUnits !== -1 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{getCurrentPlan()?.maxUnits}</span>
                    )}
                  </p>
                  {getCurrentPlan()?.maxUnits !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(usage.unitsCount, getCurrentPlan()?.maxUnits || 0)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tenants</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usage.tenantsCount}
                    {getCurrentPlan()?.maxTenants !== -1 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{getCurrentPlan()?.maxTenants}</span>
                    )}
                  </p>
                  {getCurrentPlan()?.maxTenants !== -1 && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(usage.tenantsCount, getCurrentPlan()?.maxTenants || 0)}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Documents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{usage.documentsCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {usage.storageUsed}MB / {usage.storageLimit}MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrentPlan = currentSubscription?.planId === plan.id;
              const isUpgrading = upgrading === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`border-0 shadow-lg transition-all duration-300 ${
                    plan.popular 
                      ? 'ring-2 ring-nook-purple-500 scale-105' 
                      : 'hover:shadow-xl'
                  } ${
                    isCurrentPlan 
                      ? 'bg-gradient-to-br from-nook-purple-50 to-purple-100 dark:from-nook-purple-900/20 dark:to-purple-800/20' 
                      : 'bg-white dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-nook-purple-500 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className={`text-xl font-semibold ${
                      isCurrentPlan 
                        ? 'text-nook-purple-800 dark:text-nook-purple-200' 
                        : 'dark:text-white'
                    }`}>
                      {plan.name}
                    </CardTitle>
                    <CardDescription className={`${
                      isCurrentPlan 
                        ? 'text-nook-purple-600 dark:text-nook-purple-400' 
                        : 'dark:text-gray-300'
                    }`}>
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-nook-purple-600 dark:text-nook-purple-400">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${
                            isCurrentPlan 
                              ? 'text-nook-purple-700 dark:text-nook-purple-300' 
                              : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button 
                          className="w-full bg-nook-purple-600 text-white hover:bg-nook-purple-700"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={isUpgrading}
                          className="w-full bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {isUpgrading ? (
                            'Processing...'
                          ) : (
                            <>
                              {currentSubscription ? 'Upgrade' : 'Get Started'}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Features */}
        <Card className="border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
              <Zap className="h-5 w-5 mr-2 text-nook-purple-600 dark:text-nook-purple-400" />
              Platform Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Property Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Manage multiple properties with ease</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Tenant Onboarding</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Streamlined tenant verification process</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Document Management</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Secure document storage and approval</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Analytics & Reporting</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive insights and reporting</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Security & Compliance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Enterprise-grade security standards</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">API Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Integrate with your existing systems</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe,
  Save,
  ArrowLeft,
  Settings,
  Mail,
  Smartphone,
  Eye,
  Moon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  // Update local settings when theme changes
  useEffect(() => {
    if (mounted) {
      setSettings(prev => ({
        ...prev,
        darkMode: theme === 'dark'
      }));
    }
  }, [theme, mounted]);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Signed out successfully!');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-900 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 tracking-tight">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <User className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200">Full Name</Label>
                  <Input id="name" defaultValue="Demo User" className="mt-1 h-11 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</Label>
                  <Input id="email" defaultValue="user@example.com" className="mt-1 h-11 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" className="mt-1 h-11 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <Bell className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    className="data-[state=checked]:bg-nook-purple-600"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                    className="data-[state=checked]:bg-nook-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Marketing Emails</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receive marketing and promotional emails</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => setSettings({...settings, marketingEmails: checked})}
                    className="data-[state=checked]:bg-nook-purple-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <Shield className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600 dark:text-red-300" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                    className="data-[state=checked]:bg-nook-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">Theme</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Choose your preferred theme</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="h-8 px-3 text-xs"
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="h-8 px-3 text-xs"
                    >
                      Dark
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-nook-purple-50 to-purple-50 dark:from-nook-purple-900/20 dark:to-purple-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold text-nook-purple-900 dark:text-nook-purple-100">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Plan</span>
                  <Badge className="bg-gradient-to-r from-nook-purple-600 to-purple-600 text-white">
                    Admin
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Member Since</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Jan 2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <Settings className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Billing & Subscription */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                      <CreditCard className="h-5 w-5 mr-2 text-nook-purple-600" />
                      Billing & Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Manage your subscription plan, billing information, and payment methods.
                      </p>
                      <Button 
                        onClick={() => router.push('/dashboard/billing')}
                        className="w-full h-10 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Manage Billing
                      </Button>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
                      💡 View plans, update payment methods, and manage your subscription
                    </div>
                  </CardContent>
                </Card>
                <Button variant="outline" className="w-full justify-start h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 bg-white dark:bg-gray-700">
                  <Globe className="h-4 w-4 mr-2" />
                  Language & Region
                </Button>
                <Button variant="outline" className="w-full justify-start h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200 bg-white dark:bg-gray-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Sign Out Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <Shield className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              className="w-full h-12 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
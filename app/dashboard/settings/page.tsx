'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Moon,
  Building2,
  Users,
  FileText,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail as MailIcon,
  ExternalLink,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  role: string;
  display_name: string;
  phone_number: string;
  bio: string;
  created_at: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  maintenanceAlerts: boolean;
  paymentReminders: boolean;
  documentUpdates: boolean;
  tenantMessages: boolean;
  systemUpdates: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}



export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme, mounted } = useTheme();
  
  // Set light mode as default if no theme is set
  useEffect(() => {
    if (mounted && !theme) {
      setTheme('light');
    }
  }, [mounted, theme, setTheme]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    maintenanceAlerts: true,
    paymentReminders: true,
    documentUpdates: true,
    tenantMessages: true,
    systemUpdates: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
  });



  const [language, setLanguage] = useState('en');
  const [region, setRegion] = useState('US');
  const [timezone, setTimezone] = useState('America/New_York');
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      if (userProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            display_name: userProfile.display_name,
            phone_number: userProfile.phone_number,
            bio: userProfile.bio,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userProfile.id);

        if (error) throw error;
      }

      // Save settings to localStorage or database
      localStorage.setItem('nook-notification-settings', JSON.stringify(notificationSettings));
      localStorage.setItem('nook-security-settings', JSON.stringify(securitySettings));
      localStorage.setItem('nook-preferences', JSON.stringify({
        language,
        region,
        timezone,
        currency,
        dateFormat,
      }));

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleBilling = () => {
    // Check if billing page exists, if not show a message
    toast.info('Redirecting to billing...');
    setTimeout(() => {
      router.push('/dashboard/billing');
    }, 500);
  };

  const handleLanguageRegion = () => {
    setActiveTab('preferences');
  };

  const handlePrivacySettings = () => {
    setActiveTab('privacy');
  };

  const handleTwoFactorSetup = async () => {
    if (!securitySettings.twoFactorAuth) {
      toast.info('Two-factor authentication setup coming soon!');
      return;
    }
    // Implement 2FA setup logic
  };

  const handleExportData = () => {
          const data = {
        profile: userProfile,
        settings: {
          notifications: notificationSettings,
          security: securitySettings,
          preferences: { language, region, timezone, currency, dateFormat }
        }
      };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nook-settings-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.info('Account deletion feature coming soon!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nook-purple-600 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-900 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-nook-purple-700 dark:text-nook-purple-300 tracking-tight">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account, preferences, and platform settings</p>
            </div>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-1 mb-8 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'preferences', label: 'Preferences', icon: Globe },
            { id: 'privacy', label: 'Privacy', icon: Eye },
            { id: 'billing', label: 'Billing', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-nook-purple-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                    <User className="h-5 w-5 mr-2 text-nook-purple-600" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={userProfile?.display_name || ''} 
                      onChange={(e) => setUserProfile(prev => prev ? {...prev, display_name: e.target.value} : null)}
                      className="mt-1 h-11 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">Email Address</Label>
                    <Input 
                      id="email" 
                      value={userProfile?.id || ''} 
                      disabled 
                      className="mt-1 h-11 border-gray-300 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={userProfile?.phone_number || ''} 
                      onChange={(e) => setUserProfile(prev => prev ? {...prev, phone_number: e.target.value} : null)}
                      placeholder="+1 (555) 123-4567" 
                      className="mt-1 h-11 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-200">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={userProfile?.bio || ''} 
                      onChange={(e) => setUserProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      placeholder="Tell us about yourself..." 
                      rows={3}
                      className="mt-1 border-gray-300 focus:ring-nook-purple-500 focus:border-nook-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" 
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                    <Bell className="h-5 w-5 mr-2 text-nook-purple-600" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-900 dark:text-white">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Receive {key.toLowerCase().replace(/([A-Z])/g, ' $1').toLowerCase()} notifications
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={value}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, [key]: checked}))}
                        className="data-[state=checked]:bg-nook-purple-600"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
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
                    <div className="flex items-center space-x-3">
                      <Switch 
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({...prev, twoFactorAuth: checked}))}
                        className="data-[state=checked]:bg-nook-purple-600"
                      />
                      {securitySettings.twoFactorAuth && (
                        <Button size="sm" onClick={handleTwoFactorSetup}>
                          <Key className="h-4 w-4 mr-2" />
                          Setup
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Session Timeout (minutes)</Label>
                      <Select value={securitySettings.sessionTimeout.toString()} onValueChange={(value) => setSecuritySettings(prev => ({...prev, sessionTimeout: parseInt(value)}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Password Expiry (days)</Label>
                      <Select value={securitySettings.passwordExpiry.toString()} onValueChange={(value) => setSecuritySettings(prev => ({...prev, passwordExpiry: parseInt(value)}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(securitySettings).filter(([key]) => ['loginNotifications', 'suspiciousActivityAlerts'].includes(key)).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div>
                          <Label className="text-sm font-medium text-gray-900 dark:text-white">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {key === 'loginNotifications' ? 'Get notified of new login attempts' : 'Alert on suspicious account activity'}
                          </p>
                        </div>
                        <Switch 
                          checked={value}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({...prev, [key]: checked}))}
                          className="data-[state=checked]:bg-nook-purple-600"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Settings */}
            {activeTab === 'preferences' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                    <Globe className="h-5 w-5 mr-2 text-nook-purple-600" />
                    Regional & Display Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Region</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
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
            )}



            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                    <Eye className="h-5 w-5 mr-2 text-nook-purple-600" />
                    Privacy & Data Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-300 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Data Privacy</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Your data is protected by industry-standard encryption and privacy controls. 
                          We never sell your personal information to third parties.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <Label className="text-sm font-medium text-gray-900 dark:text-white">Data Analytics</Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Allow anonymous usage data to improve the platform</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-nook-purple-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div>
                        <Label className="text-sm font-medium text-gray-900 dark:text-white">Marketing Communications</Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Receive updates about new features and services</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({...prev, marketingEmails: checked}))}
                        className="data-[state=checked]:bg-nook-purple-600"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" onClick={handleExportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/privacy')} className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Privacy Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                    <CreditCard className="h-5 w-5 mr-2 text-nook-purple-600" />
                    Billing & Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                      Manage your subscription plan, billing information, and payment methods.
                    </p>
                    <Button 
                      onClick={handleBilling}
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
            )}
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
                  <span className="text-sm text-gray-600 dark:text-gray-300">Role</span>
                  <Badge className="bg-gradient-to-r from-nook-purple-600 to-purple-600 text-white">
                    {userProfile?.role?.replace('_', ' ').toUpperCase() || 'USER'}
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
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
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
                <Button 
                  onClick={handleBilling}
                  variant="outline" 
                  className="w-full justify-start h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
                <Button 
                  onClick={handleLanguageRegion}
                  variant="outline" 
                  className="w-full justify-start h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Language & Region
                </Button>
                <Button 
                  onClick={handlePrivacySettings}
                  variant="outline" 
                  className="w-full justify-start h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg font-semibold dark:text-white">
                  <Shield className="h-5 w-5 mr-2 text-nook-purple-600" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleExportData}
                  variant="outline"
                  className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  onClick={handleDeleteAccount}
                  variant="outline"
                  className="w-full h-10 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 dark:border-red-500 dark:text-red-100 dark:hover:bg-red-900 dark:hover:border-red-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button 
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-500 dark:text-white dark:hover:bg-gray-600 dark:hover:border-gray-400 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-nook-purple-600 to-purple-600 hover:from-nook-purple-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
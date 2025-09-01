import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertySetupForm from '@/components/onboarding/PropertySetupForm';
import TenantInvitationForm from '@/components/onboarding/TenantInvitationForm';
import { Building2, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandlordOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Nook!</h1>
          <p className="text-gray-600">Let's get your property management setup started</p>
        </div>

        {/* Onboarding Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Onboarding Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Account Created</span>
                <span className="text-sm text-green-600">✓ Complete</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Add Properties</span>
                <span className="text-sm text-blue-600">Next Step</span>
                <ArrowRight className="w-4 h-4 text-blue-600 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-500">Invite Tenants</span>
                <span className="text-sm text-gray-400">Coming Up</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Onboarding Tabs */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tenants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Set Up Your Properties</h2>
              <p className="text-gray-600">
                Add your properties to start managing them on Nook. You can add multiple properties and units.
              </p>
            </div>
            <PropertySetupForm />
          </TabsContent>

          <TabsContent value="tenants" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invite Your Tenants</h2>
              <p className="text-gray-600">
                Once you have properties set up, invite your tenants to join the platform.
              </p>
            </div>
            <TenantInvitationForm />
          </TabsContent>
        </Tabs>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• <strong>Properties:</strong> Add all your properties first, including address, rent, and deposit information.</p>
              <p>• <strong>Tenants:</strong> Invite tenants by email. They'll receive an invitation link to create their account.</p>
              <p>• <strong>Units:</strong> If you have multiple units in a property, you can assign specific units to tenants.</p>
              <p>• <strong>Documents:</strong> Tenants can upload documents like ID, proof of income, and proof of address for approval.</p>
              <p>• <strong>Payments:</strong> Set up payment methods and track rent payments through the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

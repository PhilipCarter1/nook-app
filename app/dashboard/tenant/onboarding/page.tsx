import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, FileText, User, Building2, AlertCircle } from 'lucide-react';

export default function TenantOnboardingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Nook!</h1>
          <p className="text-gray-600">Let's get your tenant profile set up</p>
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
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Complete Profile</span>
                <span className="text-sm text-blue-600">Next Step</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-500">Upload Documents</span>
                <span className="text-sm text-gray-400">Coming Up</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-500">Property Access</span>
                <span className="text-sm text-gray-400">Coming Up</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Onboarding Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Property
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">
                Add your contact information and personal details to complete your profile.
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nook-purple-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nook-purple-500"
                        placeholder="Name and phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nook-purple-500"
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                  
                  <button className="w-full bg-nook-purple-600 text-white py-2 px-4 rounded-md hover:bg-nook-purple-700 transition-colors">
                    Save Profile
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Required Documents</h2>
              <p className="text-gray-600">
                Upload the documents required by your landlord for verification.
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Document Requirements</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Your landlord requires the following documents for verification. 
                          All documents will be securely stored and only accessible to authorized personnel.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Government ID</h4>
                        <p className="text-sm text-gray-600">Driver's license, passport, or state ID</p>
                      </div>
                      <button className="px-4 py-2 bg-nook-purple-600 text-white rounded-md hover:bg-nook-purple-700 transition-colors">
                        Upload
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Proof of Income</h4>
                        <p className="text-sm text-gray-600">Pay stubs, bank statements, or employment letter</p>
                      </div>
                      <button className="px-4 py-2 bg-nook-purple-600 text-white rounded-md hover:bg-nook-purple-700 transition-colors">
                        Upload
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Proof of Address</h4>
                        <p className="text-sm text-gray-600">Utility bill, bank statement, or lease agreement</p>
                      </div>
                      <button className="px-4 py-2 bg-nook-purple-600 text-white rounded-md hover:bg-nook-purple-700 transition-colors">
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="property" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Property Information</h2>
              <p className="text-gray-600">
                View details about your assigned property and unit.
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">Property Details</h4>
                        <p className="text-sm text-gray-600">
                          Your property information will appear here once your landlord completes the setup.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Property Setup in Progress</h3>
                    <p className="text-gray-600">
                      Your landlord is currently setting up your property details. 
                      You'll be able to view your property information, rent amount, and lease details once everything is configured.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• <strong>Profile:</strong> Complete your profile with accurate contact information and emergency contacts.</p>
              <p>• <strong>Documents:</strong> Upload clear, legible copies of required documents for faster approval.</p>
              <p>• <strong>Property:</strong> Your property details will be available once your landlord completes the setup.</p>
              <p>• <strong>Communication:</strong> Use the platform to communicate with your landlord about maintenance, payments, and other concerns.</p>
              <p>• <strong>Payments:</strong> Set up your payment method to pay rent through the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { UserRole } from '@/lib/types';
import { Building2, FileText, Wrench, CreditCard, Shield, Users } from 'lucide-react';

const features = [
  {
    title: 'Property Management',
    description: 'Easily manage multiple properties, units, and tenants from a single dashboard.',
    icon: Building2,
    benefits: [
      'Centralized property information',
      'Unit tracking and management',
      'Occupancy monitoring',
      'Property performance analytics'
    ]
  },
  {
    title: 'Document Management',
    description: 'Securely store and manage all your property-related documents in one place.',
    icon: FileText,
    benefits: [
      'Digital lease agreements',
      'Maintenance records',
      'Property inspections',
      'Compliance documentation'
    ]
  },
  {
    title: 'Maintenance Requests',
    description: 'Streamline maintenance requests and track their progress in real-time.',
    icon: Wrench,
    benefits: [
      'Online request submission',
      'Priority-based scheduling',
      'Vendor management',
      'Maintenance history tracking'
    ]
  },
  {
    title: 'Payment Processing',
    description: 'Secure and automated payment processing for rent and other fees.',
    icon: CreditCard,
    benefits: [
      'Online rent payments',
      'Automated late fees',
      'Payment history',
      'Multiple payment methods'
    ]
  },
  {
    title: 'Legal Compliance',
    description: 'Stay compliant with local and federal regulations with our built-in compliance tools.',
    icon: Shield,
    benefits: [
      'Lease compliance checking',
      'Regulatory updates',
      'Document verification',
      'Legal requirement tracking'
    ]
  },
  {
    title: 'Tenant Portal',
    description: 'Provide tenants with a user-friendly portal for all their needs.',
    icon: Users,
    benefits: [
      'Online rent payments',
      'Maintenance requests',
      'Document access',
      'Communication tools'
    ]
  }
];

export default function FeaturesPage() {
  const { role } = useAuth();
  const mappedRole = role === 'builder_super' ? 'landlord' : (role || 'tenant');

  return (
    <MainLayout userRole={mappedRole}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Platform Features</h1>
          <p className="text-xl text-muted-foreground">
            Discover how Nook can streamline your property management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <feature.icon className="h-8 w-8 text-nook-purple-500" />
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-nook-purple-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 
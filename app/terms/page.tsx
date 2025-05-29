import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { UserRole } from '@/lib/types';

export default function TermsOfService() {
  const { role } = useAuth();
  const mappedRole = role === 'builder_super' ? 'landlord' : (role || 'tenant');

  return (
    <MainLayout userRole={mappedRole}>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Nook's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Nook provides property management software and services, including but not limited to:
            </p>
            <ul>
              <li>Tenant management</li>
              <li>Property management</li>
              <li>Payment processing</li>
              <li>Maintenance request handling</li>
              <li>Document management</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              To use our services, you must:
            </p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2>4. Payment Terms</h2>
            <p>
              By using our payment services, you agree to:
            </p>
            <ul>
              <li>Pay all fees and charges on time</li>
              <li>Provide valid payment information</li>
              <li>Authorize us to charge your payment method</li>
              <li>Comply with all applicable payment laws and regulations</li>
            </ul>

            <h2>5. Prohibited Activities</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Use the service for any illegal purposes</li>
            </ul>

            <h2>6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              Nook shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify you of any material changes via email or through the service.
            </p>

            <h2>9. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@rentwithnook.com
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 
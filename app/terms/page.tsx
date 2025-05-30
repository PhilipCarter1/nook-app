'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function TermsOfService() {
  const { role } = useAuth();
  const mappedRole = role === 'builder_super' ? 'landlord' : (role || 'tenant');

  return (
    <MainLayout userRole={mappedRole}>
      <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
        <div className="container mx-auto px-4 py-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Terms of Service
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    By accessing and using Nook's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                  </p>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nook provides property management software and services, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Tenant management</li>
                    <li>Property management</li>
                    <li>Payment processing</li>
                    <li>Maintenance request handling</li>
                    <li>Document management</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    3. User Accounts
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    To use our services, you must:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Be at least 18 years old</li>
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account</li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    4. Payment Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    By using our payment services, you agree to:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Pay all fees and charges on time</li>
                    <li>Provide valid payment information</li>
                    <li>Authorize us to charge your payment method</li>
                    <li>Comply with all applicable payment laws and regulations</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    5. Prohibited Activities
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Violate any laws or regulations</li>
                    <li>Infringe on others' intellectual property rights</li>
                    <li>Interfere with the proper functioning of the service</li>
                    <li>Attempt to gain unauthorized access</li>
                    <li>Use the service for any illegal purposes</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    6. Termination
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We reserve the right to terminate or suspend your account at any time for violations of these terms or for any other reason at our sole discretion.
                  </p>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    7. Limitation of Liability
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nook shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                  </p>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    8. Changes to Terms
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We reserve the right to modify these terms at any time. We will notify you of any material changes via email or through the service.
                  </p>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    9. Contact Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    For questions about these Terms of Service, please contact us at:
                    <br />
                    <a href="mailto:legal@rentwithnook.com" className="text-nook-purple-600 hover:text-nook-purple-500">
                      legal@rentwithnook.com
                    </a>
                  </p>
                </MotionDiv>
              </CardContent>
            </Card>
          </MotionDiv>
        </div>
      </div>
    </MainLayout>
  );
} 
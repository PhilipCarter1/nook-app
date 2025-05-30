'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function PrivacyPolicy() {
  const { role } = useAuth();

  // Map the role to the correct type for MainLayout
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
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    1. Information We Collect
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Name and contact information</li>
                    <li>Account credentials</li>
                    <li>Property information</li>
                    <li>Payment information</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Provide and maintain our services</li>
                    <li>Process your transactions</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Communicate with you about products, services, and events</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    3. Information Sharing
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We do not sell or rent your personal information to third parties. We may share your information with:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Service providers who assist in our operations</li>
                    <li>Professional advisors</li>
                    <li>Law enforcement when required by law</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    4. Data Security
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    5. Your Rights
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">You have the right to:</p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                  </ul>
                </MotionDiv>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                    6. Contact Us
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    If you have any questions about this Privacy Policy, please contact us at:
                    <br />
                    <a href="mailto:privacy@rentwithnook.com" className="text-nook-purple-600 hover:text-nook-purple-500">
                      privacy@rentwithnook.com
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
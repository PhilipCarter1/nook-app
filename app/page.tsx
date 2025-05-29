'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/FeatureCard';
import { LegalAssistantBadge } from '@/components/LegalAssistantBadge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Building2,
  FileText,
  CreditCard,
  MessageSquare,
  Shield,
  BarChart3,
} from 'lucide-react';

const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionDiv = motion.div;

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nook-purple-50 dark:from-gray-900 dark:to-nook-purple-900">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <LegalAssistantBadge className="mb-6" />
              <MotionH1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl"
              >
                Modern Property Management
                <br />
                <span className="text-nook-purple-500">Made Simple</span>
              </MotionH1>
              <MotionP
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300"
              >
                Streamline your property management with Nook's all-in-one platform.
                From tenant onboarding to maintenance requests, we've got you
                covered.
              </MotionP>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Get Started
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  Log In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to manage properties
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Powerful features to streamline your property management workflow
              </p>
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Property Management"
                description="Manage multiple properties, units, and tenants from a single dashboard."
                icon={<Building2 className="h-6 w-6" />}
              />
              <FeatureCard
                title="Document Management"
                description="Upload, track, and manage all your property documents securely."
                icon={<FileText className="h-6 w-6" />}
              />
              <FeatureCard
                title="Payment Processing"
                description="Accept rent payments through multiple methods with automatic tracking."
                icon={<CreditCard className="h-6 w-6" />}
              />
              <FeatureCard
                title="Maintenance Requests"
                description="Streamline maintenance requests and track their progress."
                icon={<MessageSquare className="h-6 w-6" />}
              />
              <FeatureCard
                title="Legal Assistant"
                description="AI-powered lease review and compliance checking."
                icon={<Shield className="h-6 w-6" />}
                isBeta
              />
              <FeatureCard
                title="Analytics Dashboard"
                description="Track property performance and financial metrics."
                icon={<BarChart3 className="h-6 w-6" />}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 
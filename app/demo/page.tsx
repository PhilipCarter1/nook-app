'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CreditCard, FileText, MessageSquare, BarChart3, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const demoFeatures = [
  {
    title: 'Property Dashboard',
    description: 'Real-time overview of all your properties with key metrics and insights',
    icon: Building2,
    status: 'Live Demo',
    color: 'bg-blue-500',
  },
  {
    title: 'Tenant Management',
    description: 'Comprehensive tenant portal with payment history and maintenance requests',
    icon: Users,
    status: 'Live Demo',
    color: 'bg-green-500',
  },
  {
    title: 'Payment Processing',
    description: 'Secure online payments with automated reconciliation and reporting',
    icon: CreditCard,
    status: 'Live Demo',
    color: 'bg-purple-500',
  },
  {
    title: 'Document Management',
    description: 'AI-powered document review and automated compliance checking',
    icon: FileText,
    status: 'Live Demo',
    color: 'bg-orange-500',
  },
  {
    title: 'Maintenance Hub',
    description: 'Zendesk-style ticket system with priority management and vendor coordination',
    icon: MessageSquare,
    status: 'Live Demo',
    color: 'bg-red-500',
  },
  {
    title: 'Analytics & Reporting',
    description: 'Comprehensive reporting suite with customizable dashboards and insights',
    icon: BarChart3,
    status: 'Live Demo',
    color: 'bg-indigo-500',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Property Manager',
    company: 'Urban Properties',
    content: 'Nook has transformed how we manage our 50+ properties. The automation features save us hours every week.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Landlord',
    company: 'Chen Real Estate',
    content: 'The tenant portal is fantastic. My tenants love being able to pay rent and submit maintenance requests online.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Property Owner',
    company: 'Rodriguez Holdings',
    content: 'The document management system is a game-changer. Everything is organized and compliant automatically.',
    rating: 5,
  },
];

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <Badge variant="secondary" className="mb-4">
                  🚀 Interactive Demo
                </Badge>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                See Nook in{' '}
                <span className="text-nook-purple-600">Action</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Experience the power of modern property management with our interactive demo. See how Nook can streamline your operations and improve tenant satisfaction.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="bg-nook-purple-600 hover:bg-nook-purple-500">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <div className="w-full max-w-4xl h-80 lg:h-96 rounded-2xl bg-gradient-to-br from-nook-purple-500 to-nook-purple-700 shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Shield className="mx-auto h-16 w-16 mb-6 opacity-90" />
                    <h3 className="text-3xl font-bold mb-4">Interactive Demo</h3>
                    <p className="text-xl opacity-90">Experience the full platform</p>
                    <div className="mt-6 flex justify-center space-x-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <Building2 className="h-8 w-8" />
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <Users className="h-8 w-8" />
                      </div>
                      <div className="bg-white/20 rounded-lg p-3">
                        <CreditCard className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Demo Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-nook-purple-600">Platform Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to see
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Explore our key features with interactive demos and real-world examples.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {demoFeatures.map((feature) => (
                <Card key={feature.title} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                        <feature.icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Try Demo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-nook-purple-600">Customer Success</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Loved by property managers everywhere
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.name} className="bg-white">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Join thousands of property managers who trust Nook for their property management needs.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/signup">
                  <Button size="lg" className="bg-nook-purple-600 hover:bg-nook-purple-500">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
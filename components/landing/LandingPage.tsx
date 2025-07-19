import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Shield, FileText, CreditCard, MessageSquare } from 'lucide-react';

const features = [
  {
    name: 'Smart Legal Assistant',
    description: 'AI-powered document review and agreement generation',
    icon: FileText,
  },
  {
    name: 'Secure Payments',
    description: 'Split rent and deposit payments with Stripe integration',
    icon: CreditCard,
  },
  {
    name: 'Maintenance Hub',
    description: 'Zendesk-style ticket system with upvotes and comments',
    icon: MessageSquare,
  },
  {
    name: 'Role-Based Access',
    description: 'Tailored dashboards for tenants, landlords, and builders',
    icon: Shield,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <a href="#" className="inline-flex space-x-6">
                <span className="rounded-full bg-nook-purple-500/10 px-3 py-1 text-sm font-semibold leading-6 text-nook-purple-600 ring-1 ring-inset ring-nook-purple-500/20">
                  What's new
                </span>
                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                  <span>Just shipped v1.0</span>
                  <ArrowRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </a>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Modern Property Management Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your property management with Nook's all-in-one platform. From document management to maintenance requests, we've got you covered.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-md bg-nook-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nook-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nook-purple-600"
              >
                Get started
              </Link>
              <Link href="/demo" className="text-sm font-semibold leading-6 text-gray-900">
                View demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="w-[76rem] h-[40rem] rounded-md bg-gradient-to-br from-nook-purple-500 to-nook-purple-700 shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">Nook Dashboard</h3>
                  <p className="text-lg opacity-90">Modern Property Management Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-nook-purple-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A complete property management solution
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Nook combines powerful features with an intuitive interface to make property management a breeze.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.name}
              href="/features"
              className="group relative rounded-lg border p-6 hover:border-nook-purple-500 transition-colors"
            >
              <div className="flex items-center gap-4">
                <feature.icon className="h-8 w-8 text-nook-purple-500" />
                <h3 className="text-lg font-semibold">{feature.name}</h3>
              </div>
              <p className="mt-4 text-muted-foreground">{feature.description}</p>
              <div className="mt-4 flex items-center text-nook-purple-500">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
          <div
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end">
          <div
            className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to transform your property management?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Join thousands of property owners and managers who trust Nook for their property management needs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-md bg-nook-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nook-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nook-purple-600"
            >
              Get started
            </Link>
            <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-500">
              Contact Us
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2024 Nook, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
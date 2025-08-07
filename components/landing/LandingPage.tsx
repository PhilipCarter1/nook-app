import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Shield, FileText, CreditCard, MessageSquare, Building2, Users, BarChart3 } from 'lucide-react';

const features = [
  {
    name: 'Smart Legal Assistant',
    description: 'AI-powered document review and agreement generation with automated compliance checks',
    icon: FileText,
    color: 'text-blue-600',
  },
  {
    name: 'Secure Payments',
    description: 'Split rent and deposit payments with Stripe integration and automated reconciliation',
    icon: CreditCard,
    color: 'text-green-600',
  },
  {
    name: 'Maintenance Hub',
    description: 'Zendesk-style ticket system with upvotes, comments, and priority management',
    icon: MessageSquare,
    color: 'text-orange-600',
  },
  {
    name: 'Role-Based Access',
    description: 'Tailored dashboards for tenants, landlords, and property managers',
    icon: Shield,
    color: 'text-purple-600',
  },
  {
    name: 'Property Analytics',
    description: 'Comprehensive reporting and insights for portfolio performance',
    icon: BarChart3,
    color: 'text-indigo-600',
  },
  {
    name: 'Tenant Management',
    description: 'Streamlined onboarding, communication, and tenant lifecycle management',
    icon: Users,
    color: 'text-pink-600',
  },
];

const stats = [
  { label: 'Properties Managed', value: '10,000+' },
  { label: 'Happy Tenants', value: '25,000+' },
  { label: 'Cities Served', value: '150+' },
  { label: 'Uptime', value: '99.9%' },
];

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero section - Reduced padding and more compact */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-nook-purple-50 via-white to-nook-purple-50">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 sm:pb-24 lg:flex lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-16 sm:mt-20 lg:mt-8"
            >
              <div className="inline-flex items-center rounded-full bg-nook-purple-500/10 px-3 py-1 text-sm font-semibold leading-6 text-nook-purple-600 ring-1 ring-inset ring-nook-purple-500/20">
                <span className="mr-2">✨</span>
                Just shipped v2.0 - Enhanced Analytics & AI Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
            >
              Modern Property Management{' '}
              <span className="text-nook-purple-600">Made Simple</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 text-lg leading-8 text-gray-600"
            >
              Streamline your property management with Nook's all-in-one platform. From document management to maintenance requests, we've got you covered with enterprise-grade features.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex items-center gap-x-6"
            >
              <Link
                href="/signup"
                className="rounded-lg bg-nook-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-nook-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nook-purple-600 transition-all duration-200 hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link 
                href="/demo" 
                className="text-base font-semibold leading-6 text-gray-900 hover:text-nook-purple-600 transition-colors duration-200"
              >
                View Demo <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-12 flex max-w-2xl sm:mt-16 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32"
          >
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative w-full max-w-5xl h-80 lg:h-[450px] rounded-2xl bg-gradient-to-br from-nook-purple-500 via-nook-purple-600 to-nook-purple-700 shadow-2xl ring-1 ring-white/10 overflow-hidden">
                {/* Dashboard mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative h-full flex items-center justify-center p-8">
                  <div className="text-center text-white">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-90" />
                    <h3 className="text-2xl font-bold mb-3">Nook Dashboard</h3>
                    <p className="text-lg opacity-90 mb-4">Modern Property Management Platform</p>
                    <div className="flex justify-center space-x-3">
                      <div className="bg-white/20 rounded-lg p-2">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats section - More compact */}
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-y-8">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-nook-purple-600 sm:text-3xl">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature section - More compact spacing */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl lg:text-center"
          >
            <h2 className="text-base font-semibold leading-7 text-nook-purple-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A complete property management solution
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Nook combines powerful features with an intuitive interface to make property management a breeze.
            </p>
          </motion.div>
          
          <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href="/features"
                    className="group relative rounded-xl border border-gray-200 bg-white p-6 hover:border-nook-purple-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-nook-purple-50 transition-colors duration-200`}>
                        <feature.icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-3 text-sm">{feature.description}</p>
                    <div className="flex items-center text-nook-purple-600 font-medium text-sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section - More compact */}
      <div className="relative isolate mt-24 px-6 py-24 sm:mt-32 sm:py-32 lg:px-8">
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
          <div
            className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-nook-purple-400 to-nook-purple-600"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to transform your property management?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Join thousands of property owners and managers who trust Nook for their property management needs.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-lg bg-nook-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-nook-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nook-purple-600 transition-all duration-200 hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="text-base font-semibold leading-6 text-gray-900 hover:text-nook-purple-600 transition-colors duration-200"
            >
              Contact sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer - More compact */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-8 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="/privacy" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
              Contact Us
            </Link>
          </div>
          <div className="mt-6 md:order-1 md:mt-0">
            <p className="text-center text-sm leading-5 text-gray-400">
              &copy; 2024 Nook, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
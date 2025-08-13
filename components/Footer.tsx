import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nook
            </h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Modern property management platform for landlords and tenants.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-nook-purple-700 dark:text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-nook-purple-700 dark:text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="/features" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/integrations" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-nook-purple-700 dark:text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/docs" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/status" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Status
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-nook-purple-700 dark:text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-sm text-gray-600 hover:text-nook-purple-700 dark:text-gray-300 dark:hover:text-white">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2024 Nook. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 sm:mt-0">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
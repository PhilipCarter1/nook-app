import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { validateEnvironmentVariables } from '@/lib/env';

const inter = Inter({ subsets: ['latin'] });

// Validate critical environment variables at startup
validateEnvironmentVariables();

export const metadata: Metadata = {
  title: 'Nook - Modern Property Management',
  description:
    'Streamline your property management with Nook. From tenant onboarding to maintenance requests, we have got you covered.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 
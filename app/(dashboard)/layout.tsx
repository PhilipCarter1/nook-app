'use client';

import React from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';
import { DashboardContent } from './DashboardContent';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
} 
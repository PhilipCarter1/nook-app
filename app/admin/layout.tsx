'use client';

import React from 'react';
import { AuthProvider } from '@/components/providers/auth-provider';
import { AdminContent } from './AdminContent';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminContent>{children}</AdminContent>
    </AuthProvider>
  );
} 
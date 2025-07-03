import React from 'react';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Welcome to Nook</h1>
            <p className="mt-2 text-muted-foreground">
              The all-in-one property management platform
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
} 
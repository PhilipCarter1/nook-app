'use client';

import { Navbar } from '@/components/Navbar';
import LandingPage from '@/components/landing/LandingPage';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LandingPage />
    </div>
  );
} 
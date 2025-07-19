'use client';

import LandingPage from '@/components/landing/LandingPage';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="pt-16">
        <LandingPage />
      </div>
    </>
  );
} 
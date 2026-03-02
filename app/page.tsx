'use client';

import { useEffect, useState } from 'react';
import AOS from 'aos';
import { Toaster } from 'sonner';
import { Bird } from 'lucide-react';
import { Hero } from '@/components/landing/hero';
import { Ratings } from '@/components/landing/ratings';
import { RoosterPreview } from '@/components/landing/rooster-preview';
import { Footer } from '@/components/landing/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      delay: 0,
      disable: 'mobile', // Disable on mobile and use CSS animation instead
      startEvent: 'DOMContentLoaded',
      offset: 50,
      mirror: false,
    });
  }, []);

  return (
    <div className="min-h-screen bg-emrald-800">
      <Hero />
      <RoosterPreview />
      <Ratings />
      <Footer />

      <Button
        asChild
        className="fixed bottom-6 right-6 z-40 h-14 w-14 bg-[#3d6c58] text-white shadow-lg hover:bg-[#4e816b] rounded-none"
        aria-label="View Roosters"
      >
        <Link href="/roosters">
          <Bird className="h-6 w-6" />
        </Link>
      </Button>
      <Toaster />
    </div>
  );
}

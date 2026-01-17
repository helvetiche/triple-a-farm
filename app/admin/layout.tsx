'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedProgressBar } from "@/components/enhanced-progress-bar"
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're definitely not loading and there's no user
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Don't show loading screen for navigation - only redirect if not authenticated
  if (!user && !loading) {
    return null; // Will redirect to login
  }

  // Show children immediately if user is authenticated, even if still loading
  // This prevents the annoying full-page loading on navigation
  return (
    <>
      <Suspense fallback={null}>
        <EnhancedProgressBar />
      </Suspense>
      {children}
    </>
  )
}

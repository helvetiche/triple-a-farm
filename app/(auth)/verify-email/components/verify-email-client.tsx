'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const oobCode = urlParams.get('oobCode');

        if (mode === 'verifyEmail' && oobCode) {
          const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ oobCode }),
          });

          const result = await response.json();

          if (!response.ok || !result?.success) {
            throw new Error(
              result?.error?.message || 'Failed to verify email.'
            );
          }

          toast.success('Email verified successfully! You can now login.');
          router.push('/login');
          return;
        }

        toast.error('Invalid or expired verification link.');
        router.push('/login');
        
      } catch (error: any) {
        console.error('Email verification error:', error);
        toast.error(error.message || 'An error occurred during verification.');
        router.push('/login');
      }
    };

    handleEmailVerification();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#3d6c58]" />
        <p className="text-sm text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
}

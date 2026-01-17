'use client';

import { Suspense } from 'react';
import { VerifyEmailClient } from './components/verify-email-client';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3d6c58] border-t-transparent"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  );
}

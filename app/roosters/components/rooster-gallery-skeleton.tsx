'use client';

import { Spinner } from '@/components/ui/spinner';

export function RoosterGallerySkeleton() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-gray-400" />
      </div>
      
      {/* Footer Skeleton */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

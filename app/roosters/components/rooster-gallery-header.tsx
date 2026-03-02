'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RoosterStats } from '@/app/roosters/types';

interface RoosterGalleryHeaderProps {
  stats: RoosterStats;
}

export function RoosterGalleryHeader({ stats }: RoosterGalleryHeaderProps) {
  return (
    <div className="border-b border-[#3d6c58]/20 bg-[#3d6c58] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10 p-2"
              aria-label="Back to Home"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-white mb-1">Rooster Gallery</h1>
            <p className="text-xs sm:text-sm text-white/80">
              Premium Gamefowl Collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

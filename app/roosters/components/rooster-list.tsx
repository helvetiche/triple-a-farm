'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoosterDetailModal } from './rooster-detail-modal';
import type { Rooster } from '@/app/admin/data/roosters';

interface RoosterListProps {
  roosters: Rooster[];
}

export function RoosterList({ roosters }: RoosterListProps) {
  const [selectedRooster, setSelectedRooster] = useState<Rooster | null>(null);

  const openModal = (rooster: Rooster) => {
    setSelectedRooster(rooster);
  };

  const closeModal = () => {
    setSelectedRooster(null);
  };

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        {roosters.map((rooster, index) => (
          <div
            key={rooster.id}
            className="border border-gray-200 bg-white hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={() => openModal(rooster)}
          >
            {/* Mobile Compact Layout */}
            <div className="sm:hidden flex items-center gap-3 p-3">
              {/* Mobile Image - Compact */}
              <div className="relative w-20 h-20 bg-gray-50 overflow-hidden flex-shrink-0 rounded-lg">
                <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-200 hover:opacity-100 bg-black/40 flex items-center justify-center rounded-lg">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
                <Image
                  src={
                    rooster.image ||
                    rooster.images?.[0] ||
                    '/images/roosters/rooster-sample.jpg'
                  }
                  alt={`${rooster.breed} - ${rooster.id}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="80px"
                />
              </div>

              {/* Mobile Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-sm truncate mb-1">
                      {rooster.breed}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">ID: {rooster.id}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded ${
                      rooster.status === 'Available' ? 'bg-green-100 text-green-800' :
                      rooster.status === 'Sold' ? 'bg-gray-100 text-gray-800' :
                      rooster.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                      rooster.status === 'Quarantine' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rooster.status}
                    </span>
                    <div className="font-semibold text-gray-900 text-sm">
                      ₱{rooster.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{rooster.age}</span>
                  <span className="text-gray-400">•</span>
                  <span>{rooster.weight}</span>
                </div>
              </div>
            </div>

            {/* Tablet+ Layout - Original Design */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-4">
              <div className="relative w-full h-48 sm:w-32 sm:h-32 bg-gray-50 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-200 hover:opacity-100 bg-black/40 flex items-center justify-center">
                  <ZoomIn className="h-5 w-5 text-white" />
                </div>
                <Image
                  src={
                    rooster.image ||
                    rooster.images?.[0] ||
                    '/images/roosters/rooster-sample.jpg'
                  }
                  alt={`${rooster.breed} - ${rooster.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 128px"
                />
              </div>

              <div className="flex-1 min-w-0 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 text-base sm:text-lg truncate mb-1">
                      {rooster.breed}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 font-mono mb-2">ID: {rooster.id}</div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-0">
                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                      rooster.status === 'Available' ? 'bg-green-100 text-green-800' :
                      rooster.status === 'Sold' ? 'bg-gray-100 text-gray-800' :
                      rooster.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                      rooster.status === 'Quarantine' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {rooster.status}
                    </span>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      ₱{rooster.price}
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <div className="flex gap-4">
                      <span className="font-medium">Age:</span>
                      <span>{rooster.age}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="font-medium">Weight:</span>
                      <span>{rooster.weight}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RoosterDetailModal
        rooster={selectedRooster}
        onClose={closeModal}
      />
    </>
  );
}

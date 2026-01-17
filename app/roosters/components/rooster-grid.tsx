'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoosterDetailModal } from './rooster-detail-modal';
import type { Rooster } from '@/app/admin/data/roosters';

interface RoosterGridProps {
  roosters: Rooster[];
}

export function RoosterGrid({ roosters }: RoosterGridProps) {
  const [selectedRooster, setSelectedRooster] = useState<Rooster | null>(null);

  const openModal = (rooster: Rooster) => {
    setSelectedRooster(rooster);
  };

  const closeModal = () => {
    setSelectedRooster(null);
  };

  return (
    <>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {roosters.map((rooster, index) => (
          <div
            key={rooster.id}
            className="group border border-gray-200 bg-white hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={() => openModal(rooster)}
          >
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-black/40 flex items-center justify-center">
                <ZoomIn className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                  rooster.status === 'Available' ? 'bg-green-100 text-green-800' :
                  rooster.status === 'Sold' ? 'bg-gray-100 text-gray-800' :
                  rooster.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                  rooster.status === 'Quarantine' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {rooster.status}
                </span>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {rooster.breed}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">ID: {rooster.id}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <span className="text-xs">{rooster.age}</span>
                    <span className="text-gray-400 mx-1 sm:mx-2">•</span>
                    <span className="text-xs">{rooster.weight}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    ₱{rooster.price}
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

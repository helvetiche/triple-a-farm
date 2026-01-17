'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Calendar, Weight, Heart, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Rooster } from '@/app/admin/data/roosters';

interface RoosterDetailModalProps {
  rooster: Rooster | null;
  onClose: () => void;
}

export function RoosterDetailModal({ rooster, onClose }: RoosterDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!rooster) return null;

  const images = rooster.images && rooster.images.length > 0 
    ? rooster.images 
    : [rooster.image || '/images/roosters/rooster-sample.jpg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white shadow-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        <div className="grid md:grid-cols-2 gap-0 max-h-[90vh] overflow-y-auto">
          {/* Image Gallery Section */}
          <div className="relative bg-gray-100 min-h-[300px] md:min-h-[500px]">
            <div className="relative w-full h-full aspect-square md:aspect-auto">
              <Image
                src={images[currentImageIndex]}
                alt={`${rooster.breed} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white shadow-lg transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white shadow-lg transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-12 h-12 overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {rooster.breed}
              </h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500 font-mono">ID: {rooster.id}</p>
                <span className={`inline-block text-xs font-medium px-3 py-1 ${
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

            {/* Price */}
            <div className="bg-[#3d6c58]/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Price</span>
                <span className="text-3xl font-bold text-[#3d6c58]">₱{rooster.price}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Age</span>
                </div>
                <p className="text-gray-900 font-medium">{rooster.age}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Weight className="w-4 h-4" />
                  <span>Weight</span>
                </div>
                <p className="text-gray-900 font-medium">{rooster.weight}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Heart className="w-4 h-4" />
                  <span>Health</span>
                </div>
                <p className="text-gray-900 font-medium capitalize">{rooster.health}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Date Added</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {new Date(rooster.dateAdded).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Owner Info (if sold) */}
            {rooster.owner && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>Owner</span>
                </div>
                <p className="text-gray-900 font-medium">{rooster.owner}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
         
              <Button 
                variant="outline" 
                className="w-full border-[#3d6c58] text-[#3d6c58] hover:bg-[#3d6c58]/10"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

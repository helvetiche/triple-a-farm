'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { Bird, Search, ZoomIn } from 'lucide-react';
import dynamic from 'next/dynamic';

import Zoom from 'yet-another-react-lightbox/plugins/zoom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { type Rooster } from '@/app/admin/data/roosters';
import { useLightbox } from '@/hooks/use-lightbox';

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });

interface RoosterGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatusColor(status: Rooster['status']) {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-800';
    case 'Sold':
      return 'bg-gray-100 text-gray-800';
    case 'Reserved':
      return 'bg-yellow-100 text-yellow-800';
    case 'Quarantine':
      return 'bg-orange-100 text-orange-800';
    case 'Deceased':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function RoosterGalleryDialog({ open, onOpenChange }: RoosterGalleryDialogProps) {
  const [query, setQuery] = useState('');
  const [roosters, setRoosters] = useState<Rooster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      const fetchRoosters = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/public/roosters');
          const result = await response.json();
          if (result.success) {
            setRoosters(result.data || []);
          }
        } catch (error) {
          console.error('Error fetching roosters:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoosters();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roosters;
    return roosters.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.breed.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    });
  }, [query, roosters]);

  const slides = useMemo(
    () =>
      filtered.map((rooster) => ({
        src: rooster.image || rooster.images?.[0] || '/images/roosters/rooster-sample.jpg',
        alt: `${rooster.breed} - ${rooster.id}`,
      })),
    [filtered]
  );

  const lightbox = useLightbox(slides);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] w-[1200px] p-0 border border-white/30 shadow-xl"
        onEscapeKeyDown={(e) => {
          if (lightbox.open) {
            e.preventDefault();
            lightbox.close();
          }
        }}
        onInteractOutside={(e) => {
          if (lightbox.open) {
            e.preventDefault();
            lightbox.close();
          }
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[#1f3f2c] flex items-center gap-2">
                <Bird className="h-5 w-5 text-[#3d6c58]" />
                Rooster Gallery
              </DialogTitle>
              <DialogDescription className="text-[#4a6741]">
                Browse the roosters list
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a6741]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, name, breed, status, location..."
                className="pl-9 border-[#3d6c58]/20 bg-white/60 focus-visible:ring-[#3d6c58] rounded-none"
              />
            </div>
            <div className="text-sm text-[#4a6741] whitespace-nowrap">
              {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="max-h-[70vh] overflow-auto pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((rooster, index) => (
                <Card
                  key={rooster.id}
                  className="border border-[#3d6c58]/40 bg-white/40 shadow-sm rounded-none"
                >
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="group relative aspect-square bg-white/40 overflow-hidden">
                      <div className="absolute inset-0 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          aria-label={`Preview ${rooster.breed} ${rooster.id}`}
                          className="absolute inset-0 flex items-center justify-center bg-[#3d6c58]/70 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            lightbox.openAt(index);
                          }}
                        >
                          <ZoomIn className="h-8 w-8 text-white" />
                        </button>
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
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className={getStatusColor(rooster.status)}>
                          {rooster.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1f3f2c] truncate">
                            {rooster.name} ({rooster.breed})
                          </div>
                          <div className="text-xs text-[#4a6741]">ID: {rooster.id}</div>
                        </div>
                        <div className="font-bold text-[#3d6c58] whitespace-nowrap">₱{rooster.price}</div>
                      </div>
                    </div>

                    {rooster.status === 'Available' && (
                      <div className="mt-auto pt-3">
                        <Button
                          type="button"
                          size="sm"
                          className="w-full bg-[#3d6c58] hover:bg-[#4e816b] text-white rounded-none"
                          onClick={() => {
                            // frontend-only placeholder
                            console.log('Reserve rooster:', rooster.id)
                          }}
                        >
                          Reserve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="py-12 text-center text-[#4a6741]">
                No roosters match your search.
              </div>
            )}
          </div>
        </div>

        <Lightbox
          open={lightbox.open}
          slides={lightbox.slides}
          index={lightbox.index}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true, closeOnPullDown: false, closeOnPullUp: false }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Rooster } from '@/app/admin/data/roosters';

export function RoosterPreview() {
  const [roosters, setRoosters] = useState<Rooster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoosters = async () => {
      try {
        const response = await fetch('/api/public/roosters');
        const result = await response.json();
        if (result.success) {
          // Get only available roosters and limit to 4
          const availableRoosters = (result.data || [])
            .filter((r: Rooster) => r.status === 'Available')
            .slice(0, 4);
          setRoosters(availableRoosters);
        }
      } catch (error) {
        console.error('Error fetching roosters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoosters();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#3d6c58] mb-4">
              Mga Piling Manok
            </h2>
            <p className="text-gray-600 text-lg">
              Tingnan ang aming premium na koleksyon ng mga panlaban na manok
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-none h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (roosters.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white" data-aos="fade-up">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d6c58] mb-4">
            Mga Piling Manok
          </h2>
          <p className="text-gray-600 text-lg">
            Tingnan ang aming premium na koleksyon ng mga panlaban na manok
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roosters.map((rooster) => (
            <div
              key={rooster.id}
              className="bg-white border-2 border-[#3d6c58] rounded-none overflow-hidden hover:shadow-xl transition-shadow duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="relative h-64 bg-gray-100">
                <Image
                  src={
                    rooster.image ||
                    rooster.images?.[0] ||
                    '/images/roosters/rooster-sample.jpg'
                  }
                  alt={`${rooster.breed} - ${rooster.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#3d6c58] flex items-center justify-center p-1">
                    <Image
                      src="/images/logo-white-png.png"
                      alt="Triple A Gamefarm"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Triple A Gamefarm</span>
                </div>
                <h3 className="text-xl font-bold text-[#3d6c58] mb-2">
                  {rooster.breed}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>ID: {rooster.id}</p>
                  <p>Age: {rooster.age} months</p>
                  <p>Weight: {rooster.weight} kg</p>
                  <p className="text-lg font-bold text-[#3d6c58]">
                    ₱{parseFloat(rooster.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {rooster.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Health: {rooster.health}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-[#3d6c58] hover:bg-[#4e816b] text-white rounded-none px-8 py-6 text-lg"
          >
            <Link href="/roosters" className="flex items-center gap-2">
              Tingnan ang Iba Pa
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

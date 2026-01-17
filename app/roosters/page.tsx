'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import {
  RoosterGalleryHeader,
  AdvancedFilters,
  RoosterGrid,
  RoosterList,
  RoosterGallerySkeleton,
  RoosterGalleryFooter,
} from './components';
import type { Rooster } from '@/app/admin/data/roosters';
import type { RoosterStats } from '@/app/roosters/types';

const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });

export default function RoosterGalleryPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('breed');
  const [roosters, setRoosters] = useState<Rooster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Advanced filter states
  const [activeFilters, setActiveFilters] = useState({
    status: 'all',
    breed: 'all',
    health: 'all',
    priceRange: 'all',
    ageRange: 'all',
    weightRange: 'all',
  });

  useEffect(() => {
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
  }, []);

  const filteredAndSorted = useMemo(() => {
    let filtered = roosters.filter((r) => {
      // Search filter
      const matchesQuery = !query.trim() || 
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.breed.toLowerCase().includes(query.toLowerCase());
      
      // Status filter
      const matchesStatus = activeFilters.status === 'all' || r.status === activeFilters.status;
      
      // Breed filter
      const matchesBreed = activeFilters.breed === 'all' || r.breedId === activeFilters.breed;
      
      // Health filter
      const matchesHealth = activeFilters.health === 'all' || r.health === activeFilters.health;
      
      // Price range filter
      let matchesPrice = true;
      if (activeFilters.priceRange !== 'all') {
        const price = parseFloat(r.price || '0');
        switch (activeFilters.priceRange) {
          case '0-10000':
            matchesPrice = price <= 10000;
            break;
          case '10000-15000':
            matchesPrice = price > 10000 && price <= 15000;
            break;
          case '15000-20000':
            matchesPrice = price > 15000 && price <= 20000;
            break;
          case '20000+':
            matchesPrice = price > 20000;
            break;
        }
      }
      
      // Age range filter
      let matchesAge = true;
      if (activeFilters.ageRange !== 'all') {
        const ageMonths = parseInt(r.age) || 0;
        switch (activeFilters.ageRange) {
          case '0-12':
            matchesAge = ageMonths <= 12;
            break;
          case '12-18':
            matchesAge = ageMonths > 12 && ageMonths <= 18;
            break;
          case '18-24':
            matchesAge = ageMonths > 18 && ageMonths <= 24;
            break;
          case '24+':
            matchesAge = ageMonths > 24;
            break;
        }
      }
      
      // Weight range filter
      let matchesWeight = true;
      if (activeFilters.weightRange !== 'all') {
        const weight = parseFloat(r.weight) || 0;
        switch (activeFilters.weightRange) {
          case '0-2':
            matchesWeight = weight <= 2;
            break;
          case '2-2.5':
            matchesWeight = weight > 2 && weight <= 2.5;
            break;
          case '2.5-3':
            matchesWeight = weight > 2.5 && weight <= 3;
            break;
          case '3+':
            matchesWeight = weight > 3;
            break;
        }
      }
      
      return matchesQuery && matchesStatus && matchesBreed && matchesHealth && matchesPrice && matchesAge && matchesWeight;
    });

    // Sort roosters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'breed':
          return a.breed.localeCompare(b.breed);
        case 'breed-desc':
          return b.breed.localeCompare(a.breed);
        case 'price-low':
          return parseFloat(a.price || '0') - parseFloat(b.price || '0');
        case 'price-high':
          return parseFloat(b.price || '0') - parseFloat(a.price || '0');
        case 'date-newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'date-oldest':
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case 'age-youngest':
          return parseInt(a.age) - parseInt(b.age);
        case 'age-oldest':
          return parseInt(b.age) - parseInt(a.age);
        case 'weight-lightest':
          return parseFloat(a.weight) - parseFloat(b.weight);
        case 'weight-heaviest':
          return parseFloat(b.weight) - parseFloat(b.weight);
        default:
          return a.breed.localeCompare(b.breed);
      }
    });

    return filtered;
  }, [roosters, query, activeFilters, sortBy]);

  const stats = useMemo((): RoosterStats => {
    const total = roosters.length;
    const available = roosters.filter(r => r.status === 'Available').length;
    const sold = roosters.filter(r => r.status === 'Sold').length;
    const reserved = roosters.filter(r => r.status === 'Reserved').length;
    
    return { total, available, sold, reserved };
  }, [roosters]);

  if (isLoading) {
    return <RoosterGallerySkeleton />;
  }

  return (
    <div className="min-h-screen  flex flex-col">
      {/* Header */}
      <RoosterGalleryHeader stats={stats} />
      
      {/* Main Content */}
      <div className="flex-1">
        {/* Advanced Filters */}
        <AdvancedFilters
          query={query}
          statusFilter={statusFilter}
          sortBy={sortBy}
          filteredCount={filteredAndSorted.length}
          totalCount={roosters.length}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
          onSortByChange={setSortBy}
        />

        {/* Gallery - Grid on desktop, List on mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          {filteredAndSorted.length === 0 ? (
            <div className="py-12 sm:py-20 text-center">
              <div className="text-gray-500 text-base sm:text-lg mb-2">No roosters found</div>
              <div className="text-gray-400 text-sm">
                Try adjusting your search or filters
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: List View */}
              <div className="sm:hidden">
                <RoosterList roosters={filteredAndSorted} />
              </div>
              
              {/* Desktop: Grid View */}
              <div className="hidden sm:block">
                <RoosterGrid roosters={filteredAndSorted} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer - Always at bottom */}
      <RoosterGalleryFooter />
    </div>
  );
}

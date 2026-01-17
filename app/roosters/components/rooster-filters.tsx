'use client';

import { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RoosterGalleryProps } from '@/app/roosters/types';

interface RoosterFiltersProps extends Omit<RoosterGalleryProps, 'roosters' | 'isLoading' | 'viewMode' | 'onViewModeChange'> {
  filteredCount: number;
  totalCount: number;
}

// Available breeds from our database
const AVAILABLE_BREEDS = [
  { breedId: 'BR001', name: 'Lemon' },
  { breedId: 'BR002', name: 'Golden Boy' },
  { breedId: 'BR003', name: 'Sweater' },
];

// Health status options
const HEALTH_STATUS = [
  { value: 'all', label: 'All Health' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

// Price range options
const PRICE_RANGES = [
  { value: 'all', label: 'All Prices' },
  { value: '0-10000', label: 'Under ₱10,000' },
  { value: '10000-15000', label: '₱10,000 - ₱15,000' },
  { value: '15000-20000', label: '₱15,000 - ₱20,000' },
  { value: '20000+', label: 'Over ₱20,000' },
];

export function RoosterFilters({
  query,
  statusFilter,
  sortBy,
  filteredCount,
  totalCount,
  onQueryChange,
  onStatusFilterChange,
  onSortByChange,
}: RoosterFiltersProps) {
  const [breedFilter, setBreedFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  // Pass filter changes to parent (you'll need to update the parent component to handle these)
  const handleBreedFilterChange = (value: string) => {
    setBreedFilter(value);
    // TODO: Pass this to parent component
  };

  const handleHealthFilterChange = (value: string) => {
    setHealthFilter(value);
    // TODO: Pass this to parent component
  };

  const handlePriceFilterChange = (value: string) => {
    setPriceFilter(value);
    // TODO: Pass this to parent component
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by breed, ID..."
            className="pl-10 h-10 border-gray-300 bg-white focus-visible:ring-gray-900 text-sm"
          />
        </div>

        {/* Filter Row - These are FILTERS (what to show) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Breed Filter */}
          <Select value={breedFilter} onValueChange={handleBreedFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 bg-white text-sm">
              <SelectValue placeholder="All Breeds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Breeds</SelectItem>
              {AVAILABLE_BREEDS.map((breed) => (
                <SelectItem key={breed.breedId} value={breed.breedId}>
                  {breed.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 bg-white text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Quarantine">Quarantine</SelectItem>
              <SelectItem value="Deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>

          {/* Health Filter */}
          <Select value={healthFilter} onValueChange={handleHealthFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 bg-white text-sm">
              <SelectValue placeholder="All Health" />
            </SelectTrigger>
            <SelectContent>
              {HEALTH_STATUS.map((health) => (
                <SelectItem key={health.value} value={health.value}>
                  {health.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Filter */}
          <Select value={priceFilter} onValueChange={handlePriceFilterChange}>
            <SelectTrigger className="h-10 border-gray-300 bg-white text-sm">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort and Results Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Sort Dropdown - This is SORTING (how to order) */}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full sm:w-40 h-10 border-gray-300 bg-white text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breed">Breed (A-Z)</SelectItem>
              <SelectItem value="breed-desc">Breed (Z-A)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="date-newest">Date (Newest First)</SelectItem>
              <SelectItem value="date-oldest">Date (Oldest First)</SelectItem>
              <SelectItem value="age-youngest">Age (Youngest First)</SelectItem>
              <SelectItem value="age-oldest">Age (Oldest First)</SelectItem>
              <SelectItem value="weight-lightest">Weight (Lightest First)</SelectItem>
              <SelectItem value="weight-heaviest">Weight (Heaviest First)</SelectItem>
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
            <span className="font-medium text-gray-900">{totalCount}</span> roosters
          </div>
        </div>

        {/* Active Filters Display */}
        {(breedFilter !== 'all' || healthFilter !== 'all' || priceFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {breedFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                {AVAILABLE_BREEDS.find(b => b.breedId === breedFilter)?.name || breedFilter}
              </span>
            )}
            {healthFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                {HEALTH_STATUS.find(h => h.value === healthFilter)?.label || healthFilter}
              </span>
            )}
            {priceFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {PRICE_RANGES.find(p => p.value === priceFilter)?.label || priceFilter}
              </span>
            )}
          </div>
        )}

        {/* Search Info */}
        {query && (
          <div className="text-sm text-gray-500">
            Search: <span className="font-medium text-gray-700">"{query}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

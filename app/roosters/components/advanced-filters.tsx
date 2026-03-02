'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import type { RoosterGalleryProps } from '@/app/roosters/types';

interface AdvancedFiltersProps extends Omit<RoosterGalleryProps, 'roosters' | 'isLoading' | 'viewMode' | 'onViewModeChange'> {
  filteredCount: number;
  totalCount: number;
  activeFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Available breeds from our database
const AVAILABLE_BREEDS = [
  { breedId: 'BR001', name: 'Lemon' },
  { breedId: 'BR002', name: 'Golden Boy' },
  { breedId: 'BR003', name: 'Sweater' },
];

// Define the filter state type
type FilterState = {
  status: string;
  breed: string;
  health: string;
  priceRange: string;
  ageRange: string;
  weightRange: string;
};

// Filter options
const FILTER_OPTIONS = {
  status: {
    label: 'Status',
    options: [
      { value: 'all', label: 'All Status', color: 'gray' },
      { value: 'Available', label: 'Available', color: 'green' },
      { value: 'Sold', label: 'Sold', color: 'gray' },
      { value: 'Reserved', label: 'Reserved', color: 'yellow' },
      { value: 'Quarantine', label: 'Quarantine', color: 'orange' },
      { value: 'Deceased', label: 'Deceased', color: 'red' },
    ]
  },
  breed: {
    label: 'Breed',
    options: [
      { value: 'all', label: 'All Breeds', color: 'gray' },
      ...AVAILABLE_BREEDS.map(breed => ({ value: breed.breedId, label: breed.name, color: 'blue' }))
    ]
  },
  health: {
    label: 'Health',
    options: [
      { value: 'all', label: 'All Health', color: 'gray' },
      { value: 'excellent', label: 'Excellent', color: 'emerald' },
      { value: 'good', label: 'Good', color: 'blue' },
      { value: 'fair', label: 'Fair', color: 'yellow' },
      { value: 'poor', label: 'Poor', color: 'red' },
    ]
  },
  priceRange: {
    label: 'Price Range',
    options: [
      { value: 'all', label: 'All Prices', color: 'gray' },
      { value: '0-10000', label: 'Under ₱10,000', color: 'green' },
      { value: '10000-15000', label: '₱10,000 - ₱15,000', color: 'blue' },
      { value: '15000-20000', label: '₱15,000 - ₱20,000', color: 'purple' },
      { value: '20000+', label: 'Over ₱20,000', color: 'red' },
    ]
  },
  ageRange: {
    label: 'Age Range',
    options: [
      { value: 'all', label: 'All Ages', color: 'gray' },
      { value: '0-12', label: 'Under 1 year', color: 'green' },
      { value: '12-18', label: '1-1.5 years', color: 'blue' },
      { value: '18-24', label: '1.5-2 years', color: 'purple' },
      { value: '24+', label: 'Over 2 years', color: 'red' },
    ]
  },
  weightRange: {
    label: 'Weight Range',
    options: [
      { value: 'all', label: 'All Weights', color: 'gray' },
      { value: '0-2', label: 'Under 2kg', color: 'green' },
      { value: '2-2.5', label: '2-2.5kg', color: 'blue' },
      { value: '2.5-3', label: '2.5-3kg', color: 'purple' },
      { value: '3+', label: 'Over 3kg', color: 'red' },
    ]
  }
};

// Sort options
const SORT_OPTIONS = [
  { value: 'breed', label: 'Breed (A-Z)' },
  { value: 'breed-desc', label: 'Breed (Z-A)' },
  { value: 'price-low', label: 'Price (Low to High)' },
  { value: 'price-high', label: 'Price (High to Low)' },
  { value: 'date-newest', label: 'Date (Newest First)' },
  { value: 'date-oldest', label: 'Date (Oldest First)' },
  { value: 'age-youngest', label: 'Age (Youngest First)' },
  { value: 'age-oldest', label: 'Age (Oldest First)' },
  { value: 'weight-lightest', label: 'Weight (Lightest First)' },
  { value: 'weight-heaviest', label: 'Weight (Heaviest First)' },
];

export function AdvancedFilters({
  query,
  statusFilter,
  sortBy,
  filteredCount,
  totalCount,
  activeFilters,
  onFiltersChange,
  onQueryChange,
  onStatusFilterChange,
  onSortByChange,
}: AdvancedFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Count active filters (excluding 'all' values)
  const activeFilterCount = Object.values(activeFilters).filter(value => value !== 'all').length;

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value
    };
    onFiltersChange(newFilters);
    
    // Also update the status filter for backward compatibility
    if (filterType === 'status') {
      onStatusFilterChange(value);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      status: 'all',
      breed: 'all',
      health: 'all',
      priceRange: 'all',
      ageRange: 'all',
      weightRange: 'all',
    };
    onFiltersChange(clearedFilters);
    onStatusFilterChange('all');
  };

  const getFilterColor = (filterType: string, value: string) => {
    const option = FILTER_OPTIONS[filterType as keyof typeof FILTER_OPTIONS]?.options.find(opt => opt.value === value);
    return option?.color || 'gray';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="flex flex-col gap-4">
        {/* Search and Quick Actions Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by breed, ID..."
              className="pl-10 h-10 border-gray-300 bg-white focus-visible:ring-gray-900 text-sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="h-10 border-gray-300 bg-white text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filters Toggle */}
            <div className="relative">
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 border-gray-300 bg-white text-sm flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                    {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="absolute top-full left-0 right-0 z-50 mt-1 w-96">
                  <div className="border border-gray-200 rounded-lg bg-white shadow-lg p-4 max-h-96 overflow-y-auto">
                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(FILTER_OPTIONS).map(([filterType, filterConfig]) => (
                        <div key={filterType} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            {filterConfig.label}
                          </label>
                          <Select 
                            value={activeFilters[filterType as keyof typeof activeFilters]} 
                            onValueChange={(value) => handleFilterChange(filterType, value)}
                          >
                            <SelectTrigger className="h-9 border-gray-200 text-sm">
                              <SelectValue placeholder={`All ${filterConfig.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {filterConfig.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        {activeFilterCount > 0 && (
                          <span>{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Results Count and Active Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
            <span className="font-medium text-gray-900">{totalCount}</span> roosters
          </div>
          
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active:</span>
              {Object.entries(activeFilters).map(([filterType, value]) => {
                if (value === 'all') return null;
                const filterConfig = FILTER_OPTIONS[filterType as keyof typeof FILTER_OPTIONS];
                const option = filterConfig?.options.find(opt => opt.value === value);
                return (
                  <Badge 
                    key={filterType}
                    variant="secondary" 
                    className={`bg-${option?.color}-100 text-${option?.color}-800 border-${option?.color}-200`}
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterChange(filterType, 'all')}
                      className="ml-1 hover:bg-${option?.color}-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

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

import type { Rooster } from '@/app/admin/data/roosters';

export interface RoosterStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
}

export interface RoosterGalleryProps {
  roosters: Rooster[];
  isLoading: boolean;
  query: string;
  statusFilter: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

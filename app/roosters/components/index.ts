/**
 * Re-exports all rooster gallery components for cleaner imports
 * 
 * This file centralizes all component exports from the rooster gallery components directory,
 * allowing for clean and organized imports in other parts of the application.
 * 
 * @example
 * ```tsx
 * import { RoosterGalleryHeader, RoosterFilters, RoosterGrid } from '@/app/roosters/components'
 * ```
 */

// Header component with back button and statistics
export { RoosterGalleryHeader } from "./rooster-gallery-header"

// Filters and search component
export { RoosterFilters } from "./rooster-filters"
export { AdvancedFilters } from "./advanced-filters"

// Grid view component for rooster display
export { RoosterGrid } from "./rooster-grid"

// List view component for rooster display
export { RoosterList } from "./rooster-list"

// Loading skeleton component
export { RoosterGallerySkeleton } from "./rooster-gallery-skeleton"

// Footer component
export { RoosterGalleryFooter } from "./rooster-gallery-footer"

// Shared lightbox component
export { SharedLightbox } from "./shared-lightbox"

// Rooster detail modal component
export { RoosterDetailModal } from "./rooster-detail-modal"

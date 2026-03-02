# Rooster Management Frontend

## Overview
Frontend implementation for the rooster inventory management system with CRUD operations, search/filter functionality, and responsive design.

## File Structure

```
app/dashboard/roosters/
├── page.tsx                     # Main inventory page with table/card views
├── add/page.tsx                 # Add new rooster form
├── edit/page.tsx                 # Edit existing rooster form
├── components/
│   ├── rooster-page-header.tsx  # Page header with title and add button
│   ├── rooster-stats-cards.tsx  # Statistics cards (total, available, sold)
│   ├── rooster-filters.tsx      # Search bar and filter controls
│   ├── rooster-table.tsx        # Table view with action dropdowns
│   ├── rooster-cards.tsx        # Card grid view with images
│   ├── view-toggle.tsx          # Switch between table/card views
│   ├── rooster-view-dialog.tsx  # Modal for viewing rooster details
│   ├── confirm-dialog.tsx       # Delete confirmation dialog
│   ├── empty-states.tsx         # No data and no search results
│   └── skeleton-loading.tsx     # Loading skeletons for all components
├── utils/
│   ├── toast.ts                 # Toast notification utilities
│   └── use-rooster-settings.ts  # View preference persistence
└── mock-data.ts                 # Sample data and TypeScript interfaces
```

## Data Interface

```typescript
interface Rooster {
  id: string                    // Unique identifier (e.g., "TR-001")
  breed: string                 // Rooster breed
  age: string                   // Age in months
  weight: string                // Weight in kg
  status: "Available" | "Sold" | "Quarantine" | "Deceased"
  price: string                 // Selling price
  image?: string                // Optional image URL
  description?: string          // Optional description
  health?: string               // Health status
  location?: string             // Current location
}
```

## Components

### Main Pages
- **Main Page**: Table/card toggle, search, view/delete actions, stats dashboard
- **Add Page**: Complete form with date pickers, image upload placeholder
- **Edit Page**: Pre-populated form, delete functionality, save changes

### Key Features
- **View Modes**: Toggle between table and card layouts (localStorage persisted)
- **Search**: Real-time filtering across ID, breed, and status
- **Actions**: View details dialog, edit navigation, delete with confirmation
- **Toast Notifications**: Success/error messages for CRUD operations
- **Loading States**: Skeleton loaders for all components
- **Empty States**: No data and no search results displays

### UI Components
- **Date Picker**: Custom styled, non-rounded design
- **Dialogs**: View details and delete confirmation
- **Stats Cards**: Display inventory metrics
- **Responsive**: Mobile-first design with sidebar layout

## Current Implementation

### Data Source
- Uses `mock-data.ts` with sample rooster data
- All images reference `/images/roosters/rooster-sample.jpg`
- Simulated CRUD operations with console logging

### Toast System
- Success messages for add/edit/delete operations
- Error handling ready for API integration
- Styled with brand colors and non-rounded design

### Form Handling
- Controlled components with state management
- Date picker integration for arrival/health check dates
- Basic validation with HTML5 inputs

## Styling

### Design System
- **Primary Color**: #156844 (dark green)
- **Secondary**: #4e816b (light green)
- **Non-rounded**: All components use sharp corners
- **Framework**: Tailwind CSS with shadcn/ui components

### Toast Styling
- White background with colored borders
- Brand green for success, red for errors, blue for info
- Sharp corners, custom icon colors

## State Management

### Local State
- Search value and filters
- View mode preference (localStorage)
- Dialog open/close states
- Form data for add/edit operations

### Persistence
- User view preference saved to localStorage
- Settings key: `triple-a-rooster-settings`

## Integration Points

### Current Mock Functions
```typescript
// Main page actions
handleViewDetails(id)  // Opens view dialog
handleEdit(id)        // Navigates to /dashboard/roosters/edit/:id
handleDelete(id)      // Shows confirmation, then success toast

// Form actions
handleSave()          // Shows success toast
```

### Toast Utilities
```typescript
toastCRUD.roosterAdded(name)      // Success message
toastCRUD.roosterUpdated(name)    // Success message  
toastCRUD.roosterDeleted(name)    // Success message
toastCRUD.deleteError(entity, error)  // Error handling
```

## Images

### Current Setup
- Single sample image: `/images/roosters/rooster-sample.jpg`
- Next.js Image component for optimization
- Aspect ratio: Square (1:1) for consistency

### Image Components
- Table: Small thumbnails in first column
- Cards: Large hero images
- View Dialog: Full-size display

## Responsive Design

### Breakpoints
- **Mobile**: Stacked layout, full-width cards
- **Tablet**: Side-by-side stats, responsive table
- **Desktop**: Full sidebar, optimal grid layouts

### Navigation
- Sidebar navigation with active state
- Breadcrumb trail for current page
- Mobile-friendly hamburger menu

---

## Notes for Backend Integration

The frontend is fully functional with mock data and ready for API integration. All components are modular and use TypeScript interfaces for type safety.

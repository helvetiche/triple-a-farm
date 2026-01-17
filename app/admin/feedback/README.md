# Feedback & Ratings Management Frontend

## Overview
Frontend implementation for displaying and managing customer feedback and ratings for Triple A Gamefarm. Features a table-based view of customer reviews with filtering, status management, and basic interaction capabilities.

## File Structure

```
app/admin/feedback/
├── page.tsx                     # Main feedback page with reviews table
└── README.md                    # This documentation
```

## Data Interface

Based on the actual implementation, the feedback data structure includes:

```typescript
interface CustomerReview {
  id: string                    // Review ID (e.g., "REV-001")
  date: string                  // Review date
  customer: string              // Customer name
  rating: number                // Star rating (1-5)
  rooster: string               // Associated rooster info
  comment: string               // Customer feedback text
  status: "published" | "hidden" | "flagged"  // Review status
}
```

## Components

### Main Page Structure
The feedback page (`page.tsx`) contains:

- **Reviews Table**: Displays all customer reviews with columns for:
  - Date
  - Customer name
  - Star rating (visual display)
  - Rooster information
  - Comment preview
  - Status badge
  - Actions dropdown

- **Filtering System**: 
  - Search functionality
  - Status filtering (published/hidden/flagged)
  - Date range filtering

- **Actions Menu**: For each review:
  - View full details
  - Edit status
  - Show/hide review
  - Flag inappropriate content

### Key Features
- **Star Rating Display**: Visual 5-star rating system
- **Status Management**: Toggle between published, hidden, and flagged states
- **Search & Filter**: Real-time filtering by customer name and status
- **Responsive Table**: Mobile-friendly table layout
- **Toast Notifications**: Success/error messages for actions

## Current Implementation

### Data Source
- Uses mock data with sample customer reviews
- All reviews reference specific rooster transactions
- Pre-defined customer names and realistic feedback comments

### UI Components Used
- **Table Components**: Standard shadcn/ui table structure
- **Dialog Components**: For viewing full review details
- **Badge Components**: Status indicators
- **Dropdown Menus**: Action menus for each review
- **Input Components**: Search and filter controls

### Interactions
- **View Details**: Opens dialog with full review information
- **Status Toggle**: Changes review visibility with toast confirmation
- **Search**: Real-time filtering across customer names
- **Filter by Status**: Dropdown to show specific review statuses

## Styling

### Design System
- **Primary Color**: #3d6c58 (medium green)
- **Secondary**: #1f3f2c (dark green)
- **Status Colors**: 
  - Green for published
  - Yellow for hidden
  - Red for flagged
- **Non-rounded**: Sharp corners matching brand aesthetic
- **Framework**: Tailwind CSS with shadcn/ui components

### Table Styling
- Consistent row styling with hover states
- Color-coded status badges
- Star rating display with filled/unfilled stars
- Responsive design with horizontal scroll on mobile

## State Management

### Local State
- Reviews list with mock data
- Search query for filtering
- Status filter selection
- Selected review for detail view
- Dialog open/close states

### Filter Logic
- Real-time search by customer name
- Status-based filtering
- Combined filter application
- Reset functionality

## Integration Points

### Current Mock Functions
Based on the actual code structure:
```typescript
// Review management
handleViewReview(reviewId)       // Opens review detail dialog
handleToggleStatus(reviewId)     // Changes review status
handleFlagReview(reviewId)       // Flags inappropriate content
handleSearch(query)              // Filters reviews by search term
handleStatusFilter(status)       // Filters by review status
```

### Toast System
```typescript
// Success messages
toast.success('Review status updated')
toast.success('Review flagged successfully')

// Error handling
toast.error('Failed to update review')
```

## Responsive Design

### Breakpoints
- **Mobile**: Stacked layout with horizontal table scroll
- **Tablet**: Optimized table width
- **Desktop**: Full table with all columns visible

### Mobile Adaptations
- Horizontal scrolling for table content
- Simplified action menus
- Touch-friendly row heights

---

## Notes for Backend Integration

The frontend is implemented with mock data and ready for API integration.

### Required API Endpoints
- `GET /api/feedback/reviews` - Fetch all reviews with filtering
- `PUT /api/feedback/reviews/{id}/status` - Update review status
- `POST /api/feedback/reviews/{id}/flag` - Flag inappropriate content
- `GET /api/feedback/reviews/{id}` - Get single review details

### Data Requirements
- Reviews should link to actual rooster transactions
- Customer information should come from user system
- Status changes should be logged for audit trail
- Search should support customer name and content filtering

### Current Mock Data Structure
The system uses sample reviews like:
```javascript
{
  id: "REV-001",
  date: "2024-11-20", 
  customer: "Juan Dela Cruz",
  rating: 5,
  rooster: "Sweater - TR-002",
  comment: "Excellent quality rooster! Very healthy and strong.",
  status: "published"
}
```

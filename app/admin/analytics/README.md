# Analytics & Reports Frontend

## Overview
Frontend implementation for the analytics and reporting system with interactive charts, data visualization, and comprehensive business insights for Triple A Gamefarm operations.

## File Structure

```
app/admin/analytics/
├── page.tsx                     # Main analytics dashboard
├── components/
│   ├── index.ts                 # Component exports
│   ├── date-range-selector.tsx  # Date filtering component
│   ├── skeleton-loading.tsx     # Loading skeletons
│   └── charts/
│       ├── area-chart.tsx       # Area/trend charts
│       ├── bar-chart.tsx        # Bar charts for comparisons
│       ├── pie-chart.tsx        # Pie charts for distributions
│       ├── radar-chart.tsx      # Radar charts for multi-dimensional data
│       ├── radial-chart.tsx     # Radial/gauge charts
│       ├── customer-ratings-chart.tsx  # Rating analysis
│       └── test-horizontal-bar.tsx     # Horizontal bar charts
└── data/
    └── mock-data.ts             # Sample analytics data and interfaces
```

## Data Interface

Based on the actual implementation in `mock-data.ts`:

```typescript
interface AnalyticsStats {
  totalRevenue: number
  totalSales: number
  averageSale: number
  topBreed: string
  monthlyGrowth: number
  yearlyGrowth: number
  totalCustomers: number
  activeRoosters: number
}

interface MonthlyData {
  month: string
  revenue: number
  sales: number
  profit: number
  customers: number
}

interface BreedData {
  breed: string
  sales: number
  revenue: number
  percentage: number
}

interface HealthMetrics {
  date: string
  overallHealth: number
  vaccinationCoverage: number
  diseaseIncidence: number
  mortalityRate: number
  averageWeight: number
}

interface CustomerRating {
  date: string
  rating: number
  customerId: string
  transactionId: string
}

interface DateRange {
  startDate: Date
  endDate: Date
}
```

## Components

### Main Dashboard Structure
The analytics page (`page.tsx`) contains:

- **Overview Cards**: Key metrics with trend indicators
- **Revenue Charts**: Monthly revenue trends and growth analysis
- **Sales Analytics**: Transaction data and breed performance
- **Customer Insights**: Satisfaction ratings and customer metrics
- **Health Metrics**: Rooster health and vaccination tracking
- **Date Range Selector**: Flexible date filtering with presets

### Chart Components

#### Area Chart (`area-chart.tsx`)
- Displays trend data over time
- Supports multiple data series
- Customizable colors and height
- Responsive design with Recharts

#### Bar Chart (`bar-chart.tsx`)
- Comparative data visualization
- Horizontal and vertical orientations
- Multiple data series support
- Custom tooltips and legends

#### Pie Chart (`pie-chart.tsx`)
- Distribution and percentage breakdowns
- Custom color schemes
- Interactive legends
- Accessibility support

#### Radar Chart (`radar-chart.tsx`)
- Multi-dimensional performance metrics
- Multiple data series comparison
- Custom axis configuration
- Responsive sizing

#### Radial Chart (`radial-chart.tsx`)
- Progress and completion indicators
- Gauge-style visualization
- Custom value ranges
- Animated transitions

#### Customer Ratings Chart (`customer-ratings-chart.tsx`)
- Rating distribution analysis
- Trend visualization over time
- Customer satisfaction metrics
- Filterable by date range

### Key Features
- **Date Range Filtering**: Preset options (7 days, 30 days, 3 months, 6 months, custom)
- **Interactive Charts**: Clickable legends, tooltips, and hover states
- **Real-time Updates**: Dynamic data refresh based on date selection
- **Responsive Design**: Mobile-optimized chart layouts
- **Loading States**: Skeleton loaders for all chart areas

## Current Implementation

### Data Source
- Uses `mock-data.ts` with comprehensive sample analytics
- Simulated API calls with loading states
- Real-time data simulation for demo purposes
- Date-based data filtering and aggregation

### Chart Library
- Built with Recharts for React integration
- Custom styling with brand colors (#3d6c58, #1f3f2c)
- Responsive and interactive features
- Accessibility support with ARIA labels

### Date Range System
- Component: `date-range-selector.tsx`
- Preset options with quick selection
- Custom date picker with range selection
- Automatic data refresh on range change
- URL parameter persistence for sharing

## Styling

### Design System
- **Primary Color**: #3d6c58 (medium green)
- **Secondary**: #1f3f2c (dark green)
- **Chart Colors**: Consistent color palette across all charts
- **Non-rounded**: All components use sharp corners
- **Framework**: Tailwind CSS with shadcn/ui components

### Chart Styling
- Custom tooltips with branded styling
- Consistent axis formatting and labels
- Animated transitions for data changes
- High contrast for accessibility
- Custom legend styling

## State Management

### Local State
- Selected date range (DateRange object)
- Chart data and loading states
- Filter preferences and chart interactions
- Error states for data fetching

### Data Flow
- Date range changes trigger data refresh
- Loading states during data fetching
- Error handling for failed requests
- Optimistic updates for better UX

## Integration Points

### Current Mock Functions
Based on the actual implementation:
```typescript
// Data fetching and filtering
handleDateRangeChange(range)     // Updates analytics data for date range
handleRefresh()                  // Refreshes all chart data
handleExport(format)             // Downloads report data (mock)

// Chart interactions
handleChartClick(data)           // Handles chart element clicks
handleLegendToggle(series)       // Shows/hides chart series
```

### Component Exports
```typescript
// From components/index.ts
export { DateRangeSelector } from "./date-range-selector"
export { 
  AreaChart, 
  BarChart, 
  PieChart, 
  RadarChart, 
  RadialChart 
} from "./charts"
export { SkeletonLoading } from "./skeleton-loading"
```

## Analytics Features

### Revenue Analysis
- Monthly revenue trends with area charts
- Year-over-year growth comparisons
- Revenue by breed with pie charts
- Average order value tracking

### Sales Metrics
- Transaction volume analysis with bar charts
- Sales by breed distribution
- Peak sales period identification
- Conversion rate tracking

### Customer Analytics
- Customer satisfaction trends with rating charts
- Customer acquisition and retention
- Purchase behavior analysis
- Demographic insights

### Health & Operations
- Rooster health metrics with radar charts
- Vaccination coverage tracking
- Disease incidence monitoring
- Weight and growth trends

## Responsive Design

### Breakpoints
- **Mobile**: Stacked charts, simplified metrics, horizontal scroll
- **Tablet**: Side-by-side layout, responsive chart sizing
- **Desktop**: Full dashboard, optimal chart dimensions

### Chart Responsiveness
- Automatic resizing on viewport changes
- Touch-friendly interactions on mobile
- Simplified legends on small screens
- Horizontal scroll for wide charts when needed

## Performance

### Optimization
- Lazy loading for chart components
- Debounced data refresh on filter changes
- Efficient data aggregation in mock functions
- Memoized chart calculations

### Loading States
- Skeleton loaders for all chart areas (`skeleton-loading.tsx`)
- Progressive data loading with cascading updates
- Error boundaries for graceful failures
- Loading indicators for data refresh operations

---

## Notes for Backend Integration

The frontend is fully functional with mock data and ready for API integration.

### Required API Endpoints
- `GET /api/analytics/overview` - Key metrics and KPIs
- `GET /api/analytics/revenue` - Revenue data with date range
- `GET /api/analytics/sales` - Sales transaction analytics
- `GET /api/analytics/customers` - Customer behavior insights
- `GET /api/analytics/health` - Rooster health metrics
- `GET /api/analytics/breeds` - Breed performance data
- `GET /api/analytics/export` - Download report data

### Data Format Requirements
- All dates in ISO format
- Numbers formatted for locale (PHP for currency)
- Consistent error response structure
- Pagination support for large datasets

### Real-time Features
- WebSocket integration ready for live updates
- Optimistic updates for better UX
- Conflict resolution for concurrent users
- Data caching strategies for performance

### Chart Data Structure
Backend should provide data in formats matching the mock interfaces:
```javascript
// Example revenue data
{
  month: "January",
  revenue: 150000,
  sales: 45,
  profit: 75000,
  customers: 32
}
```

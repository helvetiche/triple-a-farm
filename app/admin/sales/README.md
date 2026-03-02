# Sales & Transactions Management Frontend

## Overview
Frontend implementation for the sales and transaction management system with order tracking, payment processing, and revenue analytics for Triple A Gamefarm operations.

## File Structure

```
app/admin/sales/
├── page.tsx                     # Main sales page with Suspense wrapper
├── components/
│   ├── index.ts                 # Component exports
│   ├── sales-client.tsx         # Main sales component with useSearchParams
│   ├── sales-table.tsx          # Transaction table with actions
│   ├── sales-view-dialog.tsx    # Transaction details modal
│   ├── record-sale-dialog.tsx   # New transaction form
│   ├── update-payment-dialog.tsx  # Payment status update
│   ├── send-confirmation-dialog.tsx  # Email confirmation
│   ├── payment-settings-dialog.tsx   # Payment configuration
│   ├── revenue-trend-chart.tsx  # Revenue visualization
│   ├── loading-spinner.tsx      # Loading indicator
│   └── skeleton-loading.tsx     # Loading skeletons
├── data/
│   └── mock-data.ts             # Sample sales data and interfaces
└── utils/
    └── toast.ts                 # Toast notification utilities
```

## Data Interface

Based on the actual implementation in `mock-data.ts`:

```typescript
interface SalesTransaction {
  id: string                    // Transaction ID (e.g., "SALE-001")
  date: string                  // Transaction date
  roosterId: string             // Rooster identifier
  breed: string                 // Rooster breed
  customerName: string          // Customer information
  customerContact: string       // Customer contact details
  amount: number                // Transaction amount
  paymentMethod: "cash" | "gcash" | "bank_transfer" | "paypal"
  status: "completed" | "pending" | "cancelled"
  paymentStatus: "paid" | "partial" | "unpaid"
  notes?: string                // Additional notes
  commission?: number           // Agent commission
  agentName?: string            // Sales agent
  amountPaid?: number           // Total amount paid so far
  lastPaymentDate?: string      // Date of last payment
  lastPaymentAmount?: number    // Amount of last payment
  paymentNotes?: string         // Notes about payment
}

interface SalesStats {
  totalRevenue: number
  totalTransactions: number
  pendingTransactions: number
  averageSaleAmount: number
  monthlyGrowth: number
  topBreed: string
}

interface RevenueTrend {
  date: string
  revenue: number
  transactions: number
}

interface PaymentSettings {
  acceptedMethods: string[]
  requireDeposit: boolean
  depositPercentage: number
  autoConfirmPayment: boolean
  paymentInstructions: string
}
```

## Components

### Main Page Structure
The sales page uses a Suspense wrapper (`page.tsx`) containing:

- **SalesClient** (`sales-client.tsx`): Main component with search params handling
- **Stats Cards**: Revenue, transactions, pending payments, average sale
- **Sales Table**: Detailed transaction view with filtering and actions
- **Revenue Chart**: Visual representation of sales trends
- **Dialog Components**: Various modals for transaction management

### Core Components

#### SalesClient (`sales-client.tsx`)
- Main client component wrapped in Suspense
- Handles `useSearchParams()` for URL-based filtering
- Manages all sales-related state and actions
- Integrates all dialog components

#### Sales Table (`sales-table.tsx`)
- Displays transactions with columns for:
  - Date, ID, Customer, Rooster, Amount
  - Payment method, Status, Payment status
  - Actions dropdown (View, Update Payment, Send Confirmation)
- Status badges with color coding
- Responsive design with mobile adaptations

#### Dialog Components
- **SalesViewDialog**: Complete transaction details display
- **RecordSaleDialog**: New transaction form with rooster selection
- **UpdatePaymentDialog**: Payment status and amount updates
- **SendConfirmationDialog**: Email confirmation sending
- **PaymentSettingsDialog**: Payment method configuration

#### Revenue Trend Chart (`revenue-trend-chart.tsx`)
- Visual revenue trends over time
- Interactive chart with tooltips
- Responsive design

### Key Features
- **Transaction Recording**: Create new sales transactions
- **Payment Tracking**: Monitor payment status and history
- **Customer Management**: Handle customer information
- **Revenue Analytics**: Visual charts for sales performance
- **Email Confirmations**: Send transaction confirmations
- **Search & Filter**: Real-time filtering by multiple criteria
- **URL State Management**: Persistent filters via search params

## Current Implementation

### Data Source
- Uses `mock-data.ts` with comprehensive sample transactions
- Mock sales statistics and revenue trends
- Simulated payment settings
- All CRUD operations with console logging

### Search and Filter System
- Search by customer name, rooster breed, or transaction ID
- Filter by payment status (paid, partial, unpaid)
- URL parameter persistence for shareable filtered views
- Real-time filtering with debounced input

### Toast Notifications
- Custom toast utilities in `utils/toast.ts`
- Success messages for CRUD operations
- Error handling for validation and API failures
- Confirmation messages for email sending

### Suspense Implementation
- Main page wrapped in Suspense to handle `useSearchParams()`
- Skeleton loading states during data fetching
- Error boundaries for graceful failures

## Styling

### Design System
- **Primary Color**: #3d6c58 (medium green)
- **Secondary**: #1f3f2c (dark green)
- **Status Colors**: 
  - Green for paid/completed
  - Yellow for partial/pending
  - Red for unpaid/cancelled
- **Non-rounded**: All components use sharp corners
- **Framework**: Tailwind CSS with shadcn/ui components

### Table Styling
- Consistent row styling with hover states
- Color-coded status badges
- Action dropdowns with icons
- Responsive design with horizontal scroll on mobile

## State Management

### Local State (SalesClient)
- Transaction list and filtering
- Selected transaction for actions
- Dialog open/close states
- Form data for new transactions
- Search and filter criteria

### URL State
- Search parameters for filtering persistence
- Prefilled rooster data from URL parameters
- Shareable filtered views

### Toast System
```typescript
// From utils/toast.ts
toastCRUD.createSuccess(item: string)
toastCRUD.updateSuccess(item: string)
toastCRUD.confirmationSent(customer: string)
toastCRUD.validationError(message: string)
```

## Integration Points

### Current Mock Functions
Based on the actual implementation:
```typescript
// Transaction management
handleRecordSale(saleData)        // Creates new transaction
handleViewTransaction(transaction) // Opens view dialog
handleUpdatePayment(saleId, data)  // Updates payment status
handleSendConfirmation(saleId)     // Sends email confirmation

// Filtering and search
handleSearch(query)               // Filters transactions
handleStatusFilter(status)        // Filters by payment status
```

### Component Props
```typescript
// SalesTable props
interface SalesTableProps {
  transactions: SalesTransaction[]
  onViewTransaction: (transaction: SalesTransaction) => void
  onUpdateTransaction: (transaction: SalesTransaction) => void
  onUpdatePayment: (transaction: SalesTransaction) => void
  onSendConfirmation: (transaction: SalesTransaction) => void
  onCancelTransaction: (transaction: SalesTransaction) => void
}
```

## Sales Features

### Transaction Management
- Complete CRUD operations for sales
- Automatic transaction ID generation
- Customer information tracking
- Rooster linkage and breed information

### Payment Processing
- Multiple payment method support (cash, gcash, bank_transfer, paypal)
- Partial payment tracking with amountPaid
- Payment history with dates and notes
- Status updates (paid, partial, unpaid)

### Revenue Analytics
- Monthly revenue trends with charts
- Sales by payment method breakdown
- Average transaction value tracking
- Top breed identification

### Customer Communication
- Email confirmation templates
- Transaction detail sharing
- Customer contact management
- Confirmation sending with status tracking

## Responsive Design

### Breakpoints
- **Mobile**: Stacked layout, simplified table with horizontal scroll
- **Tablet**: Side-by-side stats, responsive table
- **Desktop**: Full dashboard, optimal table width

### Table Responsiveness
- Horizontal scroll on mobile for table content
- Collapsible columns on small screens
- Touch-friendly action buttons
- Simplified filters for mobile

## Performance

### Optimization
- Suspense boundaries for better loading states
- Lazy loading for chart components
- Debounced search input (300ms)
- Efficient data aggregation and filtering

### Loading States
- Skeleton loaders for table rows and stats cards
- Progress indicators for dialog operations
- Error boundaries for graceful failures
- Optimistic updates for better UX

---

## Notes for Backend Integration

The frontend is fully functional with mock data and ready for API integration.

### Required API Endpoints
- `GET /api/sales/transactions` - Fetch transactions with filters
- `POST /api/sales/transactions` - Create new transaction
- `PUT /api/sales/transactions/{id}/payment` - Update payment status
- `POST /api/sales/transactions/{id}/confirm` - Send email confirmation
- `GET /api/sales/analytics` - Get sales analytics data
- `GET /api/sales/settings` - Get payment settings
- `PUT /api/sales/settings` - Update payment settings

### Data Flow
- Real-time transaction updates via WebSocket
- Optimistic updates for immediate UI feedback
- Conflict resolution for concurrent edits
- Audit trail for all transaction changes

### URL State Management
- Search parameters support:
  - `?search=customerName` - Filter by customer
  - `?status=paid` - Filter by payment status
  - `?roosterId=TR-001` - Prefill rooster selection
- Persistent filtering across page navigation

### Payment Integration
- Payment gateway integration points
- Webhook handling for payment confirmations
- Refund and cancellation workflows
- Commission calculation for agents

### Email System
- Template system for confirmations
- Batch email sending capabilities
- Email delivery tracking
- Customer communication history

### Current Mock Data Example
```javascript
{
  id: "SALE-001",
  date: "2024-11-20",
  roosterId: "TR-001",
  breed: "Sweater",
  customerName: "Juan Dela Cruz",
  customerContact: "+63 912 345 6789",
  amount: 15000,
  paymentMethod: "gcash",
  status: "completed",
  paymentStatus: "paid",
  notes: "Customer satisfied with quality"
}
```

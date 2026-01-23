# Inventory Activity Tracking

## Overview

The inventory system now includes comprehensive activity tracking for all stock movements, including both restocking and consumption operations.

## Features

### 1. Consume Action

The consume action allows staff to record when inventory items are used, sold, lost, or otherwise removed from stock.

**Access:**
- Available in the inventory table dropdown menu
- Available in the inventory item view dialog
- Requires admin or staff role

**Features:**
- Reduce stock by specified amount
- Select from preset reasons or provide custom reason
- Real-time stock preview showing result after consumption
- Warning when stock will fall below minimum level
- Cannot consume more than current stock

**Preset Reasons:**
- Broken
- Lost
- Sold
- Used in Operations
- Expired
- Damaged
- Other (allows custom text)

### 2. Enhanced Restock Action

The restock action has been enhanced to include reason tracking.

**Features:**
- Add stock by specified amount
- Select from preset reasons or provide custom reason
- Real-time stock preview showing result after restock
- Automatic status recalculation

**Preset Reasons:**
- Purchase Order
- Supplier Delivery
- Stock Transfer
- Return from Use
- Inventory Adjustment
- Other (allows custom text)

### 3. Activity Log

A comprehensive activity log tracks all stock movements for each inventory item.

**Access:**
- Available in the inventory table dropdown menu
- Available in the inventory item view dialog
- Requires admin or staff role

**Information Tracked:**
- Activity type (Restock or Consume)
- Amount changed
- Reason for change
- Previous stock level
- New stock level
- User who performed the action
- Timestamp of action

**Features:**
- Chronological display (newest first)
- Color-coded by activity type (green for restock, red for consume)
- Shows stock change visualization
- Displays user and timestamp for audit trail

## API Endpoints

### Restock Item
```
POST /api/inventory/[id]/restock
Body: { amount: number, reason: string }
```

### Consume Item
```
POST /api/inventory/[id]/consume
Body: { amount: number, reason: string }
```

### Get Activity Log
```
GET /api/inventory/[id]/activity
Returns: Array of InventoryActivity objects
```

## Database Schema

### InventoryActivity Collection

```typescript
interface InventoryActivity {
  id: string;
  itemId: string;
  itemName: string;
  type: "restock" | "consume";
  amount: number;
  unit: string;
  reason: string;
  previousStock: number;
  newStock: number;
  performedBy: string;
  performedAt: string; // ISO timestamp
}
```

## Firestore Indexes

The following indexes are required for optimal performance:

1. **inventoryActivity** collection:
   - `performedAt` (descending) - for chronological listing
   - `itemId` (ascending) + `performedAt` (descending) - for item-specific logs

These indexes are defined in `firestore.indexes.json`.

## Permissions

- **Read Activity**: Admin, Staff
- **Restock**: Admin, Staff
- **Consume**: Admin, Staff

## Usage Examples

### Recording a Consumption

1. Navigate to the inventory page
2. Find the item in the table
3. Click the dropdown menu (three dots)
4. Select "Consume"
5. Enter the amount to consume
6. Select a reason (or choose "Other" for custom)
7. Review the stock preview
8. Click "Consume Item"

### Viewing Activity History

1. Navigate to the inventory page
2. Find the item in the table
3. Click the dropdown menu (three dots)
4. Select "View Activity Log"
5. Review the chronological list of all stock movements

### Restocking with Reason

1. Navigate to the inventory page
2. Find the item in the table
3. Click the dropdown menu (three dots)
4. Select "Restock"
5. Enter the amount to add
6. Select a reason (or choose "Other" for custom)
7. Review the stock preview
8. Click "Restock Item"

## Benefits

1. **Accountability**: Every stock movement is tracked with user and timestamp
2. **Audit Trail**: Complete history of all inventory changes
3. **Insights**: Understand why stock levels change over time
4. **Compliance**: Meet regulatory requirements for inventory tracking
5. **Problem Detection**: Identify patterns of loss, damage, or misuse
6. **Better Planning**: Historical data helps with forecasting and ordering

## Future Enhancements

Potential improvements for future versions:

- Export activity logs to Excel/CSV
- Filter activity by date range, type, or user
- Analytics dashboard showing consumption patterns
- Automated alerts for unusual activity
- Batch operations for multiple items
- Integration with sales system for automatic consumption

export type InventoryStatus = "adequate" | "low" | "critical";

export interface InventoryItem {
  id: string;
  /**
   * Optional user-facing identifier like 0510-37A6.
   * If not present, the client will derive it from createdAt/lastRestocked + id.
   */
  displayId?: string;
  /**
   * ISO date string (YYYY-MM-DD) when the item was first created.
   */
  createdAt?: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  lastRestocked: string;
  supplier: string;
  status: InventoryStatus;
  description?: string;
  price?: number;
  /**
   * @deprecated Use locationId instead. Kept for backward compatibility.
   */
  location?: string;
  expiryDate?: string;
  /**
   * Reference to farm_locations collection.
   */
  locationId: string;
  /**
   * Denormalized location name for display purposes.
   */
  locationName: string;
  /**
   * Denormalized location address for display purposes.
   */
  locationAddress?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockAlerts: number;
  criticalItems: number;
  monthlySpend: number;
}

export type InventoryActivityType = "restock" | "consume";

export interface InventoryActivity {
  id: string;
  itemId: string;
  itemName: string;
  type: InventoryActivityType;
  amount: number;
  unit: string;
  reason: string;
  previousStock: number;
  newStock: number;
  performedBy: string;
  performedAt: string;
}

export const RESTOCK_REASONS = [
  "Purchase Order",
  "Supplier Delivery",
  "Stock Transfer",
  "Return from Use",
  "Inventory Adjustment",
  "Other",
] as const;

export const CONSUME_REASONS = [
  "Broken",
  "Lost",
  "Sold",
  "Used in Operations",
  "Expired",
  "Damaged",
  "Other",
] as const;

export const calculateInventoryStatus = (
  currentStock: number,
  minStock: number
): InventoryStatus => {
  if (currentStock === 0) {
    return "critical";
  }

  if (currentStock <= minStock * 0.5) {
    return "critical";
  }

  if (currentStock <= minStock) {
    return "low";
  }

  return "adequate";
};

export const formatInventoryDisplayId = (
  item: Pick<InventoryItem, "id" | "lastRestocked"> &
    Partial<Pick<InventoryItem, "createdAt" | "displayId">>
): string => {
  if (item.displayId) {
    return item.displayId.toUpperCase();
  }

  const dateSource = item.createdAt ?? item.lastRestocked;

  if (!dateSource) {
    return `#${item.id.slice(0, 4).toUpperCase()}-0000`;
  }

  const [, month, day] = dateSource.split("-");

  if (!month || !day) {
    return `#${item.id.slice(0, 4).toUpperCase()}-0000`;
  }

  const datePart = `${month}${day}`;
  const idPart = item.id.slice(0, 4).toUpperCase();

  return `#${idPart}-${datePart}`;
};

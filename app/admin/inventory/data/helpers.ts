// Inventory helper functions and type re-exports
export type { InventoryItem, InventoryStats } from "@/lib/inventory-types";
import type { InventoryItem } from "@/lib/inventory-types";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "adequate":
      return "bg-green-100 text-green-800";
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStockProgress = (current: number, min: number) => {
  const percentage = (current / min) * 100;
  return Math.min(percentage, 100);
};

export const getProgressColor = (current: number, min: number) => {
  const percentage = (current / min) * 100;
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

export const filterInventoryItems = (
  items: InventoryItem[],
  searchTerm: string
) => {
  if (!searchTerm) return items;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.id.toLowerCase().includes(lowerSearchTerm) ||
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.category.toLowerCase().includes(lowerSearchTerm) ||
      item.supplier.toLowerCase().includes(lowerSearchTerm)
  );
};

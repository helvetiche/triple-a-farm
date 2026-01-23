export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  itemsSupplied: number; // Count of inventory items from this supplier
  totalOrders: number; // Count of restock activities from this supplier
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  totalItemsSupplied: number;
}

"use client";

/**
 * EXAMPLE: Server-Side Paginated Inventory Page
 * 
 * This is a simplified example showing how to use the useInventoryPaginated hook
 * Replace the current inventory page implementation with this pattern
 */

import { useState } from "react";
import { useInventoryPaginated, useInventoryStats } from "@/hooks";
import { InventoryTablePaginated } from "./components/inventory-table-paginated";
import { InventoryFilters } from "./components";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function InventoryPageExample() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchValue, setSearchValue] = useState("");

  // Fetch paginated data with SWR
  const {
    items,
    total,
    page,
    limit,
    totalPages,
    isLoading,
  } = useInventoryPaginated({
    locationId: undefined,
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue,
    category: categoryFilter,
    status: statusFilter,
  });

  // Fetch stats separately
  const { stats, isLoading: statsLoading } = useInventoryStats(undefined);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // SWR will automatically fetch the new page
  };

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Handle item actions
  const handleViewDetails = (id: string) => {
    console.log("View details:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit:", id);
  };

  const handleRestock = (id: string) => {
    console.log("Restock:", id);
  };

  const handleConsume = (id: string) => {
    console.log("Consume:", id);
  };

  const handleViewActivity = (id: string) => {
    console.log("View activity:", id);
  };

  // Handle export
  const handleExport = async () => {
    // Export logic here
    console.log("Export inventory");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your farm supplies and stock levels
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div>Loading stats...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Total Items</div>
            <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Low Stock</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.lowStockAlerts || 0}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-2xl font-bold text-red-600">
              {stats?.criticalItems || 0}
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-sm text-muted-foreground">Monthly Spend</div>
            <div className="text-2xl font-bold">
              ₱{stats?.monthlySpend.toLocaleString() || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <InventoryFilters
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onFilterClick={() => {}}
      />

      {/* Paginated Table */}
      <InventoryTablePaginated
        items={items || []}
        total={total || 0}
        page={page || 1}
        limit={limit || 10}
        totalPages={totalPages || 1}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onRestock={handleRestock}
        onConsume={handleConsume}
        onViewActivity={handleViewActivity}
      />

      {/* Debug Info (remove in production) */}
      <div className="p-4 bg-gray-100 rounded text-xs">
        <div>Current Page: {currentPage}</div>
        <div>Items Per Page: {itemsPerPage}</div>
        <div>Total Items: {total}</div>
        <div>Total Pages: {totalPages}</div>
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Items Loaded: {items?.length || 0}</div>
      </div>
    </div>
  );
}

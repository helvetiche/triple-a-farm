"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

import {
  PageHeader,
  PageHeaderAddButton,
  PageHeaderLinkButton,
  StatCards,
} from "@/components/dashboard";
import {
  Package,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Download,
} from "lucide-react";

// Import modular components
import {
  InventoryFilters,
  InventoryTable,
  LoadingSpinner,
  StatsCardsSkeleton,
  PageHeaderSkeleton,
  TabsSkeleton,
  EmptyInventoryState,
  NoSearchResultsState,
  NoAlertsState,
  NoSuppliersState,
  InventoryViewDialog,
  InventoryAddDialog,
  InventoryEditDialog,
  ConfirmDialog,
  RestockDialog,
} from "./components";

import { filterInventoryItems, getStatusColor } from "./data/mock-data";
import type { InventoryItem, InventoryStats } from "@/lib/inventory-types";

// Import toast utilities
import { toastCRUD } from "./utils/toast";
import { exportInventoryToExcel } from "./utils/export-to-excel";
import { toast } from "sonner";

export const description = "Farm Supply & Inventory Management";

export default function InventoryPage() {
  // State and settings
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsDataLoading(true);

        const [itemsResponse, statsResponse] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/inventory/stats"),
        ]);

        const itemsJson = await itemsResponse.json();
        const statsJson = await statsResponse.json();

        if (!itemsResponse.ok || !itemsJson?.success) {
          if (itemsResponse.status === 401 || itemsResponse.status === 403) {
            toastCRUD.permissionError();
          } else {
            toastCRUD.loadError("inventory items");
          }
        } else {
          setItems(itemsJson.data as InventoryItem[]);
        }

        if (!statsResponse.ok || !statsJson?.success) {
          if (statsResponse.status === 401 || statsResponse.status === 403) {
            toastCRUD.permissionError();
          } else {
            toastCRUD.loadError("inventory stats");
          }
        } else {
          setStats(statsJson.data as InventoryStats);
        }
      } catch (error) {
        console.error("Failed to load inventory data:", error);
        toastCRUD.networkError();
      } finally {
        setIsDataLoading(false);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRefreshStats = async () => {
    try {
      const response = await fetch("/api/inventory/stats");
      const json = await response.json();

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError();
        } else {
          toastCRUD.loadError("inventory stats");
        }
        return;
      }

      setStats(json.data as InventoryStats);
    } catch (error) {
      console.error("Failed to refresh inventory stats:", error);
      toastCRUD.networkError();
    }
  };

  // Filter inventory items based on search
  const filteredItems = filterInventoryItems(items, searchValue);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  // Event handlers
  const handleViewDetails = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setSelectedItem(item);
      setIsViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setSelectedItem(item);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setConfirmDialog({
        open: true,
        title: "Delete Inventory Item",
        description: `Are you sure you want to delete ${item.name}? This action cannot be undone.`,
        onConfirm: async () => {
          try {
            const response = await fetch(`/api/inventory/${id}`, {
              method: "DELETE",
            });

            const json = await response.json();

            if (!response.ok || !json?.success) {
              if (response.status === 401 || response.status === 403) {
                toastCRUD.permissionError();
              } else if (response.status === 404) {
                toastCRUD.deleteError("Inventory item", "Item not found.");
              } else {
                toastCRUD.deleteError("Inventory item", json?.error?.message);
              }
              return;
            }

            setItems((prev) => prev.filter((existing) => existing.id !== id));
            toastCRUD.itemDeleted(item.name);
            handleRefreshStats();
          } catch (error) {
            console.error("Failed to delete inventory item:", error);
            toastCRUD.deleteError(
              "Inventory item",
              "Failed to delete item. Please try again."
            );
          }
        },
      });
    }
  };

  const handleRestock = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setSelectedItem(item);
      setIsRestockDialogOpen(true);
    }
  };

  const handleFilterClick = () => {
    console.log("Open filters");
    // TODO: Open filter modal or drawer
  };

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const handleItemAdded = (newItem: InventoryItem) => {
    setItems((prev) => [...prev, newItem]);
    handleRefreshStats();
  };

  const handleItemUpdated = (updatedItem: InventoryItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    handleRefreshStats();
  };

  const handleItemRestocked = (item: InventoryItem, restockAmount: number) => {
    setItems((prev) =>
      prev.map((existing) => (existing.id === item.id ? item : existing))
    );
    handleRefreshStats();
  };

  // Show loading state while data is being loaded
  if (isDataLoading) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <TabsSkeleton />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              {/* Page Header */}
              <PageHeader
                title="Farm Inventory"
                description="Track supplies, stock levels, and manage purchase orders"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                  <Button
                    variant="outline"
                    className="border-[#3d6c58]/20 hover:bg-[#3d6c58]/10 w-full sm:w-auto"
                    onClick={() => {
                      try {
                        exportInventoryToExcel(items, stats || undefined);
                        toast.success(
                          "Inventory report exported successfully!"
                        );
                      } catch (error) {
                        console.error("Error exporting inventory:", error);
                        toast.error(
                          "Failed to export report. Please try again."
                        );
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <PageHeaderAddButton
                    text="Add Item"
                    onClick={() => setIsAddDialogOpen(true)}
                  />
                </div>
              </PageHeader>

              {/* Stats Cards */}
              {stats ? (
                <StatCards
                  cards={[
                    {
                      title: "Total Items",
                      value: stats.totalItems,
                      description: "Different products",
                      icon: Package,
                    },
                    {
                      title: "Low Stock Alerts",
                      value: stats.lowStockAlerts,
                      description: "Need restocking",
                      icon: AlertTriangle,
                    },
                    {
                      title: "Critical Items",
                      value: stats.criticalItems,
                      description: "Urgent attention needed",
                      icon: AlertCircle,
                    },
                    {
                      title: "Monthly Spend",
                      value: `₱${stats.monthlySpend.toLocaleString()}`,
                      description: "Estimated cost of current stock",
                      icon: TrendingUp,
                    },
                  ]}
                />
              ) : (
                <StatsCardsSkeleton />
              )}

              {/* Tabs */}
              <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-4">
                  {/* Search and Filter */}
                  <InventoryFilters
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    onFilterClick={handleFilterClick}
                    onClearSearch={handleClearSearch}
                  />

                  {/* Inventory Table */}
                  {filteredItems.length === 0 && searchValue ? (
                    <NoSearchResultsState searchValue={searchValue} />
                  ) : filteredItems.length === 0 ? (
                    <EmptyInventoryState />
                  ) : (
                    <>
                      <InventoryTable
                        items={paginatedItems}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onRestock={handleRestock}
                      />
                      {totalPages > 1 && (
                        <Card className="border-[#3d6c58]/20">
                          <CardContent className="pt-6">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={setCurrentPage}
                              totalItems={filteredItems.length}
                              itemsPerPage={itemsPerPage}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c]">
                        Stock Alerts
                      </CardTitle>
                      <CardDescription>
                        Items that need attention
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {items.filter((item) => item.status !== "adequate")
                        .length === 0 ? (
                        <NoAlertsState />
                      ) : (
                        <div className="space-y-4">
                          {items
                            .filter((item) => item.status !== "adequate")
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-4 border"
                              >
                                <div className="flex items-center space-x-4">
                                  <AlertTriangle
                                    className={`h-5 w-5 ${
                                      item.status === "critical"
                                        ? "text-red-600"
                                        : "text-yellow-600"
                                    }`}
                                  />
                                  <div>
                                    <p className="font-medium text-[#1f3f2c]">
                                      {item.name}
                                    </p>
                                    <p className="text-sm text-[#4a6741]">
                                      Current stock: {item.currentStock}{" "}
                                      {item.unit} (Minimum: {item.minStock}{" "}
                                      {item.unit})
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    className={getStatusColor(item.status)}
                                  >
                                    {item.status}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    className="bg-[#3d6c58] hover:bg-[#4e816b]"
                                    onClick={() => handleRestock(item.id)}
                                  >
                                    Order Now
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c]">
                        Active Suppliers
                      </CardTitle>
                      <CardDescription>
                        Manage your supplier relationships
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                          {
                            name: "AgriFeeds Corp",
                            contact: "+63 2 1234 5678",
                            items: 12,
                            orders: 5,
                          },
                          {
                            name: "VetMed Supply",
                            contact: "+63 2 2345 6789",
                            items: 8,
                            orders: 3,
                          },
                          {
                            name: "Farm Supply Co",
                            contact: "+63 2 3456 7890",
                            items: 15,
                            orders: 7,
                          },
                          {
                            name: "CleanPro Solutions",
                            contact: "+63 2 4567 8901",
                            items: 6,
                            orders: 2,
                          },
                        ].map((supplier, index) => (
                          <Card key={index} className="border-[#3d6c58]/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base text-[#1f3f2c]">
                                {supplier.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-[#4a6741]" />
                                <p className="text-sm text-[#4a6741]">
                                  {supplier.contact}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Book className="h-4 w-4 text-[#4a6741]" />
                                <span className="text-sm text-[#4a6741]">
                                  Items:
                                </span>
                                <span className="font-medium">
                                  {supplier.items}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-[#4a6741]" />
                                <span className="text-sm text-[#4a6741]">
                                  Orders:
                                </span>
                                <span className="font-medium">
                                  {supplier.orders}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-[#3d6c58]/20"
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* View Dialog */}
              <InventoryViewDialog
                item={selectedItem}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* Add Dialog */}
              <InventoryAddDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onItemAdded={handleItemAdded}
              />

              {/* Edit Dialog */}
              <InventoryEditDialog
                item={selectedItem}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onItemUpdated={handleItemUpdated}
              />

              {/* Restock Dialog */}
              <RestockDialog
                item={selectedItem}
                open={isRestockDialogOpen}
                onOpenChange={setIsRestockDialogOpen}
                onRestock={handleItemRestocked}
              />

              {/* Confirmation Dialog */}
              <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                  setConfirmDialog((prev) => ({ ...prev, open }))
                }
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={confirmDialog.onConfirm}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Book, History as HistoryIcon, TrendingUp, TrendingDown, User, Calendar as CalendarIcon } from "lucide-react";
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
  TableSkeleton,
  EmptyInventoryState,
  NoSearchResultsState,
  NoAlertsState,
  NoSuppliersState,
  InventoryViewDialog,
  InventoryAddDialog,
  InventoryEditDialog,
  ConfirmDialog,
  RestockDialog,
  ConsumeDialog,
  ActivityLogDialog,
} from "./components";

import { filterInventoryItems, getStatusColor } from "./data/mock-data";
import type { InventoryItem, InventoryStats, InventoryActivity } from "@/lib/inventory-types";

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
  const [allActivities, setAllActivities] = useState<InventoryActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitySearchValue, setActivitySearchValue] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<"all" | "restock" | "consume">("all");
  const [activityDateFilter, setActivityDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPage = 8;
  const activitiesPerPage = 10;
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false);
  const [isActivityLogDialogOpen, setIsActivityLogDialogOpen] = useState(false);
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

  const loadAllActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await fetch("/api/inventory/activity?limit=200");
      const json = await response.json();

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError();
        } else {
          toastCRUD.loadError("activity history");
        }
        return;
      }

      setAllActivities(json.data as InventoryActivity[]);
    } catch (error) {
      console.error("Failed to load activity history:", error);
      toastCRUD.networkError();
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Filter inventory items based on search
  const filteredItems = filterInventoryItems(items, searchValue);

  // Filter activities based on search
  const filteredActivities = allActivities.filter((activity) => {
    // Search filter
    if (activitySearchValue) {
      const searchLower = activitySearchValue.toLowerCase();
      const matchesSearch =
        activity.itemName.toLowerCase().includes(searchLower) ||
        activity.reason.toLowerCase().includes(searchLower) ||
        activity.performedBy.toLowerCase().includes(searchLower) ||
        activity.type.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (activityTypeFilter !== "all" && activity.type !== activityTypeFilter) {
      return false;
    }

    // Date filter
    if (activityDateFilter !== "all") {
      const activityDate = new Date(activity.performedAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (activityDateFilter) {
        case "today":
          if (activityDate < today) return false;
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (activityDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (activityDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  // Reset activity page when activity search changes
  useEffect(() => {
    setActivityPage(1);
  }, [activitySearchValue, activityTypeFilter, activityDateFilter]);

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

  const handleConsume = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setSelectedItem(item);
      setIsConsumeDialogOpen(true);
    }
  };

  const handleViewActivity = (id: string) => {
    const item = items.find((r) => r.id === id);
    if (item) {
      setSelectedItem(item);
      setIsActivityLogDialogOpen(true);
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
    // Refresh activities if they've been loaded
    if (allActivities.length > 0) {
      loadAllActivities();
    }
  };

  const handleItemConsumed = (item: InventoryItem, consumeAmount: number) => {
    setItems((prev) =>
      prev.map((existing) => (existing.id === item.id ? item : existing))
    );
    handleRefreshStats();
    // Refresh activities if they've been loaded
    if (allActivities.length > 0) {
      loadAllActivities();
    }
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
              <Tabs defaultValue="inventory" className="space-y-4" onValueChange={(value) => {
                if (value === "activity" && allActivities.length === 0) {
                  loadAllActivities();
                }
              }}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
                  <TabsTrigger value="activity">Activity History</TabsTrigger>
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
                        onConsume={handleConsume}
                        onViewActivity={handleViewActivity}
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

                <TabsContent value="activity" className="space-y-4">
                  {/* Search and Filters */}
                  <Card className="border-[#3d6c58]/20">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Search by item name, reason, user, or type..."
                              value={activitySearchValue}
                              onChange={(e) => setActivitySearchValue(e.target.value)}
                              className="w-full px-4 py-2 border border-[#3d6c58]/20 focus:outline-none focus:ring-2 focus:ring-[#3d6c58] rounded-none"
                            />
                          </div>
                          {(activitySearchValue || activityTypeFilter !== "all" || activityDateFilter !== "all") && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActivitySearchValue("");
                                setActivityTypeFilter("all");
                                setActivityDateFilter("all");
                              }}
                              className="border-[#3d6c58]/20"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Activity Type
                            </label>
                            <Select
                              value={activityTypeFilter}
                              onValueChange={(value: "all" | "restock" | "consume") =>
                                setActivityTypeFilter(value)
                              }
                            >
                              <SelectTrigger className="w-full rounded-none border-[#3d6c58]/20">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="restock">Restock Only</SelectItem>
                                <SelectItem value="consume">Consume Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              Date Range
                            </label>
                            <Select
                              value={activityDateFilter}
                              onValueChange={(value: "all" | "today" | "week" | "month") =>
                                setActivityDateFilter(value)
                              }
                            >
                              <SelectTrigger className="w-full rounded-none border-[#3d6c58]/20">
                                <SelectValue placeholder="All Time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">Last 30 Days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c] flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5" />
                        Activity History
                      </CardTitle>
                      <CardDescription>
                        {filteredActivities.length === allActivities.length
                          ? `Showing all ${allActivities.length} activities`
                          : `Found ${filteredActivities.length} of ${allActivities.length} activities`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingActivities ? (
                        <TableSkeleton />
                      ) : filteredActivities.length === 0 && activitySearchValue ? (
                        <div className="text-center py-12">
                          <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No activities found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your search terms
                          </p>
                        </div>
                      ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-12">
                          <HistoryIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600">No activity logs found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Activity will appear here when items are restocked or consumed
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="hidden sm:block w-full overflow-x-auto">
                            <Table className="min-w-[720px]">
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Stock Change</TableHead>
                                  <TableHead>Performed By</TableHead>
                                  <TableHead>Date & Time</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredActivities
                                  .slice(
                                    (activityPage - 1) * activitiesPerPage,
                                    activityPage * activitiesPerPage
                                  )
                                  .map((activity) => (
                                    <TableRow key={activity.id}>
                                      <TableCell className="font-medium">
                                        {activity.itemName}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            activity.type === "restock"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-red-100 text-red-800"
                                          }
                                        >
                                          {activity.type === "restock" ? (
                                            <TrendingUp className="h-3 w-3 mr-1 inline" />
                                          ) : (
                                            <TrendingDown className="h-3 w-3 mr-1 inline" />
                                          )}
                                          {activity.type === "restock"
                                            ? "Restocked"
                                            : "Consumed"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={`font-semibold ${
                                            activity.type === "restock"
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {activity.type === "restock" ? "+" : "-"}
                                          {activity.amount} {activity.unit}
                                        </span>
                                      </TableCell>
                                      <TableCell className="max-w-[200px] truncate">
                                        {activity.reason}
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm text-gray-600">
                                          {activity.previousStock} → {activity.newStock}{" "}
                                          {activity.unit}
                                        </span>
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {activity.performedBy}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {new Date(activity.performedAt).toLocaleString(
                                          "en-US",
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Mobile View */}
                          <div className="space-y-3 sm:hidden">
                            {filteredActivities
                              .slice(
                                (activityPage - 1) * activitiesPerPage,
                                activityPage * activitiesPerPage
                              )
                              .map((activity) => (
                                <div
                                  key={activity.id}
                                  className="border border-gray-200 rounded-none p-4 bg-white"
                                >
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="font-semibold text-[#1f3f2c]">
                                      {activity.itemName}
                                    </div>
                                    <Badge
                                      className={
                                        activity.type === "restock"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }
                                    >
                                      {activity.type === "restock" ? (
                                        <TrendingUp className="h-3 w-3 mr-1 inline" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 mr-1 inline" />
                                      )}
                                      {activity.type === "restock"
                                        ? "Restocked"
                                        : "Consumed"}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Amount:</span>
                                      <span
                                        className={`font-semibold ${
                                          activity.type === "restock"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {activity.type === "restock" ? "+" : "-"}
                                        {activity.amount} {activity.unit}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Stock Change:</span>
                                      <span className="text-gray-700">
                                        {activity.previousStock} → {activity.newStock}{" "}
                                        {activity.unit}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Reason: </span>
                                      <span className="text-gray-700">
                                        {activity.reason}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <User className="h-3 w-3" />
                                      <span>{activity.performedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500">
                                      <CalendarIcon className="h-3 w-3" />
                                      <span>
                                        {new Date(activity.performedAt).toLocaleString(
                                          "en-US",
                                          {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Pagination */}
                          {Math.ceil(filteredActivities.length / activitiesPerPage) > 1 && (
                            <Card className="border-[#3d6c58]/20 mt-4">
                              <CardContent className="pt-6">
                                <Pagination
                                  currentPage={activityPage}
                                  totalPages={Math.ceil(
                                    filteredActivities.length / activitiesPerPage
                                  )}
                                  onPageChange={setActivityPage}
                                  totalItems={filteredActivities.length}
                                  itemsPerPage={activitiesPerPage}
                                />
                              </CardContent>
                            </Card>
                          )}
                        </>
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
                onRestock={handleRestock}
                onConsume={handleConsume}
                onViewActivity={handleViewActivity}
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

              {/* Consume Dialog */}
              <ConsumeDialog
                item={selectedItem}
                open={isConsumeDialogOpen}
                onOpenChange={setIsConsumeDialogOpen}
                onConsume={handleItemConsumed}
              />

              {/* Activity Log Dialog */}
              <ActivityLogDialog
                item={selectedItem}
                open={isActivityLogDialogOpen}
                onOpenChange={setIsActivityLogDialogOpen}
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

"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import { useState, useEffect } from "react";

import {
  PageHeader,
  PageHeaderAddButton,
  StatCards,
} from "@/components/dashboard";
import { Bird, Package, TrendingUp, AlertCircle, Download } from "lucide-react";

// Import modular components
import {
  RoosterFilters,
  RoosterTable,
  RoosterCards,
  ViewToggle,
  StatsCardsSkeleton,
  FiltersSkeleton,
  TableSkeleton,
  CardsSkeleton,
  PageHeaderSkeleton,
  RoosterEmptyState,
  RoosterViewDialog,
  ConfirmDialog,
  BreedManagementDialog,
} from "./components";

// Import toast utilities
import { toastCRUD } from "./utils/toast";
import { exportRoostersToExcel } from "./utils/export-to-excel";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Import unified rooster data
import {
  getRoosterStats,
  filterRoosters,
  roosterBreeds,
  roosterStatuses,
  healthStatuses,
  type Rooster,
} from "../data/roosters";

// Import settings
import { useRoosterSettings } from "./utils/use-rooster-settings";

export const description = "Rooster Inventory Management";

export default function RoostersPage() {
  // Auth
  const { userData } = useAuth();
  
  // State and settings
  const [searchValue, setSearchValue] = useState("");
  const [roosters, setRoosters] = useState<Rooster[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedRooster, setSelectedRooster] = useState<Rooster | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBreedDialogOpen, setIsBreedDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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
  const { viewMode, setViewMode, isLoading } = useRoosterSettings();

  // Fetch roosters from API
  const fetchRoosters = async () => {
    try {
      setIsDataLoading(true);
      const response = await fetch("/api/roosters");
      const result = await response.json();

      if (result.success) {
        setRoosters(result.data || []);
      } else {
        toastCRUD.loadError("roosters");
        console.error("Failed to load roosters:", result.error);
      }
    } catch (error) {
      toastCRUD.networkError();
      console.error("Error fetching roosters:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchRoosters();
  }, []);

  // Filter roosters based on search
  const filteredRoosters = filterRoosters(roosters, searchValue);

  // Pagination logic
  const totalPages = Math.ceil(filteredRoosters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoosters = filteredRoosters.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  // Calculate stats
  const stats = getRoosterStats(roosters);

  // Event handlers
  const handleViewDetails = (id: string) => {
    const rooster = roosters.find((r) => r.id === id);
    if (rooster) {
      setSelectedRooster(rooster);
      setIsViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/admin/roosters/edit/${id}`;
  };

  const handleDelete = (id: string) => {
    const rooster = roosters.find((r) => r.id === id);
    if (rooster) {
      setConfirmDialog({
        open: true,
        title: "Delete Rooster",
        description: `Are you sure you want to delete ${rooster.breed} rooster "${rooster.id}"? This action cannot be undone.`,
        onConfirm: async () => {
          try {
            const response = await fetch(`/api/roosters/${id}`, {
              method: "DELETE",
            });
            const result = await response.json();

            if (result.success) {
              toastCRUD.roosterDeleted(rooster.id);
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              await fetchRoosters();
            } else {
              toastCRUD.deleteError("rooster", result.error?.message);
            }
          } catch (error) {
            toastCRUD.networkError();
            console.error("Error deleting rooster:", error);
          }
        },
      });
    }
  };

  const handleFilterClick = () => {
    console.log("Open filters");
    // TODO: Open filter modal or drawer
  };

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const handleBuyRooster = (rooster: Rooster) => {
    // Navigate to sales page with rooster data in state
    const encodedRooster = encodeURIComponent(
      JSON.stringify({
        roosterId: rooster.id,
        breed: rooster.breed,
        price: parseFloat(rooster.price), // Convert string to number for sales form
        name: rooster.name,
      })
    );
    window.location.href = `/admin/sales?rooster=${encodedRooster}`;
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              {/* Page Header */}
              {isDataLoading ? (
                <PageHeaderSkeleton />
              ) : (
                <PageHeader
                  title="Rooster Inventory"
                  description="Manage your rooster profiles and track their status"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                    <Button
                      variant="outline"
                      className="border-[#3d6c58]/20 hover:bg-[#3d6c58]/10 w-full sm:w-auto"
                      onClick={() => {
                        try {
                          const exportedBy = userData 
                            ? `${userData.firstName} ${userData.lastName} (${userData.email})`
                            : "Unknown";
                          exportRoostersToExcel(roosters, stats, exportedBy);
                          toast.success(
                            "Rooster report exported successfully!"
                          );
                        } catch (error) {
                          console.error("Error exporting roosters:", error);
                          toast.error(
                            "Failed to export report. Please try again."
                          );
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </Button>
                    <PageHeaderAddButton
                      text="Add New Rooster"
                      href="/admin/roosters/add"
                    />
                    <Button
                      onClick={() => setIsBreedDialogOpen(true)}
                      className="bg-[#3d6c58] hover:bg-[#2d4f3a] text-white"
                    >
                      <Bird className="w-4 h-4" />
                      Manage Breeds
                    </Button>
                  </div>
                </PageHeader>
              )}

              {/* Stats Cards */}
              {isDataLoading ? (
                <StatsCardsSkeleton />
              ) : (
                <StatCards
                  cards={[
                    {
                      title: "Total Roosters",
                      value: stats.total,
                      description: "from last month",
                      icon: Bird,
                      trend: {
                        value: "2",
                        type: "increase",
                      },
                    },
                    {
                      title: "Available",
                      value: stats.available,
                      description: "Ready for sale",
                      icon: Package,
                    },
                    {
                      title: "Sold This Month",
                      value: stats.sold,
                      description: "from last month",
                      icon: TrendingUp,
                      trend: {
                        value: "15%",
                        type: "increase",
                      },
                    },
                    {
                      title: "In Quarantine",
                      value: stats.quarantine,
                      description: "Under observation",
                      icon: AlertCircle,
                    },
                  ]}
                />
              )}

              {/* Filters and Search */}
              {isDataLoading ? (
                <FiltersSkeleton />
              ) : (
                <Card className="border-[#3d6c58]/20">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="text-[#1f3f2c]">
                        Search & Filter
                      </CardTitle>
                      <ViewToggle
                        currentView={viewMode}
                        onViewChange={setViewMode}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RoosterFilters
                      searchValue={searchValue}
                      onSearchChange={setSearchValue}
                      onFilterClick={handleFilterClick}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Roosters Display - Table or Cards */}
              {isDataLoading ? (
                viewMode === "table" ? (
                  <TableSkeleton />
                ) : (
                  <CardsSkeleton />
                )
              ) : filteredRoosters.length === 0 ? (
                <Card className="border-[#3d6c58]/20">
                  <CardContent className="py-12">
                    <RoosterEmptyState
                      type={searchValue ? "no-search-results" : "no-data"}
                      onClearSearch={
                        searchValue ? handleClearSearch : undefined
                      }
                    />
                  </CardContent>
                </Card>
              ) : viewMode === "table" ? (
                <>
                  <RoosterTable
                    roosters={paginatedRoosters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBuyRooster={handleBuyRooster}
                  />
                  {totalPages > 1 && (
                    <Card className="border-[#3d6c58]/20">
                      <CardContent className="pt-6">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          totalItems={filteredRoosters.length}
                          itemsPerPage={itemsPerPage}
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <>
                  <RoosterCards
                    roosters={paginatedRoosters}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  {totalPages > 1 && (
                    <Card className="border-[#3d6c58]/20">
                      <CardContent className="pt-6">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          totalItems={filteredRoosters.length}
                          itemsPerPage={itemsPerPage}
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* View Dialog */}
              <RoosterViewDialog
                rooster={selectedRooster}
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

              {/* Breed Management Dialog */}
              <BreedManagementDialog
                open={isBreedDialogOpen}
                onOpenChange={setIsBreedDialogOpen}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

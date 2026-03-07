"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Plus,
  CreditCard,
  Wallet,
  TrendingUp,
  PhilippinePeso,
  Download,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  SalesViewDialog,
  RecordSaleDialog,
  RevenueTrendChart,
  SalesTable,
  SalesStatsCardsSkeleton,
} from "./index";
import { SalesFilters } from "./sales-filters";
import { PageHeaderSkeleton, TabsSkeleton } from "../../inventory/components";
import { SalesTransaction, SalesStats, RevenueTrend } from "../types";
import { toastCRUD } from "../utils/toast";
import { PageHeader, StatCards } from "@/components/dashboard";
import { exportSalesToExcel } from "../utils/export-to-excel";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSalesPaginated } from "@/hooks/use-sales";
import { useDebounce } from "@/hooks/use-debounce";

export const description = "Sales & Transaction Tracking";

export function SalesClient() {
  // Auth
  const { userData } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search by 300ms
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showRecordSaleDialog, setShowRecordSaleDialog] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SalesTransaction | null>(
    null
  );
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [prefilledRoosterData, setPrefilledRoosterData] = useState<
    | { roosterId: string; breed: string; price: number; name: string }
    | undefined
  >(undefined);

  const searchParams = useSearchParams();

  // Use paginated hook
  const {
    transactions: paginatedSales,
    total,
    totalPages,
    isLoading,
    mutate: mutateSales,
  } = useSalesPaginated({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchQuery, // Use debounced value
    paymentMethod: paymentMethodFilter,
  });

  // Fetch stats and trend separately
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    averageSaleAmount: 0,
    monthlyGrowth: 0,
    topBreed: "",
  });
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/sales/analytics");
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats || stats);
          setRevenueTrend(result.data.trend || []);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  // Handle URL parameter for pre-filled rooster data
  useEffect(() => {
    const roosterParam = searchParams.get("rooster");
    if (roosterParam && !prefilledRoosterData) {
      try {
        const roosterData = JSON.parse(decodeURIComponent(roosterParam));
        setPrefilledRoosterData(roosterData);
        setShowRecordSaleDialog(true);
      } catch (error) {
        console.error("Error parsing rooster data from URL:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, paymentMethodFilter]); // Use debounced value to sync with API call

  const handleRecordSale = async (saleData: SalesTransaction) => {
    try {
      setShowRecordSaleDialog(false);
      await mutateSales(); // Refresh the paginated data
      toastCRUD.createSuccess("Sale");
    } catch (error) {
      console.error("Error recording sale:", error);
      toastCRUD.createError("Sale", "Failed to record sale. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <PageHeaderSkeleton />
                <SalesStatsCardsSkeleton />
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
                title="Sales & Transactions"
                description="Track and manage all sales transactions"
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
                        exportSalesToExcel(paginatedSales || [], stats, exportedBy);
                        toast.success("Sales report exported successfully!");
                      } catch (error) {
                        console.error("Error exporting sales:", error);
                        toast.error(
                          "Failed to export report. Please try again."
                        );
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button
                    className="bg-[#3d6c58] hover:bg-[#4e816b] w-full sm:w-auto"
                    onClick={() => setShowRecordSaleDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Record Sale
                  </Button>
                </div>
              </PageHeader>

              {/* Stats Cards */}
              <StatCards
                cards={[
                  {
                    title: "Total Revenue",
                    value: `₱${stats.totalRevenue.toLocaleString()}`,
                    description: `${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth.toFixed(1)}%`,
                    icon: TrendingUp,
                    trend: {
                      value: `${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth.toFixed(1)}%`,
                      type: stats.monthlyGrowth >= 0 ? "increase" : "decrease",
                    },
                  },
                  {
                    title: "Total Sales",
                    value: stats.totalTransactions.toString(),
                    description: "All completed sales",
                    icon: CreditCard,
                  },
                  {
                    title: "Average Sale",
                    value: `₱${stats.averageSaleAmount.toLocaleString()}`,
                    description: "Per transaction",
                    icon: PhilippinePeso,
                  },
                  {
                    title: "Top Breed",
                    value: stats.topBreed || "N/A",
                    description: "Best selling",
                    icon: Wallet,
                  },
                ]}
              />

              {/* Sales Table */}
              <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                <CardHeader style={{ borderRadius: 0 }}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-[#1f3f2c]">
                        Recent Transactions
                      </CardTitle>
                      <CardDescription>
                        Latest sales and payment records
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent style={{ borderRadius: 0 }}>
                  <div className="mb-4">
                    <SalesFilters
                      searchValue={searchQuery}
                      onSearchChange={setSearchQuery}
                      paymentMethodFilter={paymentMethodFilter}
                      onPaymentMethodFilterChange={setPaymentMethodFilter}
                    />
                  </div>
                  <SalesTable
                    transactions={paginatedSales || []}
                    onViewTransaction={(sale: SalesTransaction) => {
                      setSelectedSale(sale);
                      setShowViewDialog(true);
                    }}
                  />
                  {(totalPages || 1) > 1 && (
                    <div className="pt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages || 1}
                        onPageChange={setCurrentPage}
                        totalItems={total || 0}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Trend Chart */}
              <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                <CardHeader style={{ borderRadius: 0 }}>
                  <CardTitle className="text-[#1f3f2c]">
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue performance</CardDescription>
                </CardHeader>
                <CardContent style={{ borderRadius: 0 }}>
                  <RevenueTrendChart data={revenueTrend} />
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>

        {/* Dialogs */}
        <RecordSaleDialog
          open={showRecordSaleDialog}
          onOpenChange={setShowRecordSaleDialog}
          onSaleRecorded={handleRecordSale}
          prefilledData={prefilledRoosterData}
        />

        <SalesViewDialog
          transaction={selectedSale}
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
        />
      </SidebarProvider>
    </div>
  );
}

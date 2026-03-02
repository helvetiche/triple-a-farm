"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  Wallet,
  Clock,
  TrendingUp,
  PhilippinePeso,
  Download
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  SalesViewDialog,
  RecordSaleDialog,
  RevenueTrendChart,
  SalesTable,
  LoadingSpinner,
  SalesStatsCardsSkeleton
} from "./index"
import { PageHeaderSkeleton, TabsSkeleton } from "../../inventory/components"
import { 
  SalesTransaction,
  SalesStats,
  RevenueTrend
} from "../types"
import { toastCRUD } from "../utils/toast"
import { PageHeader, StatCards } from "@/components/dashboard"
import { getAvailableRoosters, roosterBreeds, type Rooster } from "../../data/roosters"
import { exportSalesToExcel } from "../utils/export-to-excel"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

export const description = "Sales & Transaction Tracking"

export function SalesClient() {
  // Auth
  const { userData } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [sales, setSales] = useState<SalesTransaction[]>([])
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageSaleAmount: 0,
    monthlyGrowth: 0,
    topBreed: ""
  })
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showRecordSaleDialog, setShowRecordSaleDialog] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SalesTransaction | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [isSendingConfirmation, setIsSendingConfirmation] = useState(false)
  const [prefilledRoosterData, setPrefilledRoosterData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  const searchParams = useSearchParams()

  // Fetch sales data from API
  const fetchSalesData = async () => {
    try {
      setIsLoading(true)
      
      const [transactionsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/sales/transactions"),
        fetch("/api/sales/analytics"),
      ])

      const transactionsResult = await transactionsResponse.json()
      const analyticsResult = await analyticsResponse.json()

      if (transactionsResult.success) {
        const fetchedSales = transactionsResult.data || []
        console.log("Fetched sales:", fetchedSales.length)
        setSales(fetchedSales)
      } else {
        console.error("Failed to fetch transactions:", transactionsResult.error)
      }

      if (analyticsResult.success) {
        setStats(analyticsResult.data.stats || {
          totalRevenue: 0,
          totalTransactions: 0,
          averageSaleAmount: 0,
          monthlyGrowth: 0,
          topBreed: ""
        })
        setRevenueTrend(analyticsResult.data.trend || [])
      } else {
        console.error("Failed to fetch analytics:", analyticsResult.error)
      }
    } catch (error) {
      console.error("Error fetching sales data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [])

  // Handle URL parameter for pre-filled rooster data
  useEffect(() => {
    const roosterParam = searchParams.get('rooster')
    if (roosterParam) {
      try {
        const roosterData = JSON.parse(decodeURIComponent(roosterParam))
        setPrefilledRoosterData(roosterData)
        setShowRecordSaleDialog(true)
      } catch (error) {
        console.error('Error parsing rooster data from URL:', error)
      }
    }
  }, [searchParams])

  const handleRecordSale = async (saleData: SalesTransaction) => {
    try {
      // Sale is already saved to Firebase by record-sale-dialog
      // Close dialog first
      setShowRecordSaleDialog(false)
      
      // Add to local state immediately for instant feedback
      setSales([saleData, ...sales])
      
      // Then refresh from Firebase to ensure we have the latest data
      // Wait a moment to ensure Firebase has processed the write
      setTimeout(async () => {
        await fetchSalesData()
      }, 500)
    } catch (error) {
      console.error("Error recording sale:", error)
      toastCRUD.createError("Sale", "Failed to record sale. Please try again.")
    }
  }

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSales = filteredSales.slice(startIndex, endIndex)

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus])

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
    )
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
                          : "Unknown"
                        exportSalesToExcel(sales, stats, exportedBy)
                        toast.success("Sales report exported successfully!")
                      } catch (error) {
                        console.error("Error exporting sales:", error)
                        toast.error("Failed to export report. Please try again.")
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
                    description: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`,
                    icon: TrendingUp,
                    trend: {
                      value: `${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1)}%`,
                      type: stats.monthlyGrowth >= 0 ? "increase" : "decrease"
                    }
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
                  }
                ]}
              />

              {/* Sales Table */}
              <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                <CardHeader style={{ borderRadius: 0 }}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="text-[#1f3f2c]">Recent Transactions</CardTitle>
                      <CardDescription>Latest sales and payment records</CardDescription>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search transactions..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 w-full sm:w-64 border-[#3d6c58]/20 focus:border-[#3d6c58]"
                        />
                      </div>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 border border-[#3d6c58]/20 rounded-none focus:outline-none focus:border-[#3d6c58]"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent style={{ borderRadius: 0 }}>
                  <SalesTable
                    transactions={paginatedSales}
                    onViewTransaction={(sale: SalesTransaction) => {
                      setSelectedSale(sale)
                      setShowViewDialog(true)
                    }}
                  />
                  {totalPages > 1 && (
                    <div className="pt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredSales.length}
                        itemsPerPage={itemsPerPage}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Trend Chart */}
              <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                <CardHeader style={{ borderRadius: 0 }}>
                  <CardTitle className="text-[#1f3f2c]">Revenue Trend</CardTitle>
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
  )
}

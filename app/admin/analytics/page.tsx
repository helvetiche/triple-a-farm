"use client"

import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Bird, 
  Package, 
  Heart, 
  Download, 
  Calendar, 
  PhilippinePeso,
  Target,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react"
import { 
  DateRangeSelector,
  AnalyticsStatsCardsSkeleton,
  RevenueChartSkeleton,
  HealthMetricsSkeleton,
  HealthChartSkeleton,
  BreedPerformanceSkeleton,
  CustomerRatingsSkeleton,
  PageHeaderSkeleton,
  SimpleBarChart,
  SimplePieChart,
  DonutChart,
  SimpleAreaChart,
  SimpleLineChart,
  HealthRadarChart,
  PerformanceRadialChart,
  CustomerRatingsChart
} from "./components"
import { 
  DateRange,
  type AnalyticsStats,
  type MonthlyData,
  type BreedData,
  type HealthMetrics,
  type CustomerRating
} from "./data/mock-data"
import { exportAnalyticsToExcel } from "./utils/export-to-excel"

export const description = "Analytics & Reports"

interface AnalyticsData {
  stats: AnalyticsStats
  monthlyTrends: MonthlyData[]
  breedPerformance: BreedData[]
  healthMetrics: HealthMetrics[]
  customerRatings: CustomerRating[]
}

export function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  })

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedDateRange.startDate) {
        params.append("startDate", selectedDateRange.startDate.toISOString())
      }
      if (selectedDateRange.endDate) {
        params.append("endDate", selectedDateRange.endDate.toISOString())
      }

      const response = await fetch(`/api/analytics?${params.toString()}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Failed to fetch analytics data")
      }

      setAnalyticsData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load analytics data"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateRange])

  const handleDateRangeChange = (dateRange: DateRange) => {
    setSelectedDateRange(dateRange)
  }

  const handleExportReport = () => {
    if (!analyticsData) {
      toast.error("No data available to export")
      return
    }

    try {
      exportAnalyticsToExcel(analyticsData, selectedDateRange)
      toast.success("Report exported successfully!")
    } catch (error) {
      console.error("Error exporting report:", error)
      toast.error("Failed to export report. Please try again.")
    }
  }

  // Transform data for charts
  const revenueChartData = useMemo(() => {
    if (!analyticsData?.monthlyTrends) return []
    return analyticsData.monthlyTrends.map(item => ({
      label: item.month,
      value: item.revenue,
      value2: item.profit
    }))
  }, [analyticsData])

  const salesChartData = useMemo(() => {
    if (!analyticsData?.monthlyTrends) return []
    return analyticsData.monthlyTrends.map(item => ({
      label: item.month,
      value: item.sales
    }))
  }, [analyticsData])

  const breedPerformanceData = useMemo(() => {
    if (!analyticsData?.breedPerformance) return []
    const colors = ['#3d6c58', '#82c91e', '#4c6ef5', '#f59f00', '#e03131']
    return analyticsData.breedPerformance.map((item, index) => ({
      label: item.breed,
      value: item.revenue,
      percentage: item.percentage,
      color: colors[index % colors.length]
    }))
  }, [analyticsData])

  const breedSalesData = useMemo(() => {
    if (!analyticsData?.breedPerformance) return []
    const colors = ['#3d6c58', '#82c91e', '#4c6ef5', '#f59f00', '#e03131']
    return analyticsData.breedPerformance.map((item, index) => ({
      label: item.breed,
      value: item.sales,
      color: colors[index % colors.length]
    }))
  }, [analyticsData])

  const healthScoreData = useMemo(() => {
    if (!analyticsData?.healthMetrics) return []
    return analyticsData.healthMetrics.map(item => ({
      label: item.date,
      value: item.overallHealth
    }))
  }, [analyticsData])

  const topBreedPercentage = useMemo(() => {
    if (!analyticsData?.breedPerformance || analyticsData.breedPerformance.length === 0) return 0
    const topBreed = analyticsData.breedPerformance[0]
    return topBreed.percentage
  }, [analyticsData])

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
                <AnalyticsStatsCardsSkeleton />
                <div className="grid gap-6 lg:grid-cols-2">
                  <RevenueChartSkeleton />
                  <HealthMetricsSkeleton />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <BreedPerformanceSkeleton />
                  <CustomerRatingsSkeleton />
                </div>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-[#1f3f2c]">Analytics & Reports</h1>
                  <p className="text-[#4a6741]">Data insights and business intelligence</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                  <DateRangeSelector 
                    onDateRangeChange={handleDateRangeChange}
                    initialDateRange={selectedDateRange}
                  />
                  <Button 
                    className="bg-[#3d6c58] hover:bg-[#4e816b] w-full sm:w-auto"
                    onClick={handleExportReport}
                  >
                    <Download className="w-4 h-4 " />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <Card className="border-red-200 bg-red-50" style={{ borderRadius: 0 }}>
                  <CardContent className="pt-6">
                    <p className="text-red-600">{error}</p>
                    <Button
                      onClick={fetchAnalyticsData}
                      className="mt-4 bg-[#3d6c58] hover:bg-[#4e816b]"
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Key Metrics */}
              {analyticsData && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                    <CardHeader style={{ borderRadius: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a6741]">Total Revenue</span>
                        <PhilippinePeso className="w-4 h-4 text-[#3d6c58]" />
                      </div>
                    </CardHeader>
                    <CardContent style={{ borderRadius: 0 }}>
                      <div className="text-2xl font-bold text-[#1f3f2c]">
                        ₱{analyticsData.stats.totalRevenue.toLocaleString()}
                      </div>
                      <p className={`text-xs flex items-center ${analyticsData.stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData.stats.monthlyGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {analyticsData.stats.monthlyGrowth >= 0 ? '+' : ''}{analyticsData.stats.monthlyGrowth.toFixed(1)}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                    <CardHeader style={{ borderRadius: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a6741]">Total Sales</span>
                        <BarChart3 className="w-4 h-4 text-[#3d6c58]" />
                      </div>
                    </CardHeader>
                    <CardContent style={{ borderRadius: 0 }}>
                      <div className="text-2xl font-bold text-[#1f3f2c]">
                        {analyticsData.stats.totalSales}
                      </div>
                      <p className={`text-xs flex items-center ${analyticsData.stats.monthlySalesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analyticsData.stats.monthlySalesGrowth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {analyticsData.stats.monthlySalesGrowth >= 0 ? '+' : ''}{analyticsData.stats.monthlySalesGrowth.toFixed(1)}% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                    <CardHeader style={{ borderRadius: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a6741]">Average Sale</span>
                        <TrendingUp className="w-4 h-4 text-[#3d6c58]" />
                      </div>
                    </CardHeader>
                    <CardContent style={{ borderRadius: 0 }}>
                      <div className="text-2xl font-bold text-[#1f3f2c]">
                        ₱{Math.round(analyticsData.stats.averageSale).toLocaleString()}
                      </div>
                      <p className="text-xs text-gray-600">
                        Per transaction
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                    <CardHeader style={{ borderRadius: 0 }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a6741]">Top Breed</span>
                        <Bird className="w-4 h-4 text-[#3d6c58]" />
                      </div>
                    </CardHeader>
                    <CardContent style={{ borderRadius: 0 }}>
                      <div className="text-2xl font-bold text-[#1f3f2c]">
                        {analyticsData.stats.topBreed}
                      </div>
                      <p className="text-xs text-gray-600">
                        {topBreedPercentage.toFixed(1)}% of total sales
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts Section */}
              <Tabs defaultValue="overview" className="space-y-6">
                <div className="w-full overflow-x-auto">
                  <TabsList className="flex w-max min-w-max gap-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
                    <TabsTrigger value="health">Health Metrics</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  {analyticsData && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {revenueChartData.length > 0 ? (
                        <SimpleAreaChart
                          title="Revenue & Profit Trends"
                          description="Monthly revenue and profit over the selected period"
                          data={revenueChartData}
                          height={300}
                        />
                      ) : (
                        <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                          <CardContent className="pt-6">
                            <p className="text-gray-500">No revenue data available for the selected period</p>
                          </CardContent>
                        </Card>
                      )}
                      {salesChartData.length > 0 ? (
                        <SimpleBarChart
                          title="Monthly Sales Volume"
                          description="Number of sales transactions per month"
                          data={salesChartData}
                          height={300}
                        />
                      ) : (
                        <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                          <CardContent className="pt-6">
                            <p className="text-gray-500">No sales data available for the selected period</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                  {analyticsData && (
                    breedSalesData.length > 0 ? (
                      <SimpleBarChart
                        title="Sales Distribution by Breed"
                        description="Number of sales per breed"
                        data={breedSalesData}
                      />
                    ) : (
                      <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                        <CardContent className="pt-6">
                          <p className="text-gray-500">No breed sales data available for the selected period</p>
                        </CardContent>
                      </Card>
                    )
                  )}
                </TabsContent>

                <TabsContent value="health" className="space-y-6">
                  {analyticsData && (
                    <div className="grid gap-6 lg:grid-cols-2">
                      {analyticsData.healthMetrics.length > 0 ? (
                        <>
                          <HealthRadarChart
                            title="Flock Health Overview"
                            description="Current health metrics across all categories"
                            data={analyticsData.healthMetrics}
                          />
                          <Card className="border-[#3d6c58]/20">
                            <CardHeader>
                              <CardTitle className="text-[#1f3f2c] flex items-center gap-2">
                                <Heart className="w-5 h-5 text-[#3d6c58]" />
                                Health Metrics Trend
                              </CardTitle>
                              <CardDescription>Health performance over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {healthScoreData.length > 0 ? (
                                <SimpleLineChart
                                  title=""
                                  description=""
                                  data={healthScoreData}
                                  height={200}
                                  color="#3d6c58"
                                />
                              ) : (
                                <p className="text-gray-500">No health data available</p>
                              )}
                            </CardContent>
                          </Card>
                        </>
                      ) : (
                        <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                          <CardContent className="pt-6">
                            <p className="text-gray-500">No health metrics data available for the selected period</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  {analyticsData && (
                    <div className="grid gap-6 lg:grid-cols-1">
                      {analyticsData.customerRatings.length > 0 ? (
                        <CustomerRatingsChart
                          title="Customer Ratings"
                          description="Client satisfaction trends"
                          data={analyticsData.customerRatings}
                        />
                      ) : (
                        <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                          <CardContent className="pt-6">
                            <p className="text-gray-500">No customer ratings data available for the selected period</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

// Default export for Next.js page
export default AnalyticsPage

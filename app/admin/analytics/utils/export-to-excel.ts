import type {
  AnalyticsStats,
  MonthlyData,
  BreedData,
  HealthMetrics,
  CustomerRating,
} from "../data/mock-data"

interface AnalyticsData {
  stats: AnalyticsStats
  monthlyTrends: MonthlyData[]
  breedPerformance: BreedData[]
  healthMetrics: HealthMetrics[]
  customerRatings: CustomerRating[]
}

export const exportAnalyticsToExcel = async (
  data: AnalyticsData,
  dateRange?: { startDate: Date; endDate: Date },
  exportedBy?: string
) => {
  // Dynamic import to ensure this only runs on client
  if (typeof window === 'undefined') {
    throw new Error('Export can only be performed in the browser')
  }

  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary Statistics
  const summaryData = [
    ["Analytics Report Summary"],
    ["Generated:", new Date().toLocaleString()],
    ["Exported by:", exportedBy || "Unknown"],
    [],
    ["Metric", "Value"],
    ["Total Revenue", `₱${data.stats.totalRevenue.toLocaleString()}`],
    ["Total Sales", data.stats.totalSales],
    ["Average Sale", `₱${Math.round(data.stats.averageSale).toLocaleString()}`],
    ["Top Breed", data.stats.topBreed],
    ["Monthly Growth", `${data.stats.monthlyGrowth >= 0 ? "+" : ""}${data.stats.monthlyGrowth.toFixed(1)}%`],
    ["Yearly Growth", `${data.stats.yearlyGrowth >= 0 ? "+" : ""}${data.stats.yearlyGrowth.toFixed(1)}%`],
    ["Monthly Sales Growth", `${data.stats.monthlySalesGrowth >= 0 ? "+" : ""}${data.stats.monthlySalesGrowth.toFixed(1)}%`],
    ["Total Customers", data.stats.totalCustomers],
    ["Active Roosters", data.stats.activeRoosters],
  ]

  if (dateRange) {
    summaryData.splice(3, 0, [
      "Date Range",
      `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
    ])
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Sheet 2: Monthly Trends
  if (data.monthlyTrends.length > 0) {
    const monthlyData = [
      ["Month", "Revenue", "Sales", "Profit", "Customers"],
      ...data.monthlyTrends.map((item) => [
        item.month,
        item.revenue,
        item.sales,
        item.profit,
        item.customers,
      ]),
    ]
    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)
    XLSX.utils.book_append_sheet(workbook, monthlySheet, "Monthly Trends")
  }

  // Sheet 3: Breed Performance
  if (data.breedPerformance.length > 0) {
    const breedData = [
      ["Breed", "Sales", "Revenue", "Percentage (%)"],
      ...data.breedPerformance.map((item) => [
        item.breed,
        item.sales,
        item.revenue,
        item.percentage.toFixed(2),
      ]),
    ]
    const breedSheet = XLSX.utils.aoa_to_sheet(breedData)
    XLSX.utils.book_append_sheet(workbook, breedSheet, "Breed Performance")
  }

  // Sheet 4: Health Metrics
  if (data.healthMetrics.length > 0) {
    const healthData = [
      [
        "Date",
        "Overall Health",
        "Vaccination Coverage (%)",
        "Disease Incidence (%)",
        "Mortality Rate (%)",
        "Average Weight",
      ],
      ...data.healthMetrics.map((item) => [
        item.date,
        item.overallHealth,
        item.vaccinationCoverage,
        item.diseaseIncidence,
        item.mortalityRate,
        item.averageWeight,
      ]),
    ]
    const healthSheet = XLSX.utils.aoa_to_sheet(healthData)
    XLSX.utils.book_append_sheet(workbook, healthSheet, "Health Metrics")
  }

  // Sheet 5: Customer Ratings
  if (data.customerRatings.length > 0) {
    const ratingsData = [
      ["Date", "Rating", "Customer ID", "Transaction ID"],
      ...data.customerRatings.map((item) => [
        item.date,
        item.rating,
        item.customerId,
        item.transactionId,
      ]),
    ]
    const ratingsSheet = XLSX.utils.aoa_to_sheet(ratingsData)
    XLSX.utils.book_append_sheet(workbook, ratingsSheet, "Customer Ratings")
  }

  // Generate filename with date range if available
  const dateStr = dateRange
    ? `${dateRange.startDate.toISOString().split("T")[0]}_to_${dateRange.endDate.toISOString().split("T")[0]}`
    : new Date().toISOString().split("T")[0]
  const filename = `analytics_report_${dateStr}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}


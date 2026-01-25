import type { Rooster } from "../data/roosters"

interface Activity {
  action: string
  detail: string
  time: string
  icon: string
}

interface DashboardStats {
  total: number
  available: number
  sold: number
  reserved: number
  quarantine: number
  totalValue: number
  availableValue: number
  averagePrice: number
  topBreed: string
}

export const exportDashboardToExcel = async (
  stats: DashboardStats,
  roosters: Rooster[],
  activities: Activity[],
  dateRange?: { startDate: Date; endDate: Date },
  exportedBy?: string
) => {
  // Dynamic import to ensure this only runs on client
  if (typeof window === 'undefined') {
    throw new Error('Export can only be performed in the browser')
  }

  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Dashboard Summary
  const summaryData = [
    ["Dashboard Report"],
    ["Generated:", new Date().toLocaleString()],
    ["Exported by:", exportedBy || "Unknown"],
    [],
    ["Metric", "Value"],
    ["Total Roosters", stats.total],
    ["Available Roosters", stats.available],
    ["Sold Roosters", stats.sold],
    ["Reserved Roosters", stats.reserved],
    ["Roosters in Quarantine", stats.quarantine],
    ["Total Inventory Value", `₱${stats.totalValue.toLocaleString()}`],
    ["Available Stock Value", `₱${stats.availableValue.toLocaleString()}`],
    ["Average Price", `₱${Math.round(stats.averagePrice).toLocaleString()}`],
    ["Top Breed", stats.topBreed],
  ]

  if (dateRange) {
    summaryData.splice(4, 0, [
      "Date Range",
      `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`,
    ])
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Dashboard Summary")

  // Sheet 2: Rooster Inventory
  const roosterData = [
    ["ID", "Breed", "Age", "Weight", "Status", "Price", "Date Added"],
    ...roosters.map((rooster) => [
      rooster.id,
      rooster.breed,
      rooster.age,
      rooster.weight,
      rooster.status,
      rooster.price,
      rooster.dateAdded,
    ]),
  ]
  const roosterSheet = XLSX.utils.aoa_to_sheet(roosterData)
  XLSX.utils.book_append_sheet(workbook, roosterSheet, "Rooster Inventory")

  // Sheet 3: Recent Activity
  if (activities.length > 0) {
    const activityData = [
      ["Action", "Detail", "Time"],
      ...activities.map((activity) => [
        activity.action,
        activity.detail,
        activity.time,
      ]),
    ]
    const activitySheet = XLSX.utils.aoa_to_sheet(activityData)
    XLSX.utils.book_append_sheet(workbook, activitySheet, "Recent Activity")
  }

  // Generate filename with date
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `dashboard_report_${dateStr}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}

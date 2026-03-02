import * as XLSX from "xlsx"
import type { InventoryItem, InventoryStats } from "@/lib/inventory-types"
import { formatInventoryDisplayId } from "@/lib/inventory-types"

export const exportInventoryToExcel = (
  items: InventoryItem[],
  stats?: InventoryStats,
  exportedBy?: string
) => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary Statistics
  if (stats) {
    const summaryData = [
      ["Inventory Report Summary"],
      ["Generated:", new Date().toLocaleString()],
      ["Exported by:", exportedBy || "Unknown"],
      [],
      ["Metric", "Value"],
      ["Total Items", stats.totalItems],
      ["Low Stock Alerts", stats.lowStockAlerts],
      ["Critical Items", stats.criticalItems],
      ["Monthly Spend", `₱${stats.monthlySpend.toLocaleString()}`],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
  }

  // Sheet 2: Inventory Items (sorted alphabetically by name)
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name))
  const inventoryData = [
    [
      "Item ID",
      "Name",
      "Category",
      "Current Stock",
      "Min Stock",
      "Unit",
      "Status",
      "Supplier",
      "Last Restocked",
      "Price",
      "Location",
      "Expiry Date",
      "Description",
    ],
    ...sortedItems.map((item) => [
      formatInventoryDisplayId(item),
      item.name,
      item.category,
      item.currentStock,
      item.minStock,
      item.unit,
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
      item.supplier,
      item.lastRestocked,
      item.price ? `₱${item.price.toLocaleString()}` : "",
      item.location || "",
      item.expiryDate || "",
      item.description || "",
    ]),
  ]
  const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData)
  XLSX.utils.book_append_sheet(workbook, inventorySheet, "Inventory Items")

  // Sheet 3: Stock Alerts (if any, sorted alphabetically by name)
  const alertItems = items.filter((item) => item.status !== "adequate")
    .sort((a, b) => a.name.localeCompare(b.name))
  if (alertItems.length > 0) {
    const alertsData = [
      ["Item ID", "Name", "Category", "Current Stock", "Min Stock", "Status"],
      ...alertItems.map((item) => [
        formatInventoryDisplayId(item),
        item.name,
        item.category,
        item.currentStock,
        item.minStock,
        item.status.charAt(0).toUpperCase() + item.status.slice(1),
      ]),
    ]
    const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData)
    XLSX.utils.book_append_sheet(workbook, alertsSheet, "Stock Alerts")
  }

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `inventory_report_${dateStr}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}


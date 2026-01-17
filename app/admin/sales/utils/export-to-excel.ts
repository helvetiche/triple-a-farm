import * as XLSX from "xlsx"
import type { SalesTransaction, SalesStats } from "../types"

export const exportSalesToExcel = (
  transactions: SalesTransaction[],
  stats?: SalesStats
) => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary Statistics
  if (stats) {
    const summaryData = [
      ["Sales & Transactions Report Summary"],
      ["Generated:", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Revenue", `₱${stats.totalRevenue.toLocaleString()}`],
      ["Total Transactions", stats.totalTransactions],
      ["Pending Transactions", stats.pendingTransactions],
      ["Average Sale Amount", `₱${stats.averageSaleAmount.toLocaleString()}`],
      ["Monthly Growth", `${stats.monthlyGrowth >= 0 ? "+" : ""}${stats.monthlyGrowth.toFixed(1)}%`],
      ["Top Breed", stats.topBreed],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
  }

  // Sheet 2: Transactions
  const transactionsData = [
    [
      "Transaction ID",
      "Date",
      "Customer Name",
      "Customer Contact",
      "Rooster ID",
      "Breed",
      "Amount",
      "Payment Method",
      "Payment Status",
      "Status",
      "Amount Paid",
      "Last Payment Date",
      "Notes",
    ],
    ...transactions.map((t) => [
      t.transactionId || t.id,
      t.date,
      t.customerName,
      t.customerContact,
      t.roosterId,
      t.breed,
      t.amount,
      t.paymentMethod,
      t.paymentStatus,
      t.status,
      t.amountPaid || 0,
      t.lastPaymentDate || "",
      t.notes || "",
    ]),
  ]
  const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData)
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions")

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `sales_transactions_${dateStr}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}


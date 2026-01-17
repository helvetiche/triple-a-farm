import * as XLSX from "xlsx"
import type { Rooster } from "../../data/roosters"

interface RoosterStats {
  total: number
  available: number
  sold: number
  quarantine: number
}

export const exportRoostersToExcel = (
  roosters: Rooster[],
  stats?: RoosterStats
) => {
  const workbook = XLSX.utils.book_new()

  // Sheet 1: Summary Statistics
  if (stats) {
    const summaryData = [
      ["Rooster Inventory Report Summary"],
      ["Generated:", new Date().toLocaleString()],
      [],
      ["Metric", "Value"],
      ["Total Roosters", stats.total],
      ["Available", stats.available],
      ["Sold", stats.sold],
      ["In Quarantine", stats.quarantine],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")
  }

  // Sheet 2: All Roosters
  const roostersData = [
    [
      "ID",
      "Name",
      "Breed",
      "Age",
      "Weight",
      "Price",
      "Status",
      "Health",
      "Location",
      "Arrival Date",
      "Date Added",
      "Owner",
      "Bloodline",
      "Fight Record (W-L-D)",
      "Description",
    ],
    ...roosters.map((r) => [
      r.id,
      r.name,
      r.breed,
      r.age,
      r.weight,
      r.price,
      r.status,
      r.health.charAt(0).toUpperCase() + r.health.slice(1),
      r.location,
      r.arrivalDate,
      r.dateAdded,
      r.owner || "",
      r.bloodline || "",
      r.fightRecord
        ? `${r.fightRecord.wins}-${r.fightRecord.losses}-${r.fightRecord.draws}`
        : "",
      r.description || "",
    ]),
  ]
  const roostersSheet = XLSX.utils.aoa_to_sheet(roostersData)
  XLSX.utils.book_append_sheet(workbook, roostersSheet, "All Roosters")

  // Sheet 3: Available Roosters
  const availableRoosters = roosters.filter((r) => r.status === "Available")
  if (availableRoosters.length > 0) {
    const availableData = [
      ["ID", "Name", "Breed", "Age", "Weight", "Price", "Health", "Location"],
      ...availableRoosters.map((r) => [
        r.id,
        r.name,
        r.breed,
        r.age,
        r.weight,
        r.price,
        r.health.charAt(0).toUpperCase() + r.health.slice(1),
        r.location,
      ]),
    ]
    const availableSheet = XLSX.utils.aoa_to_sheet(availableData)
    XLSX.utils.book_append_sheet(workbook, availableSheet, "Available")
  }

  // Sheet 4: By Status (excluding Available since we already have a dedicated sheet)
  const statusGroups = ["Sold", "Reserved", "Quarantine", "Deceased"]
  statusGroups.forEach((status) => {
    const statusRoosters = roosters.filter((r) => r.status === status)
    if (statusRoosters.length > 0) {
      const statusData = [
        ["ID", "Name", "Breed", "Age", "Weight", "Price", "Health"],
        ...statusRoosters.map((r) => [
          r.id,
          r.name,
          r.breed,
          r.age,
          r.weight,
          r.price,
          r.health.charAt(0).toUpperCase() + r.health.slice(1),
        ]),
      ]
      const statusSheet = XLSX.utils.aoa_to_sheet(statusData)
      XLSX.utils.book_append_sheet(workbook, statusSheet, status)
    }
  })

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = `roosters_inventory_${dateStr}.xlsx`

  // Write file
  XLSX.writeFile(workbook, filename)
}


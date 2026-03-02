// Mock data and interfaces for inventory management

export interface InventoryItem {
  id: string
  name: string
  category: string
  currentStock: number
  minStock: number
  unit: string
  lastRestocked: string
  supplier: string
  status: "adequate" | "low" | "critical"
  description?: string
  price?: number
  location?: string
  expiryDate?: string
}

export interface InventoryStats {
  totalItems: number
  lowStockAlerts: number
  criticalItems: number
  monthlySpend: string
}

// Mock inventory data
export const mockInventoryItems: InventoryItem[] = [
  { 
    id: "INV-001", 
    name: "Premium Gamefowl Feed", 
    category: "Feed", 
    currentStock: 245, 
    minStock: 100, 
    unit: "kg", 
    lastRestocked: "2024-11-15", 
    supplier: "AgriFeeds Corp",
    status: "adequate",
    description: "High-quality gamefowl feed with balanced nutrition for optimal growth and performance.",
    price: 45.50,
    location: "Warehouse A - Section 1",
    expiryDate: "2025-06-15"
  },
  { 
    id: "INV-002", 
    name: "Vitamin Supplements", 
    category: "Medicine", 
    currentStock: 45, 
    minStock: 50, 
    unit: "bottles", 
    lastRestocked: "2024-10-20", 
    supplier: "VetMed Supply",
    status: "low",
    description: "Essential vitamin supplements for gamefowl health and immunity boost.",
    price: 120.00,
    location: "Storage Room B - Shelf 2",
    expiryDate: "2025-03-20"
  },
  { 
    id: "INV-003", 
    name: "Calcium Powder", 
    category: "Supplements", 
    currentStock: 120, 
    minStock: 80, 
    unit: "kg", 
    lastRestocked: "2024-11-01", 
    supplier: "AgriFeeds Corp",
    status: "adequate",
    description: "Calcium-rich powder supplement for strong bone development in gamefowl.",
    price: 35.75,
    location: "Warehouse A - Section 3",
    expiryDate: "2025-08-01"
  },
  { 
    id: "INV-004", 
    name: "Antibiotics", 
    category: "Medicine", 
    currentStock: 15, 
    minStock: 30, 
    unit: "boxes", 
    lastRestocked: "2024-09-15", 
    supplier: "VetMed Supply",
    status: "critical",
    description: "Broad-spectrum antibiotics for treating bacterial infections in gamefowl.",
    price: 280.00,
    location: "Storage Room B - Shelf 1",
    expiryDate: "2024-12-15"
  },
  { 
    id: "INV-005", 
    name: "Bedding Materials", 
    category: "Supplies", 
    currentStock: 500, 
    minStock: 200, 
    unit: "kg", 
    lastRestocked: "2024-11-10", 
    supplier: "Farm Supply Co",
    status: "adequate",
    description: "Clean and absorbent bedding materials for comfortable gamefowl housing.",
    price: 12.50,
    location: "Warehouse B - Section 2",
    expiryDate: "2025-12-10"
  },
  { 
    id: "INV-006", 
    name: "Disinfectant", 
    category: "Cleaning", 
    currentStock: 25, 
    minStock: 40, 
    unit: "liters", 
    lastRestocked: "2024-10-25", 
    supplier: "CleanPro Solutions",
    status: "low",
    description: "Industrial-grade disinfectant for maintaining hygienic farm conditions.",
    price: 65.00,
    location: "Storage Room C - Shelf 3",
    expiryDate: "2025-10-25"
  },
  { 
    id: "INV-007", 
    name: "Grit Supplement", 
    category: "Supplements", 
    currentStock: 85, 
    minStock: 60, 
    unit: "kg", 
    lastRestocked: "2024-11-05", 
    supplier: "AgriFeeds Corp",
    status: "adequate",
    description: "Natural grit supplement for proper digestion in gamefowl.",
    price: 18.00,
    location: "Warehouse A - Section 4",
    expiryDate: "2025-07-05"
  },
  { 
    id: "INV-008", 
    name: "Deworming Medicine", 
    category: "Medicine", 
    currentStock: 8, 
    minStock: 25, 
    unit: "bottles", 
    lastRestocked: "2024-08-30", 
    supplier: "VetMed Supply",
    status: "critical",
    description: "Effective deworming medication for internal parasite control.",
    price: 95.00,
    location: "Storage Room B - Shelf 2",
    expiryDate: "2024-11-30"
  }
]

// Calculate inventory statistics
export const getInventoryStats = (items: InventoryItem[]): InventoryStats => {
  const totalItems = items.length
  const lowStockAlerts = items.filter(item => item.status === 'low').length
  const criticalItems = items.filter(item => item.status === 'critical').length
  const monthlySpend = "₱45,230" // This would be calculated from real data

  return {
    totalItems,
    lowStockAlerts,
    criticalItems,
    monthlySpend
  }
}

// Helper functions for status and progress
export const getStatusColor = (status: string) => {
  switch (status) {
    case "adequate": return "bg-green-100 text-green-800"
    case "low": return "bg-yellow-100 text-yellow-800"
    case "critical": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export const getStockProgress = (current: number, min: number) => {
  const percentage = (current / min) * 100
  return Math.min(percentage, 100)
}

export const getProgressColor = (current: number, min: number) => {
  const percentage = (current / min) * 100
  if (percentage >= 100) return "bg-green-500"
  if (percentage >= 50) return "bg-yellow-500"
  return "bg-red-500"
}

// Filter functions
export const filterInventoryItems = (items: InventoryItem[], searchTerm: string) => {
  if (!searchTerm) return items
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  return items.filter(item => 
    item.id.toLowerCase().includes(lowerSearchTerm) ||
    item.name.toLowerCase().includes(lowerSearchTerm) ||
    item.category.toLowerCase().includes(lowerSearchTerm) ||
    item.supplier.toLowerCase().includes(lowerSearchTerm)
  )
}

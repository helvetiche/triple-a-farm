// Mock data and interfaces for sales and transaction management

export interface SalesTransaction {
  id: string
  date: string
  roosterId: string
  breed: string
  customerName: string
  customerContact: string
  amount: number
  paymentMethod: "cash" | "gcash" | "bank_transfer" | "paypal"
  status: "completed" | "pending" | "cancelled"
  notes?: string
  paymentStatus: "paid" | "partial" | "unpaid"
  commission?: number
  agentName?: string
  amountPaid?: number // Total amount paid so far
  lastPaymentDate?: string // Date of last payment
  lastPaymentAmount?: number // Amount of last payment
  paymentNotes?: string // Notes about payment
}

export interface SalesStats {
  totalRevenue: number
  totalTransactions: number
  pendingTransactions: number
  averageSaleAmount: number
  monthlyGrowth: number
  topBreed: string
}

export interface RevenueTrend {
  date: string
  revenue: number
  transactions: number
}

export interface PaymentSettings {
  acceptedMethods: string[]
  requireDeposit: boolean
  depositPercentage: number
  autoConfirmPayment: boolean
  paymentInstructions: string
}

// Mock sales transactions
export const mockSalesTransactions: SalesTransaction[] = [
  { 
    id: "SALE-001", 
    date: "2024-11-20", 
    roosterId: "TR-002", 
    breed: "Sweater", 
    customerName: "Juan Dela Cruz",
    customerContact: "+639123456789",
    amount: 18500, 
    paymentMethod: "cash",
    status: "completed",
    paymentStatus: "paid",
    notes: "Customer satisfied with the rooster quality",
    commission: 1850,
    agentName: "Agent Smith",
    amountPaid: 18500,
    lastPaymentDate: "2024-11-20",
    lastPaymentAmount: 18500
  },
  { 
    id: "SALE-002", 
    date: "2024-11-19", 
    roosterId: "TR-003", 
    breed: "Roundhead", 
    customerName: "Carlos Santos",
    customerContact: "+639987654321",
    amount: 12000, 
    paymentMethod: "gcash",
    status: "completed",
    paymentStatus: "paid",
    commission: 1200,
    agentName: "Agent Johnson",
    amountPaid: 12000,
    lastPaymentDate: "2024-11-19",
    lastPaymentAmount: 12000
  },
  { 
    id: "SALE-003", 
    date: "2024-11-18", 
    roosterId: "TR-005", 
    breed: "Kelso", 
    customerName: "Miguel Reyes",
    customerContact: "+639456789123",
    amount: 22000, 
    paymentMethod: "bank_transfer",
    status: "pending",
    paymentStatus: "partial",
    notes: "Waiting for remaining payment confirmation",
    commission: 2200,
    agentName: "Agent Davis",
    amountPaid: 10000,
    lastPaymentDate: "2024-11-18",
    lastPaymentAmount: 10000,
    paymentNotes: "Initial payment via bank transfer"
  },
  { 
    id: "SALE-004", 
    date: "2024-11-17", 
    roosterId: "TR-007", 
    breed: "Hatch", 
    customerName: "Roberto Garcia",
    customerContact: "+639789123456",
    amount: 15000, 
    paymentMethod: "cash",
    status: "pending",
    paymentStatus: "unpaid",
    notes: "Payment to be made upon delivery",
    commission: 1500,
    agentName: "Agent Wilson",
    amountPaid: 0,
    lastPaymentDate: undefined,
    lastPaymentAmount: 0
  },
  { 
    id: "SALE-005", 
    date: "2024-11-16", 
    roosterId: "TR-008", 
    breed: "Grey", 
    customerName: "Antonio Martinez",
    customerContact: "+639234567890",
    amount: 16000, 
    paymentMethod: "gcash",
    status: "pending",
    paymentStatus: "partial",
    notes: "Partial payment received, remaining balance due next week",
    commission: 1600,
    agentName: "Agent Chen",
    amountPaid: 8000,
    lastPaymentDate: "2024-11-16",
    lastPaymentAmount: 8000,
    paymentNotes: "50% payment via GCash"
  },
  { 
    id: "SALE-006", 
    date: "2024-11-15", 
    roosterId: "TR-011", 
    breed: "Butcher", 
    customerName: "Francisco Torres",
    customerContact: "+639654987321",
    amount: 19500, 
    paymentMethod: "gcash",
    status: "completed",
    paymentStatus: "paid",
    commission: 1950,
    agentName: "Agent Anderson",
    amountPaid: 19500,
    lastPaymentDate: "2024-11-15",
    lastPaymentAmount: 19500
  },
  { 
    id: "SALE-007", 
    date: "2024-11-14", 
    roosterId: "TR-013", 
    breed: "Grey", 
    customerName: "Javier Ramos",
    customerContact: "+639147258369",
    amount: 16500, 
    paymentMethod: "cash",
    status: "pending",
    paymentStatus: "unpaid",
    notes: "Payment expected within 3 days",
    commission: 1650,
    agentName: "Agent Thomas",
    amountPaid: 0,
    lastPaymentDate: undefined,
    lastPaymentAmount: 0
  },
  { 
    id: "SALE-008", 
    date: "2024-11-13", 
    roosterId: "TR-015", 
    breed: "Claret", 
    customerName: "Manuel Castillo",
    customerContact: "+639258369147",
    amount: 24500, 
    paymentMethod: "bank_transfer",
    status: "completed",
    paymentStatus: "paid",
    commission: 2450,
    agentName: "Agent Jackson",
    amountPaid: 24500,
    lastPaymentDate: "2024-11-13",
    lastPaymentAmount: 24500
  }
]

// Mock sales statistics
export const mockSalesStats: SalesStats = {
  totalRevenue: 156000,
  totalTransactions: 8,
  pendingTransactions: 2,
  averageSaleAmount: 19500,
  monthlyGrowth: 12.5,
  topBreed: "Sweater"
}

// Mock revenue trend data for the past 30 days
export const mockRevenueTrend: RevenueTrend[] = [
  { date: "2024-10-21", revenue: 12000, transactions: 1 },
  { date: "2024-10-22", revenue: 0, transactions: 0 },
  { date: "2024-10-23", revenue: 18500, transactions: 1 },
  { date: "2024-10-24", revenue: 15000, transactions: 1 },
  { date: "2024-10-25", revenue: 0, transactions: 0 },
  { date: "2024-10-26", revenue: 22000, transactions: 1 },
  { date: "2024-10-27", revenue: 28000, transactions: 1 },
  { date: "2024-10-28", revenue: 0, transactions: 0 },
  { date: "2024-10-29", revenue: 19500, transactions: 1 },
  { date: "2024-10-30", revenue: 16500, transactions: 1 },
  { date: "2024-10-31", revenue: 24500, transactions: 1 },
  { date: "2024-11-01", revenue: 0, transactions: 0 },
  { date: "2024-11-02", revenue: 12000, transactions: 1 },
  { date: "2024-11-03", revenue: 0, transactions: 0 },
  { date: "2024-11-04", revenue: 18500, transactions: 1 },
  { date: "2024-11-05", revenue: 15000, transactions: 1 },
  { date: "2024-11-06", revenue: 0, transactions: 0 },
  { date: "2024-11-07", revenue: 22000, transactions: 1 },
  { date: "2024-11-08", revenue: 28000, transactions: 1 },
  { date: "2024-11-09", revenue: 0, transactions: 0 },
  { date: "2024-11-10", revenue: 19500, transactions: 1 },
  { date: "2024-11-11", revenue: 16500, transactions: 1 },
  { date: "2024-11-12", revenue: 24500, transactions: 1 },
  { date: "2024-11-13", revenue: 0, transactions: 0 },
  { date: "2024-11-14", revenue: 12000, transactions: 1 },
  { date: "2024-11-15", revenue: 18500, transactions: 1 },
  { date: "2024-11-16", revenue: 15000, transactions: 1 },
  { date: "2024-11-17", revenue: 0, transactions: 0 },
  { date: "2024-11-18", revenue: 22000, transactions: 1 },
  { date: "2024-11-19", revenue: 28000, transactions: 1 },
  { date: "2024-11-20", revenue: 19500, transactions: 1 }
]

// Mock payment settings
export const mockPaymentSettings: PaymentSettings = {
  acceptedMethods: ["cash", "gcash", "bank_transfer"],
  requireDeposit: true,
  depositPercentage: 30,
  autoConfirmPayment: false,
  paymentInstructions: "Please ensure full payment is received before releasing the rooster. For GCash, send payment to 09123456789. For bank transfers, use BPI Account: 1234567890."
}

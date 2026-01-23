// Types and interfaces for sales and transaction management

export interface SalesTransaction {
  id: string // Firestore document ID
  transactionId?: string // Formatted display ID (e.g., #U9S2-1220)
  date: string
  roosterId: string
  breed: string
  customerName: string
  customerContact: string
  amount: number
  paymentMethod: "cash" | "gcash" | "bank_transfer" | "paypal"
  notes?: string
  commission?: number
  agentName?: string
}

export interface SalesStats {
  totalRevenue: number
  totalTransactions: number
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


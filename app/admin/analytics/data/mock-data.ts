// Type definitions for analytics and reporting

export interface AnalyticsStats {
  totalRevenue: number
  totalSales: number
  averageSale: number
  topBreed: string
  monthlyGrowth: number
  yearlyGrowth: number
  monthlySalesGrowth: number
  totalCustomers: number
  activeRoosters: number
}

export interface MonthlyData {
  month: string
  revenue: number
  sales: number
  profit: number
  customers: number
}

export interface BreedData {
  breed: string
  sales: number
  revenue: number
  percentage: number
}

export interface HealthMetrics {
  date: string
  overallHealth: number
  vaccinationCoverage: number
  diseaseIncidence: number
  mortalityRate: number
  averageWeight: number
}

export interface CustomerRating {
  date: string
  rating: number
  customerId: string
  transactionId: string
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

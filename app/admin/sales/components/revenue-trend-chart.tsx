"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar } from "lucide-react"
import { RevenueTrend } from "../types"

interface RevenueTrendChartProps {
  data: RevenueTrend[]
  title?: string
  description?: string
}

export function RevenueTrendChart({ 
  data, 
  title = "Sales Overview", 
  description = "Daily revenue and transaction trends" 
}: RevenueTrendChartProps) {
  // Format data for the chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    revenue: item.revenue,
    transactions: item.transactions,
  }))

  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0)
  const averageRevenue = totalRevenue / data.length || 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            Revenue: ₱{payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600">
            Transactions: {payload[1].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-[#1f3f2c] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#3d6c58]" />
              {title}
            </CardTitle>
            <CardDescription className="text-[#4a6741]">
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3d6c58"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1f3f2c]">
              ₱{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-[#4a6741]">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1f3f2c]">
              {totalTransactions}
            </p>
            <p className="text-xs text-[#4a6741]">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1f3f2c]">
              ₱{Math.round(averageRevenue).toLocaleString()}
            </p>
            <p className="text-xs text-[#4a6741]">Daily Average</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

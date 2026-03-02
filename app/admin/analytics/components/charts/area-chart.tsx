"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from "recharts"

interface AreaChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    value2?: number
  }>
  height?: number
  color?: string
  color2?: string
}

export function SimpleAreaChart({ 
  title, 
  description, 
  data, 
  height = 256,
  color = '#3d6c58',
  color2 = '#82c91e'
}: AreaChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    revenue: item.value,
    profit: item.value2 || 0
  }))
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200" style={{ borderRadius: 0 }}>
          <p className="font-semibold text-[#1f3f2c]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₱{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }
  
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stackId="2"
              stroke={color2}
              fill={color2}
              fillOpacity={0.3}
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface LineChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
  }>
  height?: number
  color?: string
}

export function SimpleLineChart({ 
  title, 
  description, 
  data, 
  height = 256,
  color = '#3d6c58'
}: LineChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value
  }))
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200" style={{ borderRadius: 0 }}>
          <p className="font-semibold text-[#1f3f2c]">{label}</p>
          <p className="text-sm" style={{ color }}>
            Health Score: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Health Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

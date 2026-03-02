"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts"

interface BarChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  height?: number
}

export function SimpleBarChart({ 
  title, 
  description, 
  data, 
  height = 256 
}: BarChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    fill: item.color || '#3d6c58'
  }))
  
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 0
              }}
              labelStyle={{ color: '#1f3f2c', fontWeight: 'bold' }}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface HorizontalBarChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    percentage?: number
    color?: string
  }>
}

export function HorizontalBarChart({ 
  title, 
  description, 
  data 
}: HorizontalBarChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    sales: item.value,
    fill: item.color || '#3d6c58'
  }))
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200" style={{ borderRadius: 0 }}>
          <p className="font-semibold text-[#1f3f2c]">{data.name}</p>
          <p className="text-sm text-gray-600">Sales: {data.sales}</p>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="sales" 
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

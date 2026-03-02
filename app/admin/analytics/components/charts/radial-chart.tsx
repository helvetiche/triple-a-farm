"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"

interface RadialChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    maxValue: number
    color?: string
  }>
  height?: number
}

export function SimpleRadialChart({ 
  title, 
  description, 
  data, 
  height = 300
}: RadialChartProps) {
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    fill: item.color || '#3d6c58'
  }))
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / 100) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border border-gray-200" style={{ borderRadius: 0 }}>
          <p className="font-semibold text-[#1f3f2c]">{data.name}</p>
          <p className="text-sm" style={{ color: data.fill }}>
            Score: {data.value}%
          </p>
          <p className="text-sm text-gray-600">
            Performance: {percentage}%
          </p>
        </div>
      )
    }
    return null
  }
  
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="10%" 
            outerRadius="80%" 
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={0}
              fill="#3d6c58"
              label={{ position: 'insideStart', fill: '#fff' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: '20px'
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* Performance Summary */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-[#1f3f2c]">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3" 
                    style={{ backgroundColor: item.color || '#3d6c58' }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {item.value}%
                  </div>
                  <div className="w-12 bg-gray-200 h-1 mt-1" style={{ borderRadius: 0 }}>
                    <div
                      className="h-1"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: item.color || '#3d6c58',
                        borderRadius: 0
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PerformanceRadialChartProps {
  title: string
  description: string
  data: Array<{
    date: string
    overallHealth: number
    vaccinationCoverage: number
    diseaseIncidence: number
    mortalityRate: number
    averageWeight: number
  }>
}

export function PerformanceRadialChart({ title, description, data }: PerformanceRadialChartProps) {
  // Use the latest data point for current values
  const latestData = data[data.length - 1]
  
  const radialData = [
    {
      label: "Health Score",
      value: latestData.overallHealth,
      maxValue: 100,
      color: '#3d6c58'
    },
    {
      label: "Vaccination",
      value: latestData.vaccinationCoverage,
      maxValue: 100,
      color: '#82c91e'
    },
    {
      label: "Low Disease",
      value: 100 - latestData.diseaseIncidence, // Invert so higher is better
      maxValue: 100,
      color: '#4c6ef5'
    },
    {
      label: "Low Mortality",
      value: 100 - latestData.mortalityRate, // Invert so higher is better
      maxValue: 100,
      color: '#f59f00'
    }
  ]
  
  return (
    <SimpleRadialChart
      title={title}
      description={description}
      data={radialData}
    />
  )
}

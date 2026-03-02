"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface RadarChartProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    maxValue: number
  }>
  height?: number
  color?: string
}

export function SimpleRadarChart({ 
  title, 
  description, 
  data, 
  height = 300,
  color = '#3d6c58'
}: RadarChartProps) {
  const chartData = data.map(item => ({
    subject: item.label,
    value: item.value,
    fullMark: item.maxValue
  }))
  
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
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-full">
            <ResponsiveContainer width="100%" height={height}>
              <RadarChart data={chartData}>
                <PolarGrid 
                  stroke="#e5e7eb"
                  radialLines={true}
                />
                <PolarAngleAxis 
                  dataKey="subject"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar
                  name="Health Metrics"
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 0
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex-1 space-y-3">
            <h4 className="text-sm font-medium text-[#1f3f2c] mb-2">Metrics</h4>
            {data.map((item, index) => {
              const percentage = (item.value / item.maxValue) * 100
              return (
                <div key={index} className="flex items-center justify-between p-2 border">
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.value} / {item.maxValue}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="w-16 bg-gray-200 h-2 mt-1" style={{ borderRadius: 0 }}>
                      <div
                        className="h-2"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                          borderRadius: 0
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface HealthRadarChartProps {
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

export function HealthRadarChart({ title, description, data }: HealthRadarChartProps) {
  const latestData = data[data.length - 1]
  
  const radarData = [
    {
      label: "Health Score",
      value: latestData.overallHealth,
      maxValue: 100
    },
    {
      label: "Vaccination",
      value: latestData.vaccinationCoverage,
      maxValue: 100
    },
    {
      label: "Low Disease",
      value: 100 - latestData.diseaseIncidence,
      maxValue: 100
    },
    {
      label: "Low Mortality",
      value: 100 - latestData.mortalityRate,
      maxValue: 100
    },
    {
      label: "Weight",
      value: (latestData.averageWeight / 5) * 100,
      maxValue: 100
    }
  ]
  
  return (
    <SimpleRadarChart
      title={title}
      description={description}
      data={radarData}
      color="#3d6c58"
    />
  )
}

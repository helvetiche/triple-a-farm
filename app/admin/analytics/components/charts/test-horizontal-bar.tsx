"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TestHorizontalBarProps {
  title: string
  description: string
  data: Array<{
    label: string
    value: number
    percentage?: number
    color?: string
  }>
}

export function TestHorizontalBar({ 
  title, 
  description, 
  data 
}: TestHorizontalBarProps) {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600 truncate">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div className="w-full bg-gray-200 h-6" style={{ borderRadius: 0 }}>
                  <div
                    className="h-6"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || '#3d6c58',
                      borderRadius: 0
                    }}
                  />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-16 text-sm text-right font-medium text-gray-700">
                ₱{item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Debug info */}
        <div className="mt-4 p-2 bg-gray-100 text-xs">
          <div>Debug - Raw Data:</div>
          {data.map((item, index) => (
            <div key={index}>
              {JSON.stringify(item)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

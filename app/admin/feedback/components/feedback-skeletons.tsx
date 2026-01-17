import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeedbackStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
          <CardHeader className="pb-2" style={{ borderRadius: 0 }}>
            <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
          </CardHeader>
          <CardContent style={{ borderRadius: 0 }}>
            <div className="h-8 w-20 bg-gray-200 animate-pulse mb-2"></div>
            <div className="h-4 w-16 bg-gray-200 animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ReviewsTableSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
      <CardHeader style={{ borderRadius: 0 }}>
        <div className="h-6 w-40 bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
      </CardHeader>
      <CardContent style={{ borderRadius: 0 }}>
        <div className="space-y-3 sm:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border p-4" style={{ borderRadius: 0 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 animate-pulse"></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-4 w-28 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-36 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
              </div>
              <div className="mt-3 h-10 w-full bg-gray-200 animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block w-full overflow-x-auto">
          <div className="min-w-[720px] space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border">
                <div className="h-4 w-20 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2 min-w-0">
        <div className="h-9 w-64 bg-gray-200 animate-pulse"></div>
        <div className="h-5 w-80 bg-gray-200 animate-pulse"></div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="h-10 w-full sm:w-32 bg-gray-200 animate-pulse"></div>
        <div className="h-10 w-full sm:w-32 bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  )
}

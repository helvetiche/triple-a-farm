import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-[#3d6c58]/20">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function RevenueChartSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full space-y-4">
            <div className="flex items-end justify-between h-32 px-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="w-8 h-16" />
              ))}
            </div>
            <div className="flex justify-between px-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="h-3 w-6" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HealthMetricsSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 border">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function HealthChartSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-none" />
        </div>
      </CardContent>
    </Card>
  )
}

export function BreedPerformanceSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function CustomerRatingsSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-12 mx-auto rounded-none" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-full sm:w-32" />
    </div>
  )
}

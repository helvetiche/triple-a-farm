import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Stats Cards Skeleton
export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-[#3d6c58]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Filters Skeleton
export function FiltersSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full pl-10" />
            <Skeleton className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <Skeleton className="h-10 w-full sm:w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

// Table Skeleton
export function TableSkeleton() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[720px] space-y-3">
            {/* Table header */}
            <div className="flex items-center space-x-4 py-2 border-b">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-4 flex-1" />
              ))}
            </div>
            
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center space-x-4 py-3 border-b">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 flex-1" />
                ))}
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Page Header Skeleton
export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-full sm:w-32" />
    </div>
  )
}

// Tabs Skeleton
export function TabsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Tabs list */}
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32" />
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="space-y-4">
        <FiltersSkeleton />
        <TableSkeleton />
      </div>
    </div>
  )
}

// Suppliers Card Skeleton
export function SuppliersCardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border-[#3d6c58]/20">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-6" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Alert Card Skeleton
export function AlertCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-5" />
            <div>
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

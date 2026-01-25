"use client"

import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bird, Package, AlertTriangle, TrendingUp, Users, Calendar, ArrowRight, PhilippinePeso, ZoomIn } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getRoosterStats, type Rooster } from "./data/roosters"
import { exportDashboardToExcel } from "./utils/export-dashboard"
import { DateRangeSelector } from "./analytics/components/date-range-selector"
import type { DateRange } from "./analytics/data/mock-data"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"

import Zoom from "yet-another-react-lightbox/plugins/zoom"
import { useLightbox } from "@/hooks/use-lightbox"

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false })

export const iframeHeight = "800px"

export const description = "Triple A Gamefarm Dashboard"

interface Activity {
  action: string
  detail: string
  time: string
  icon: string
}

const iconMap: Record<string, typeof Bird> = {
  Bird,
  PhilippinePeso,
  Package,
  Users,
}

export default function Page() {
  // Auth
  const { userData } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [roosters, setRoosters] = useState<Rooster[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    reserved: 0,
    quarantine: 0,
    totalValue: 0,
    availableValue: 0,
    averagePrice: 0,
    topBreed: "N/A",
  })
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  })

  // Fetch roosters and activities from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [roostersResponse, activitiesResponse] = await Promise.all([
          fetch("/api/roosters"),
          fetch("/api/dashboard/activity"),
        ])
        
        const roostersResult = await roostersResponse.json()
        if (roostersResult.success) {
          const fetchedRoosters = roostersResult.data || []
          setRoosters(fetchedRoosters)
          setStats(getRoosterStats(fetchedRoosters))
        }

        const activitiesResult = await activitiesResponse.json()
        if (activitiesResult.success) {
          setActivities(activitiesResult.data || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get featured roosters (first 3 available roosters)
  const featuredRoosters = roosters
    .filter(r => r.status === 'Available')
    .slice(0, 3)

  const handleExportReport = async () => {
    try {
      const exportedBy = userData 
        ? `${userData.firstName} ${userData.lastName} (${userData.email})`
        : "Unknown"
      await exportDashboardToExcel(stats, roosters, activities, selectedDateRange, exportedBy)
      toast.success("Dashboard report exported successfully!")
    } catch (error) {
      console.error("Error exporting dashboard:", error)
      toast.error("Failed to export report. Please try again.")
    }
  }

  const slides = useMemo(
    () =>
      featuredRoosters.map((rooster) => ({
        src: rooster.image || "/images/roosters/rooster-sample.jpg",
        alt: `${rooster.breed} - ${rooster.id}`,
      })),
    [featuredRoosters]
  )

  const lightbox = useLightbox(slides)

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              {/* Page Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-9 w-32 mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#1f3f2c]">Dashboard</h1>
                      <p className="text-[#4a6741] text-sm sm:text-base">Farm operational status and key metrics</p>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-8 w-28" />
                      <Skeleton className="h-8 w-24" />
                    </>
                  ) : (
                    <>
                      <DateRangeSelector
                        initialDateRange={selectedDateRange}
                        onDateRangeChange={setSelectedDateRange}
                      />
                      <Button 
                        size="sm" 
                        className="bg-[#3d6c58] hover:bg-[#4e816b] w-full sm:w-auto"
                        onClick={handleExportReport}
                      >
                        Export Report
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                  // Skeleton cards
                  Array.from({ length: 4 }).map((_: any, i: number) => (
                    <Card key={i} className="border-[#3d6c58]/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="border-[#3d6c58]/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#1f3f2c]">
                          Total Roosters
                        </CardTitle>
                        <Bird className="h-4 w-4 text-[#3d6c58]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#1f3f2c]">{stats.total}</div>
                        <p className="text-xs text-[#4a6741]">
                          <span className="text-green-600">{stats.available} available</span> for sale
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-[#3d6c58]/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#1f3f2c]">
                          Total Value
                        </CardTitle>
                        <PhilippinePeso className="h-4 w-4 text-[#3d6c58]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#1f3f2c]">₱{stats.totalValue.toLocaleString()}</div>
                        <p className="text-xs text-[#4a6741]">
                          <span className="text-green-600">₱{stats.availableValue.toLocaleString()}</span> in available stock
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-[#3d6c58]/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#1f3f2c]">
                          Sold Roosters
                        </CardTitle>
                        <Package className="h-4 w-4 text-[#3d6c58]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#1f3f2c]">{stats.sold}</div>
                        <p className="text-xs text-[#4a6741]">
                          <span className="text-blue-600">{Math.round((stats.sold / stats.total) * 100)}%</span> sold rate
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-[#3d6c58]/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-[#1f3f2c]">
                          Health Status
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-[#3d6c58]" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[#1f3f2c]">{stats.quarantine}</div>
                        <p className="text-xs text-[#4a6741]">
                          <span className="text-orange-600">{stats.quarantine}</span> in quarantine
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Quick Actions & Featured Roosters */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <Card className="border-[#3d6c58]/20 lg:col-span-1">
                  <CardHeader>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-6 w-28 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-[#1f3f2c]">Quick Actions</CardTitle>
                        <CardDescription>Common farm management tasks</CardDescription>
                      </>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isLoading ? (
                      // Skeleton buttons
                      Array.from({ length: 4 }).map((_: any, i: number) => (
                        <Skeleton key={i} className="h-9 w-full" />
                      ))
                    ) : (
                      <>
                        <Button asChild className="w-full justify-start bg-[#3d6c58] hover:bg-[#4e816b]">
                          <Link href="/admin/roosters/add">
                            <Bird className="w-4 h-4" />
                            Add New Rooster
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href="/admin/inventory">
                            <Package className="w-4 h-4" />
                            Check Inventory
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href="/admin/sales">
                            <PhilippinePeso className="w-4 h-4" />
                            Record Sale
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href="/admin/analytics">
                            <TrendingUp className="w-4 h-4 " />
                            View Analytics
                          </Link>
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Featured Roosters */}
                <Card className="border-[#3d6c58]/20 lg:col-span-2">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      {isLoading ? (
                        <>
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-40" />
                        </>
                      ) : (
                        <>
                          <CardTitle className="text-[#1f3f2c]">Featured Roosters</CardTitle>
                          <CardDescription>Premium roosters available for sale</CardDescription>
                        </>
                      )}
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <Link href="/admin/roosters">
                          View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      // Skeleton roosters
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_: any, i: number) => (
                          <div key={i} className="border p-4 space-y-2">
                            <Skeleton className="aspect-square w-full mb-3" />
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredRoosters.map((rooster, index) => (
                          <div key={rooster.id} className="border p-4 space-y-2">
                            <div className="group relative aspect-square bg-[#c7e8d3] mb-3 overflow-hidden">
                              <div className="absolute inset-0 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  aria-label={`Preview ${rooster.breed} ${rooster.id}`}
                                  className="absolute inset-0 flex items-center justify-center bg-[#3d6c58]/70 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    lightbox.openAt(index)
                                  }}
                                >
                                  <ZoomIn className="h-8 w-8 text-white" />
                                </button>
                              </div>
                              <Image
                                src={rooster.image || "/images/roosters/rooster-sample.jpg"}
                                alt={`${rooster.breed} - ${rooster.id}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {rooster.id}
                              </Badge>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                {rooster.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-[#1f3f2c]">{rooster.breed}</h3>
                            <p className="text-sm text-[#4a6741]">{rooster.age}</p>
                            <p className="font-bold text-[#3d6c58]">₱{parseInt(rooster.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Lightbox
                open={lightbox.open}
                close={lightbox.close}
                slides={lightbox.slides}
                index={lightbox.index}
                plugins={[Zoom]}
                carousel={{ finite: true }}
                controller={{ closeOnBackdropClick: true, closeOnPullDown: false, closeOnPullUp: false }}
                render={{ buttonPrev: () => null, buttonNext: () => null }}
              />

              {/* Recent Activity */}
              <Card className="border-[#3d6c58]/20">
                <CardHeader>
                  {isLoading ? (
                    <>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-[#1f3f2c]">Recent Activity</CardTitle>
                      <CardDescription>Latest farm operations and updates</CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    // Skeleton activities
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_: any, i: number) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-5 w-5" />
                          <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.slice(0, 4).map((activity, index) => {
                        const Icon = iconMap[activity.icon] || Bird
                        return (
                          <div key={index} className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Icon className="h-5 w-5 text-[#3d6c58]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1f3f2c]">{activity.action}</p>
                              <p className="text-sm text-[#4a6741]">{activity.detail}</p>
                            </div>
                            <div className="flex-shrink-0 text-xs text-[#4a6741]">
                              {activity.time}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

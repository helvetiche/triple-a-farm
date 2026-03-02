'use client'

import { Suspense } from "react"
import { SalesClient } from "./components/sales-client"
import { StatsCardsSkeleton, PageHeaderSkeleton, TabsSkeleton } from "../inventory/components"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeaderSkeleton />
                <StatsCardsSkeleton />
                <TabsSkeleton />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    }>
      <SalesClient />
    </Suspense>
  )
}

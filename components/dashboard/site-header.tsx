"use client"

import { SidebarIcon } from "lucide-react"

import { NotificationPanel } from "@/components/dashboard/notification-panel"
import { DynamicBreadcrumb } from "@/components/dashboard/dynamic-breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

export function SiteHeader() {
  const { toggleSidebar, state } = useSidebar()

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b border-[#3d6c58]/20">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex items-center justify-center shrink-0">
            <Button
              className="h-10 w-10 flex items-center justify-center"
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <SidebarIcon className="h-4 w-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-4 mr-1 hidden sm:block" />
          <div className="min-w-0 flex-1">
            <DynamicBreadcrumb />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <div className="flex items-center justify-center shrink-0">
            <NotificationPanel />
          </div>
        </div>
      </div>
    </header>
  )
}

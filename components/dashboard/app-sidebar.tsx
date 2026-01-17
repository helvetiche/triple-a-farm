"use client"

import * as React from "react"
import {
  Home,
  Bird,
  Package,
  PhilippinePeso,
  BarChart3,
  Star,
  LifeBuoy,
  Send,
  Settings2,
  Users,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Triple A GameFarm",
    email: "tripleagamefarm5@gmail.com",
    avatar: "/avatars/profile.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Rooster Management",
      url: "/admin/roosters",
      icon: Bird,
    },
    {
      title: "Farm Inventory",
      url: "/admin/inventory",
      icon: Package,
    },
    {
      title: "Sales & Transactions",
      url: "/admin/sales",
      icon: PhilippinePeso,
    },
    {
      title: "Analytics & Reports",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Feedback & Ratings",
      url: "/admin/feedback",
      icon: Star,
    },
  ],
  navSecondary: [],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="h-svh!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <img src="/images/logo-png.png" alt="Triple A Gamefarm" className="size-6 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Triple A Gamefarm</span>
                  <span className="truncate text-xs">Management System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className="gap-3">
        {items.map((item) => {
          const isCurrentPage = pathname === item.url
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                className={`py-4 text-sm h-12 ${
                  isCurrentPage 
                    ? "bg-[#c7e8d3]/50 text-[#1f3f2c] hover:bg-[#c7e8d3]/70" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

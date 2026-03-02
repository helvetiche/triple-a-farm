"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const breadcrumbConfig: Record<string, { label: string; href?: string }> = {
  "/admin": { label: "Dashboard" },
  "/admin/roosters": { label: "Rooster Management" },
  "/admin/roosters/add": { label: "Add Rooster", href: "/admin/roosters" },
  "/admin/roosters/edit": { label: "Edit Rooster", href: "/admin/roosters" },
  "/admin/inventory": { label: "Inventory Management" },
  "/admin/sales": { label: "Sales & Transactions" },
  "/admin/analytics": { label: "Analytics & Reports" },
  "/admin/feedback": { label: "Feedback & Ratings" },
  "/admin/settings": { label: "Settings" },
  "/admin/settings/password": { label: "Password Settings", href: "/admin/settings" },
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  
  // Debug: Log current pathname
  console.log("Current pathname:", pathname)

  // Get the breadcrumb items for the current path
  const getBreadcrumbItems = () => {
    const items = []
    
    // Always add the home link
    items.push({
      label: "Triple A Gamefarm",
      href: "/admin",
    })

    // Add current page if it's not the admin dashboard
    if (pathname !== "/admin") {
      // Handle dynamic edit pages with IDs
      if (pathname.startsWith("/admin/roosters/edit/")) {
        // Add parent page
        items.push({
          label: "Rooster Management",
          href: "/admin/roosters",
        })
        // Add current page
        const roosterId = pathname.split("/").pop()
        items.push({
          label: `Edit Rooster ${roosterId}`,
          href: undefined, // Current page, not clickable
        })
      } else {
        const currentPage = breadcrumbConfig[pathname]
        console.log("Found breadcrumb for pathname:", currentPage) // Debug
        if (currentPage) {
          if (currentPage.href) {
            // Add parent page if exists
            const parentPage = breadcrumbConfig[currentPage.href]
            if (parentPage) {
              items.push({
                label: parentPage.label,
                href: currentPage.href,
              })
            }
          }
          items.push({
            label: currentPage.label,
            href: currentPage.href,
          })
        } else {
          // If no specific mapping, show a generic breadcrumb
          const pathParts = pathname.split("/").filter(Boolean)
          if (pathParts.length > 1) {
            items.push({
              label: pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1),
              href: undefined,
            })
          }
        }
      }
    }

    return items
  }

  const items = getBreadcrumbItems()

  return (
    <Breadcrumb className="block min-w-0">
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={`${item.href || item.label}-${index}`} className="flex min-w-0 items-center">
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="text-[#4a6741] truncate">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href} className="text-[#1f3f2c] truncate">
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator className="shrink-0" />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

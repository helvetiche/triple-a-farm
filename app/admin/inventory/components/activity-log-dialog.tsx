"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, TrendingUp, TrendingDown, User, Calendar } from "lucide-react"
import { InventoryItem } from "../data/mock-data"
import { formatInventoryDisplayId } from "@/lib/inventory-types"
import type { InventoryActivity } from "@/lib/inventory-types"
import { toastCRUD } from "../utils/toast"
import { Spinner } from "@/components/ui/spinner"

interface ActivityLogDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityLogDialog({
  item,
  open,
  onOpenChange,
}: ActivityLogDialogProps) {
  const [activities, setActivities] = useState<InventoryActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && item) {
      loadActivities()
    }
  }, [open, item])

  const loadActivities = async () => {
    if (!item) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/inventory/${item.id}/activity`)
      const json = await response.json()

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError()
        } else {
          toastCRUD.loadError("activity logs")
        }
        return
      }

      setActivities(json.data)
    } catch (error) {
      console.error("Failed to load activity logs:", error)
      toastCRUD.networkError()
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-[#3d6c58]" />
            <div>
              <DialogTitle className="text-xl">Activity Log</DialogTitle>
              <DialogDescription>
                {item.name} - {formatInventoryDisplayId(item)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px] w-full pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
              <span className="ml-2 text-gray-600">Loading activity logs...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No activity logs found</p>
              <p className="text-sm text-gray-500 mt-1">
                Activity will appear here when items are restocked or consumed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-none p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-none ${
                          activity.type === "restock"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {activity.type === "restock" ? (
                          <TrendingUp
                            className={`h-5 w-5 ${
                              activity.type === "restock"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            className={
                              activity.type === "restock"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {activity.type === "restock" ? "Restocked" : "Consumed"}
                          </Badge>
                          <span className="font-semibold text-[#1f3f2c]">
                            {activity.type === "restock" ? "+" : "-"}
                            {activity.amount} {activity.unit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Reason:</span>{" "}
                          {activity.reason}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{activity.performedBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(activity.performedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Stock Change</div>
                      <div className="text-sm font-medium text-gray-700">
                        {activity.previousStock} → {activity.newStock} {activity.unit}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Calendar, 
  Package, 
  MapPin, 
  Edit, 
  Trash2,
  AlertTriangle,
  Building,
  PhilippinePeso,
  Plus,
  Minus,
  History
} from "lucide-react"
import { InventoryItem } from "../data/mock-data"
import { formatInventoryDisplayId } from "@/lib/inventory-types"

interface InventoryViewDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRestock?: (id: string) => void
  onConsume?: (id: string) => void
  onViewActivity?: (id: string) => void
}

export function InventoryViewDialog({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onRestock,
  onConsume,
  onViewActivity,
}: InventoryViewDialogProps) {
  if (!item) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "adequate": return "bg-green-100 text-green-800"
      case "low": return "bg-yellow-100 text-yellow-800"
      case "critical": return "bg-red-100 text-red-800"
      default: return "bg-green-100 text-gray-800"
    }
  }

  const getStockProgress = (current: number, min: number) => {
    const percentage = (current / min) * 100
    return Math.min(percentage, 100)
  }

  const getProgressColor = (current: number, min: number) => {
    const percentage = (current / min) * 100
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const stockPercentage = getStockProgress(item.currentStock, item.minStock)
  const isLowStock = item.status !== "adequate"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl">{item.name}</DialogTitle>
                <DialogDescription>Item ID: {formatInventoryDisplayId(item)}</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {/* Status Section */}
            <div className="bg-green-50  p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                  {isLowStock && (
                    <div className="flex items-center gap-1 text-sm text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Attention needed</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {formatInventoryDisplayId(item)}
                </div>
              </div>
            </div>

          {/* Stock Information Card */}
          <div className="bg-white  border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-[#1f3f2c] mb-4 flex items-center gap-2">
              Stock Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                  <Package className="h-4 w-4" />
                  <span>Current Stock Level</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-md font-bold text-[#1f3f2c]">
                      {item.currentStock}
                    </span>
                    <span className="text-gray-500">/</span>
                    <span className="text-md text-gray-600">
                      {item.minStock} {item.unit}
                    </span>
                  </div>
                  <p className="text-sm text-[#4a6741] font-medium">
                    {stockPercentage >= 100 
                      ? "Adequate stock" 
                      : stockPercentage >= 50 
                      ? "Low stock - consider restocking" 
                      : "Critical - restock immediately"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                  <Calendar className="h-4 w-4" />
                  <span>Restocking Information</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Last Restocked</p>
                    <p className="text-md font-semibold text-[#1f3f2c]">{item.lastRestocked}</p>
                  </div>
                  {item.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-500">Expires</p>
                      <p className="text-md font-semibold text-[#1f3f2c]">{item.expiryDate}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Item Details Card */}
          <div className="bg-white  border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-[#1f3f2c] mb-4 flex items-center gap-2">
              Item Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                  <Package className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <p className="text-md font-semibold text-[#1f3f2c] bg-green-50 px-3 py-2  border border-gray-200">
                  {item.category}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                  <Building className="h-4 w-4" />
                  <span>Supplier</span>
                </div>
                <p className="text-md font-semibold text-[#1f3f2c] bg-green-50 px-3 py-2  border border-gray-200">
                  {item.supplier}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="bg-white  border border-gray-200 p-6">
            <h3 className="text-md font-semibold text-[#1f3f2c] mb-4 flex items-center gap-2">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.price && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                    <PhilippinePeso className="h-4 w-4" />
                    <span>Unit Price</span>
                  </div>
                  <p className="text-md font-bold text-[#1f3f2c] bg-green-50 px-3 py-2  border border-green-200">
                    ₱{item.price.toFixed(2)}
                  </p>
                </div>
              )}

              {item.location && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#4a6741]">
                    <MapPin className="h-4 w-4" />
                    <span>Storage Location</span>
                  </div>
                  <p className="text-md font-semibold text-[#1f3f2c] bg-green-50 px-3 py-2  border border-green-200">
                    {item.location}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          {item.description && (
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-[#1f3f2c] mb-4">Description</h3>
              <div className="bg-green-50  p-4 border border-gray-200">
                <p className="text-[#1f3f2c] leading-relaxed text-md">
                  {item.description}
                </p>
              </div>
            </div>
          )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {onRestock && (
              <Button 
                variant="outline"
                onClick={() => onRestock(item.id)}
                className="border-green-500 text-green-700 hover:bg-green-50"
              >
                <Plus className="w-4 h-4" />
                Restock
              </Button>
            )}
            {onConsume && (
              <Button 
                variant="outline"
                onClick={() => onConsume(item.id)}
                className="border-orange-500 text-orange-700 hover:bg-orange-50"
              >
                <Minus className="w-4 h-4" />
                Consume
              </Button>
            )}
            {onViewActivity && (
              <Button 
                variant="outline"
                onClick={() => onViewActivity(item.id)}
                className="border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                <History className="w-4 h-4" />
                Activity Log
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => onEdit(item.id)}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button 
              variant="default"
              className="bg-red-600 text-white hover:bg-red-500"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit } from "lucide-react"
import type { InventoryItem } from "@/lib/inventory-types"
import { toastCRUD } from "../utils/toast"
import { Spinner } from "@/components/ui/spinner"
import type { FarmLocation } from "./location-switcher"

interface InventoryEditDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemUpdated: (item: InventoryItem) => void
  locations?: FarmLocation[]
}

export function InventoryEditDialog({
  item,
  open,
  onOpenChange,
  onItemUpdated,
  locations = [],
}: InventoryEditDialogProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    currentStock: "",
    minStock: "",
    unit: "",
    supplier: "",
    price: "",
    description: "",
    lastRestocked: new Date(),
    expiryDate: undefined as Date | undefined,
    locationId: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock.toString(),
        minStock: item.minStock.toString(),
        unit: item.unit,
        supplier: item.supplier,
        price: item.price?.toString() || "",
        description: item.description || "",
        lastRestocked: new Date(item.lastRestocked),
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        locationId: item.locationId || "",
      })
    }
  }, [item])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
  }

  const calculateStatus = (current: number, min: number): "adequate" | "low" | "critical" => {
    const percentage = (current / min) * 100
    if (percentage >= 100) return "adequate"
    if (percentage >= 50) return "low"
    return "critical"
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.currentStock || !formData.minStock || !formData.unit || !formData.supplier) {
      toastCRUD.validationError("required fields")
      return
    }

    if (!formData.locationId) {
      toastCRUD.validationError("Please select a farm location")
      return
    }

    const selectedLoc = locations.find(loc => loc.locationId === formData.locationId)
    if (!selectedLoc) {
      toastCRUD.validationError("Invalid location selected")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/inventory/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          currentStock: parseInt(formData.currentStock),
          minStock: parseInt(formData.minStock),
          unit: formData.unit,
          supplier: formData.supplier,
          price: formData.price ? parseFloat(formData.price) : null,
          description: formData.description || null,
          lastRestocked: formData.lastRestocked?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          expiryDate: formData.expiryDate?.toISOString().split('T')[0] || null,
          locationId: selectedLoc.locationId,
          locationName: selectedLoc.name,
          locationAddress: selectedLoc.address || null,
        }),
      })

      const json = await response.json()

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError()
        } else if (response.status === 404) {
          toastCRUD.updateError("Inventory item", "Item not found")
        } else {
          toastCRUD.updateError("Inventory item", json?.error?.message || "Failed to update item")
        }
        return
      }

      const updatedItem = json.data as InventoryItem
      onItemUpdated(updatedItem)
      toastCRUD.itemUpdated(updatedItem.name)
      
      onOpenChange(false)
    } catch (error) {
      toastCRUD.updateError("Inventory item", "Failed to update item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl">Edit Inventory Item</DialogTitle>
                <DialogDescription>Update item information and stock details</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="flex items-center gap-1">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange("category", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feed">Feed</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                    <SelectItem value="Supplements">Supplements</SelectItem>
                    <SelectItem value="Supplies">Supplies</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter item description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Stock Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-currentStock" className="flex items-center gap-1">
                  Current Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-currentStock"
                  type="number"
                  placeholder="0"
                  value={formData.currentStock}
                  onChange={(e) => handleInputChange("currentStock", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minStock" className="flex items-center gap-1">
                  Minimum Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-minStock"
                  type="number"
                  placeholder="0"
                  value={formData.minStock}
                  onChange={(e) => handleInputChange("minStock", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit" className="flex items-center gap-1">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.unit} 
                  onValueChange={(value) => handleInputChange("unit", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                    <SelectItem value="bottles">bottles</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                    <SelectItem value="bags">bags</SelectItem>
                    <SelectItem value="sacks">sacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Supplier and Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Supplier & Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-supplier" className="flex items-center gap-1">
                  Supplier <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-supplier"
                  placeholder="Enter supplier name"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange("supplier", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Unit Price (₱)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-locationId" className="flex items-center gap-1">
                Farm Location <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => handleInputChange("locationId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select farm location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.locationId} value={location.locationId}>
                      <div className="flex flex-col">
                        <span>{location.name}</span>
                        {location.address && (
                          <span className="text-xs text-gray-500">{location.address}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <DatePicker
                  label="Last Restocked"
                  value={formData.lastRestocked}
                  onChange={(date: Date | undefined) => handleDateChange("lastRestocked", date)}
                />
              </div>
              <div className="space-y-2">
                <DatePicker
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChange={(date: Date | undefined) => handleDateChange("expiryDate", date)}
                />
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Updating Item
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Update Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

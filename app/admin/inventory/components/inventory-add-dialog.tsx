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
import { Plus } from "lucide-react"
import type { InventoryItem } from "@/lib/inventory-types"
import { toastCRUD } from "../utils/toast"
import { Spinner } from "@/components/ui/spinner"
import type { FarmLocation } from "./location-switcher"

interface InventoryAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemAdded: (item: InventoryItem) => void
  selectedLocation?: FarmLocation | null
  locations?: FarmLocation[]
}

export function InventoryAddDialog({
  open,
  onOpenChange,
  onItemAdded,
  selectedLocation,
  locations = [],
}: InventoryAddDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  useEffect(() => {
    if (selectedLocation && open) {
      setFormData(prev => ({ ...prev, locationId: selectedLocation.locationId }))
    }
  }, [selectedLocation, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.category || !formData.currentStock || !formData.minStock || !formData.unit || !formData.supplier) {
      toastCRUD.validationError("Please fill in all required fields")
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
      const response = await fetch("/api/inventory", {
        method: "POST",
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
          price: formData.price ? parseFloat(formData.price) : undefined,
          description: formData.description || undefined,
          lastRestocked: formData.lastRestocked?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          expiryDate: formData.expiryDate?.toISOString().split('T')[0],
          locationId: selectedLoc.locationId,
          locationName: selectedLoc.name,
          locationAddress: selectedLoc.address,
        }),
      })

      const json = await response.json()

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError()
        } else {
          toastCRUD.createError("Inventory item", json?.error?.message || "Failed to add item")
        }
        return
      }

      const newItem = json.data as InventoryItem
      onItemAdded(newItem)
      toastCRUD.itemAdded(newItem.name)
      
      // Reset form
      setFormData({
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
        expiryDate: undefined,
        locationId: selectedLocation?.locationId || "",
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add inventory item:", error)
      toastCRUD.createError("Inventory item", "Failed to add item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl">Add New Inventory Item</DialogTitle>
                <DialogDescription>Add a new item to your inventory tracking system</DialogDescription>
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
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-1">
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
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
                  <Label htmlFor="currentStock" className="flex items-center gap-1">
                    Current Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    placeholder="0"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange("currentStock", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock" className="flex items-center gap-1">
                    Minimum Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="0"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange("minStock", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="flex items-center gap-1">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
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
                  <Label htmlFor="supplier" className="flex items-center gap-1">
                    Supplier <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="supplier"
                    placeholder="Enter supplier name"
                    value={formData.supplier}
                    onChange={(e) => handleInputChange("supplier", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationId" className="flex items-center gap-1">
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
                    label="Expiry Date (Optional)"
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
                Adding Item
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
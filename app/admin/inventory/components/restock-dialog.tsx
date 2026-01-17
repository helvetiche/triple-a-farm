"use client"

import { useState } from "react"
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
import { Package, Plus } from "lucide-react"
import { InventoryItem } from "../data/mock-data"
import { toastCRUD } from "../utils/toast"
import { Spinner } from "@/components/ui/spinner"
import { formatInventoryDisplayId } from "@/lib/inventory-types"

interface RestockDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestock: (item: InventoryItem, restockAmount: number) => void
}

export function RestockDialog({
  item,
  open,
  onOpenChange,
  onRestock,
}: RestockDialogProps) {
  const [restockAmount, setRestockAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!item) return

    const amount = parseInt(restockAmount)
    if (!restockAmount || isNaN(amount) || amount <= 0) {
      toastCRUD.validationError("Please enter a valid restock amount")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      onRestock(item, amount)
      toastCRUD.itemUpdated(`${item.name} restocked with ${amount} units`)
      
      // Reset form
      setRestockAmount("")
      onOpenChange(false)
    } catch (error) {
      toastCRUD.updateError("Restock", "Failed to restock item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRestockAmount("")
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50vh] min-h-[50vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl">Restock Item</DialogTitle>
                <DialogDescription>Add units to inventory</DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>
          <div className="space-y-6">
            {/* Item Information */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-[#3d6c58]" />
                <div>
                  <h3 className="font-semibold text-[#1f3f2c]">{item.name}</h3>
                  <p className="text-sm text-gray-600">ID: {formatInventoryDisplayId(item)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Stock:</span>
                  <span className="ml-2 font-medium">{item.currentStock} {item.unit}</span>
                </div>
                <div>
                  <span className="text-gray-500">Min Stock:</span>
                  <span className="ml-2 font-medium">{item.minStock} {item.unit}</span>
                </div>
              </div>
            </div>

            {/* Restock Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restockAmount" className="flex items-center gap-1">
                  Restock Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="restockAmount"
                  type="number"
                  placeholder="Enter number of units"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  min="1"
                  required
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Enter the number of {item.unit} to add to current stock
                </p>
              </div>

              {/* Stock Preview */}
              {restockAmount && !isNaN(parseInt(restockAmount)) && parseInt(restockAmount) > 0 && (
                <div className="bg-green-50 p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Stock After Restock</h4>
                  <div className="text-lg font-bold text-green-900">
                    {item.currentStock + parseInt(restockAmount)} {item.unit}
                  </div>
                  <div className="text-sm text-green-700">
                    +{parseInt(restockAmount)} {item.unit} from current {item.currentStock} {item.unit}
                  </div>
                </div>
              )}
            </div>
          </div>
        
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !restockAmount || parseInt(restockAmount) <= 0}
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Restocking
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Restock Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
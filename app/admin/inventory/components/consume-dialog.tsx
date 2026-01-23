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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Minus } from "lucide-react"
import { InventoryItem } from "../data/mock-data"
import { toastCRUD } from "../utils/toast"
import { Spinner } from "@/components/ui/spinner"
import { formatInventoryDisplayId } from "@/lib/inventory-types"
import { CONSUME_REASONS } from "@/lib/inventory-types"

interface ConsumeDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConsume: (item: InventoryItem, consumeAmount: number) => void
}

export function ConsumeDialog({
  item,
  open,
  onOpenChange,
  onConsume,
}: ConsumeDialogProps) {
  const [consumeAmount, setConsumeAmount] = useState("")
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!item) return

    const amount = parseInt(consumeAmount)
    if (!consumeAmount || isNaN(amount) || amount <= 0) {
      toastCRUD.validationError("Please enter a valid consume amount")
      return
    }

    if (amount > item.currentStock) {
      toastCRUD.validationError(
        `Cannot consume more than current stock (${item.currentStock} ${item.unit})`
      )
      return
    }

    if (!reason) {
      toastCRUD.validationError("Please select a reason")
      return
    }

    const finalReason = reason === "Other" ? customReason : reason

    if (!finalReason || finalReason.trim() === "") {
      toastCRUD.validationError("Please provide a reason")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/inventory/${item.id}/consume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          reason: finalReason,
        }),
      })

      const json = await response.json()

      if (!response.ok || !json?.success) {
        if (response.status === 401 || response.status === 403) {
          toastCRUD.permissionError()
        } else {
          toastCRUD.updateError(
            "Consume",
            json?.error?.message || "Failed to consume item. Please try again."
          )
        }
        return
      }

      onConsume(json.data, amount)
      toastCRUD.itemUpdated(`${item.name} consumed ${amount} units`)

      // Reset form
      setConsumeAmount("")
      setReason("")
      setCustomReason("")
      onOpenChange(false)
    } catch (error) {
      toastCRUD.updateError("Consume", "Failed to consume item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setConsumeAmount("")
    setReason("")
    setCustomReason("")
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
                <DialogTitle className="text-xl">Consume Item</DialogTitle>
                <DialogDescription>
                  Remove units from inventory
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          {/* Item Information */}
          <div className="bg-gray-50 rounded-none p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-[#3d6c58]" />
              <div>
                <h3 className="font-semibold text-[#1f3f2c]">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  ID: {formatInventoryDisplayId(item)}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Stock:</span>
                <span className="ml-2 font-medium">
                  {item.currentStock} {item.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Min Stock:</span>
                <span className="ml-2 font-medium">
                  {item.minStock} {item.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Consume Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consumeAmount" className="flex items-center gap-1">
                Consume Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="consumeAmount"
                type="number"
                placeholder="Enter number of units"
                value={consumeAmount}
                onChange={(e) => setConsumeAmount(e.target.value)}
                min="1"
                max={item.currentStock}
                required
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Enter the number of {item.unit} to remove from current stock
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="flex items-center gap-1">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {CONSUME_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reason === "Other" && (
              <div className="space-y-2">
                <Label htmlFor="customReason" className="flex items-center gap-1">
                  Specify Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="customReason"
                  placeholder="Enter custom reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            )}

            {/* Stock Preview */}
            {consumeAmount &&
              !isNaN(parseInt(consumeAmount)) &&
              parseInt(consumeAmount) > 0 && (
                <div
                  className={`p-4 border ${
                    item.currentStock - parseInt(consumeAmount) < item.minStock
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <h4
                    className={`text-sm font-medium mb-2 ${
                      item.currentStock - parseInt(consumeAmount) < item.minStock
                        ? "text-yellow-900"
                        : "text-blue-900"
                    }`}
                  >
                    Stock After Consumption
                  </h4>
                  <div
                    className={`text-lg font-bold ${
                      item.currentStock - parseInt(consumeAmount) < item.minStock
                        ? "text-yellow-900"
                        : "text-blue-900"
                    }`}
                  >
                    {Math.max(0, item.currentStock - parseInt(consumeAmount))}{" "}
                    {item.unit}
                  </div>
                  <div
                    className={`text-sm ${
                      item.currentStock - parseInt(consumeAmount) < item.minStock
                        ? "text-yellow-700"
                        : "text-blue-700"
                    }`}
                  >
                    -{parseInt(consumeAmount)} {item.unit} from current{" "}
                    {item.currentStock} {item.unit}
                  </div>
                  {item.currentStock - parseInt(consumeAmount) < item.minStock && (
                    <p className="text-sm text-yellow-700 mt-2 font-medium">
                      ⚠️ Warning: Stock will be below minimum level
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !consumeAmount ||
              parseInt(consumeAmount) <= 0 ||
              !reason ||
              (reason === "Other" && !customReason.trim())
            }
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Consuming
              </>
            ) : (
              <>
                <Minus className="w-4 h-4" />
                Consume Item
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, PhilippinePeso, Plus } from "lucide-react"
import { SalesTransaction } from "../types"
import { toastCRUD } from "../utils/toast"
import { getAvailableRoosters, type Rooster } from "../../data/roosters"
import Link from "next/link"

interface RecordSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaleRecorded: (transaction: SalesTransaction) => void
  prefilledData?: {
    roosterId: string
    breed: string
    price: number
    name: string
  }
}

export function RecordSaleDialog({
  open,
  onOpenChange,
  onSaleRecorded,
  prefilledData,
}: RecordSaleDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [roosters, setRoosters] = useState<Rooster[]>([])
  const [isLoadingRoosters, setIsLoadingRoosters] = useState(true)
  const [formData, setFormData] = useState({
    roosterId: "",
    breed: "",
    customerName: "",
    customerContact: "",
    amount: "",
    paymentMethod: "cash" as "cash" | "gcash" | "bank_transfer",
    notes: "",
  })

  // Fetch roosters from API
  useEffect(() => {
    if (open) {
      const fetchRoosters = async () => {
        try {
          setIsLoadingRoosters(true)
          const response = await fetch("/api/roosters")
          const result = await response.json()
          if (result.success) {
            setRoosters(result.data || [])
          }
        } catch (error) {
          console.error("Error fetching roosters:", error)
        } finally {
          setIsLoadingRoosters(false)
        }
      }
      fetchRoosters()
    }
  }, [open])

  // Update form when prefilled data changes
  useEffect(() => {
    if (prefilledData) {
      // Ensure price is a valid number
      const price = typeof prefilledData.price === 'number' ? prefilledData.price : parseFloat(String(prefilledData.price || 0))
      const priceString = isNaN(price) || price <= 0 ? "" : price.toString()
      
      setFormData(prev => ({
        ...prev,
        roosterId: prefilledData.roosterId,
        breed: prefilledData.breed,
        amount: priceString,
        notes: `Sale for ${prefilledData.name} (${prefilledData.breed})`
      }))
    }
  }, [prefilledData])

  const availableRoosters = getAvailableRoosters(roosters)

  const handleRoosterSelect = (roosterId: string) => {
    const selectedRooster = availableRoosters.find(r => r.id === roosterId)
    if (selectedRooster) {
      // Ensure price is a valid number, default to empty string if invalid
      const price = selectedRooster.price ? parseFloat(String(selectedRooster.price)) : 0
      const priceString = isNaN(price) || price <= 0 ? "" : price.toString()
      
      setFormData(prev => ({
        ...prev,
        roosterId: selectedRooster.id,
        breed: selectedRooster.breed,
        amount: priceString,
        notes: `Sale for ${selectedRooster.name} (${selectedRooster.breed})`
      }))
    }
  }

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "gcash", label: "GCash" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    // Validation
    if (!formData.roosterId || !formData.breed || !formData.customerName || 
        !formData.customerContact || !formData.amount) {
      toastCRUD.validationError("Please fill in all required fields")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toastCRUD.validationError("Please enter a valid amount")
      return
    }

    // Verify rooster is still available
    const selectedRooster = availableRoosters.find(r => r.id === formData.roosterId)
    if (!selectedRooster) {
      toastCRUD.validationError("Selected rooster is no longer available")
      return
    }

    setIsSaving(true)

    try {
      // Update rooster status to "Sold" when sale is recorded
      try {
        const roosterUpdateResponse = await fetch(`/api/roosters/${formData.roosterId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Sold"
          }),
        })

        const roosterUpdateResult = await roosterUpdateResponse.json()
        
        if (!roosterUpdateResult.success) {
          console.error("Failed to update rooster status:", roosterUpdateResult.error)
          // Continue with sale recording even if rooster update fails
        }
      } catch (roosterError) {
        console.error("Error updating rooster status:", roosterError)
        // Continue with sale recording even if rooster update fails
      }

      // Save to Firebase via API
      const response = await fetch("/api/sales/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roosterId: formData.roosterId,
          breed: formData.breed,
          customerName: formData.customerName,
          customerContact: formData.customerContact,
          amount: amount,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          commission: amount * 0.1,
          agentName: "Current Agent",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || errorData.error || `HTTP ${response.status}: Failed to save sale`)
      }

      const result = await response.json()

      if (!result.success) {
        console.error("API Error:", result)
        throw new Error(result.error?.message || result.error || "Failed to save sale")
      }

      if (!result.data || !result.data.id) {
        console.error("Invalid response data:", result)
        throw new Error("Invalid response from server - missing sale data")
      }

      console.log("Sale saved successfully:", result.data.id)

      // Wait a bit to ensure Firebase has processed the write
      await new Promise(resolve => setTimeout(resolve, 200))

      onSaleRecorded(result.data)
      toastCRUD.createSuccess("Sale recorded successfully - Rooster marked as Sold")
      
      // Reset form
      setFormData({
        roosterId: "",
        breed: "",
        customerName: "",
        customerContact: "",
        amount: "",
        paymentMethod: "cash",
        notes: "",
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error("Error recording sale:", error)
      toastCRUD.createError("Sale", "Failed to record sale. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    // Reset form
    setFormData({
      roosterId: "",
      breed: "",
      customerName: "",
      customerContact: "",
      amount: "",
      paymentMethod: "cash",
      notes: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-xl text-[#1f3f2c]">
                Mark as Sold
              </DialogTitle>
              <DialogDescription className="text-[#4a6741]">
                Record buyer information for this sale
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rooster Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Rooster Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="rooster" className="flex items-center gap-1">
                  Select Rooster <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.roosterId} onValueChange={handleRoosterSelect} disabled={isLoadingRoosters}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={isLoadingRoosters ? "Loading roosters..." : "Select an available rooster"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoosters ? (
                      <div className="flex items-center justify-center p-4">
                        <Spinner className="w-4 h-4" />
                      </div>
                    ) : availableRoosters.length === 0 ? (
                      <div className="p-4 text-sm text-center space-y-3">
                        <p className="text-gray-500 font-medium">No available roosters</p>
                        {roosters.length > 0 ? (
                          <>
                            <p className="text-xs text-gray-400">
                              {roosters.length} rooster{roosters.length !== 1 ? 's' : ''} found, but none are marked as "Available"
                            </p>
                            <p className="text-xs text-gray-400">
                              Update rooster status in the Roosters management page
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400">
                              No roosters found in the system
                            </p>
                            <Link href="/admin/roosters/add">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="mt-2 border-[#3d6c58]/20 hover:bg-[#3d6c58]/10"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Rooster
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    ) : (
                      availableRoosters.map((rooster) => {
                        // Format price safely
                        const price = rooster.price ? parseFloat(String(rooster.price)) : 0
                        const formattedPrice = isNaN(price) || price <= 0 ? "N/A" : price.toLocaleString()
                        
                        return (
                          <SelectItem key={rooster.id} value={rooster.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{rooster.name} ({rooster.id})</span>
                              <span className="text-sm text-gray-500">
                                {rooster.breed} • {rooster.age || "N/A"} • {rooster.weight || "N/A"} • ₱{formattedPrice}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
              {formData.roosterId && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="breed" className="flex items-center gap-1">
                      Breed
                    </Label>
                    <Input
                      id="breed"
                      value={formData.breed}
                      readOnly
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount" className="flex items-center gap-1">
                      <PhilippinePeso className="w-4 h-4" />
                      Price <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Customer Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="customerName" className="flex items-center gap-1">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerContact" className="flex items-center gap-1">
                  Contact <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerContact"
                  placeholder="Phone or email"
                  value={formData.customerContact}
                  onChange={(e) => handleInputChange("customerContact", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Sale Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f3f2c]">Buyer Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount" className="flex items-center gap-1">
                  Amount (₱) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod" className="flex items-center gap-1">
                  Payment Method
                </Label>
                <Select value={formData.paymentMethod} onValueChange={(value: any) => handleInputChange("paymentMethod", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this sale..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#3d6c58] hover:bg-[#4e816b] w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Mark as Sold
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

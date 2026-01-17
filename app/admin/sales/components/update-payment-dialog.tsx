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
import { CreditCard, CheckCircle, AlertCircle, PhilippinePeso } from "lucide-react"
import { SalesTransaction } from "../types"
import { toastCRUD } from "../utils/toast"

interface UpdatePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: SalesTransaction | null
  onPaymentUpdated: (transaction: SalesTransaction) => void
}

export function UpdatePaymentDialog({ 
  open, 
  onOpenChange, 
  transaction, 
  onPaymentUpdated 
}: UpdatePaymentDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "partial" | "paid">("unpaid")
  const [paymentNotes, setPaymentNotes] = useState("")

  // Calculate remaining balance
  const remainingBalance = transaction ? transaction.amount - (transaction.amountPaid || 0) : 0

  useEffect(() => {
    if (transaction) {
      setPaymentAmount("")
      setPaymentStatus(transaction.paymentStatus)
      setPaymentNotes("")
    }
  }, [transaction])

  const handlePaymentStatusChange = (status: "unpaid" | "partial" | "paid") => {
    setPaymentStatus(status)
    
    // Auto-fill payment amount based on status
    if (transaction) {
      if (status === "paid") {
        setPaymentAmount(transaction.amount.toString())
      } else if (status === "partial") {
        setPaymentAmount("")
      } else {
        setPaymentAmount("0")
      }
    }
  }

  const handleSave = async () => {
    if (!transaction) return

    // Validation
    if (!paymentAmount) {
      toastCRUD.validationError("Please enter payment amount")
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount < 0) {
      toastCRUD.validationError("Please enter a valid payment amount")
      return
    }

    if (amount > remainingBalance) {
      toastCRUD.validationError(`Payment amount cannot exceed remaining balance of ₱${remainingBalance}`)
      return
    }

    setIsSaving(true)

    try {
      // Calculate total paid after this payment
      const totalPaid = (transaction.amountPaid || 0) + amount
      
      // Determine new payment status
      let newPaymentStatus: "unpaid" | "partial" | "paid"
      if (totalPaid === 0) {
        newPaymentStatus = "unpaid"
      } else if (totalPaid >= transaction.amount) {
        newPaymentStatus = "paid"
      } else {
        newPaymentStatus = "partial"
      }

      // Determine transaction status based on payment
      const newTransactionStatus = newPaymentStatus === "paid" ? "completed" : "pending"

      // Update rooster status when payment is completed
      if (newPaymentStatus === "paid" && transaction.roosterId) {
        try {
          const roosterUpdateResponse = await fetch(`/api/roosters/${transaction.roosterId}`, {
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
            // Continue with payment update even if rooster update fails
          }
        } catch (roosterError) {
          console.error("Error updating rooster status:", roosterError)
          // Continue with payment update even if rooster update fails
        }
      }

      // Update transaction in Firebase
      const response = await fetch(`/api/sales/transactions/${transaction.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          status: newTransactionStatus,
          amountPaid: totalPaid,
          paymentNotes: paymentNotes,
          lastPaymentDate: new Date().toISOString().split('T')[0],
          lastPaymentAmount: amount
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to update payment")
      }

      onPaymentUpdated(result.data)
      
      if (newTransactionStatus === "completed") {
        toastCRUD.updateSuccess("Payment completed! Transaction marked as completed.")
      } else {
        toastCRUD.updateSuccess("Payment updated successfully")
      }
      
      onOpenChange(false)
    } catch (error) {
      toastCRUD.updateError("Failed to update payment. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setPaymentAmount("")
    setPaymentStatus("unpaid")
    setPaymentNotes("")
    onOpenChange(false)
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-900">
                Update Payment Status
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Transaction {transaction.id} • {transaction.customerName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-semibold text-gray-900">₱{transaction.amount.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Amount Paid:</span>
                <div className="font-semibold text-green-600">₱{(transaction.amountPaid || 0).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Remaining Balance:</span>
                <div className="font-semibold text-orange-600">₱{remainingBalance.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Current Status:</span>
                <div className="font-semibold text-blue-600 capitalize">{transaction.paymentStatus}</div>
              </div>
            </div>
          </div>

          {/* Payment Update Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentStatus" className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Payment Status <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentStatus} onValueChange={handlePaymentStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partially Paid</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentAmount" className="flex items-center gap-1">
                <PhilippinePeso className="w-4 h-4" />
                Payment Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1"
                min="0"
                max={remainingBalance}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: ₱{remainingBalance.toLocaleString()}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentNotes" className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Payment Notes
              </Label>
              <Textarea
                id="paymentNotes"
                placeholder="Add payment notes (e.g., payment method, reference number)"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Updating..." : "Update Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

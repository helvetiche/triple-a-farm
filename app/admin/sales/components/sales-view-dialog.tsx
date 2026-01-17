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
  User, 
  Phone, 
  CreditCard, 
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Send,
  PhilippinePeso
} from "lucide-react"
import { SalesTransaction } from "../types"
import { toastCRUD } from "../utils/toast"

interface SalesViewDialogProps {
  transaction: SalesTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSendConfirmation?: (transaction: SalesTransaction) => void
}

export function SalesViewDialog({
  transaction,
  open,
  onOpenChange,
  onSendConfirmation,
}: SalesViewDialogProps) {
  if (!transaction) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "unpaid":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <PhilippinePeso className="w-4 h-4" />
      case "gcash":
        return <Phone className="w-4 h-4" />
      case "bank_transfer":
        return <CreditCard className="w-4 h-4" />
      case "paypal":
        return <CreditCard className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const handleSendConfirmation = () => {
    if (onSendConfirmation) {
      onSendConfirmation(transaction)
      toastCRUD.confirmationSent(transaction.customerName)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl text-[#1f3f2c]">
                  Sales Transaction Details
                </DialogTitle>
                <DialogDescription className="text-[#4a6741]">
                  Transaction ID: {transaction.transactionId || transaction.id}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                {transaction.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                {transaction.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(transaction.paymentStatus)}>
                {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {/* Transaction Overview */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-[#1f3f2c] mb-3">Transaction Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#3d6c58]" />
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium">{transaction.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhilippinePeso className="w-4 h-4 text-[#3d6c58]" />
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">₱{transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3d6c58]" />
                  <span className="text-sm text-gray-600">Rooster ID:</span>
                  <span className="text-sm font-medium">{transaction.roosterId}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Customer Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#3d6c58]" />
                  <span className="text-sm text-gray-600">Customer Name:</span>
                  <span className="text-sm font-medium">{transaction.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#3d6c58]" />
                  <span className="text-sm text-gray-600">Contact:</span>
                  <span className="text-sm font-medium">{transaction.customerContact}</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Product Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Breed:</span>
                    <p className="text-sm font-medium">{transaction.breed}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Commission:</span>
                    <p className="text-sm font-medium">₱{transaction.commission?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Information */}
            {transaction.agentName && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1f3f2c]">Agent Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#3d6c58]" />
                    <span className="text-sm text-gray-600">Agent:</span>
                    <span className="text-sm font-medium">{transaction.agentName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {transaction.notes && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1f3f2c]">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700">{transaction.notes}</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {transaction.status === "completed" && (
            <Button 
              variant="outline" 
              onClick={handleSendConfirmation}
              className="border-[#3d6c58]/20 hover:bg-[#3d6c58]/10"
            >
              <Send className="w-4 h-4 " />
              Send Confirmation
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mail, 
  MessageSquare, 
  Phone,
  CheckCircle,
  Loader2
} from "lucide-react"
import { SalesTransaction } from "../types"
import { toastCRUD } from "../utils/toast"

interface SendConfirmationDialogProps {
  transaction: SalesTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendConfirmationDialog({
  transaction,
  open,
  onOpenChange,
}: SendConfirmationDialogProps) {
  const [isSending, setIsSending] = useState(false)
  const [sendMethod, setSendMethod] = useState<"email" | "sms" | "whatsapp">("email")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  if (!transaction) return null

  const defaultEmailMessage = `Dear ${transaction.customerName},

Thank you for your purchase! We're pleased to confirm your transaction details:

Transaction ID: ${transaction.id}
Date: ${transaction.date}
Rooster Breed: ${transaction.breed}
Amount: ₱${transaction.amount.toLocaleString()}
Payment Method: ${transaction.paymentMethod.replace('_', ' ').toUpperCase()}
Status: Sold

Your rooster is ready for pickup/delivery. Please bring this confirmation and a valid ID.

If you have any questions, please don't hesitate to contact us.

Best regards,
Triple-A Game Farm
Contact: +639123456789`

  const defaultSMSMessage = `Hi ${transaction.customerName}! Your purchase is confirmed. Transaction ID: ${transaction.id}, Amount: ₱${transaction.amount.toLocaleString()}. Rooster ready for pickup. Thanks from Triple-A Game Farm!`

  const handleSend = async () => {
    if (sendMethod === "email" && !recipientEmail) {
      toastCRUD.validationError("Please enter recipient email address")
      return
    }

    setIsSending(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toastCRUD.confirmationSent(transaction.customerName)
      
      // Reset form
      setRecipientEmail("")
      setCustomMessage("")
      onOpenChange(false)
    } catch (error) {
      toastCRUD.createError("Confirmation", "Failed to send confirmation. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const getMessagePreview = () => {
    if (customMessage) return customMessage
    if (sendMethod === "email") return defaultEmailMessage
    return defaultSMSMessage
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-xl text-[#1f3f2c]">
                  Send Sale Confirmation
                </DialogTitle>
                <DialogDescription className="text-[#4a6741]">
                  Send confirmation to {transaction.customerName} for transaction {transaction.id}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-6">
            {/* Send Method Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Send Method</h3>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={sendMethod === "email" ? "default" : "outline"}
                  onClick={() => setSendMethod("email")}
                  className="flex flex-col items-center gap-2 h-20 border-[#3d6c58]/20"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm">Email</span>
                </Button>
                <Button
                  variant={sendMethod === "sms" ? "default" : "outline"}
                  onClick={() => setSendMethod("sms")}
                  className="flex flex-col items-center gap-2 h-20 border-[#3d6c58]/20"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">SMS</span>
                </Button>
                <Button
                  variant={sendMethod === "whatsapp" ? "default" : "outline"}
                  onClick={() => setSendMethod("whatsapp")}
                  className="flex flex-col items-center gap-2 h-20 border-[#3d6c58]/20"
                >
                  <Phone className="w-6 h-6" />
                  <span className="text-sm">WhatsApp</span>
                </Button>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Recipient Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Customer Name:</span>
                    <p className="text-sm font-medium">{transaction.customerName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Contact:</span>
                    <p className="text-sm font-medium">{transaction.customerContact}</p>
                  </div>
                </div>
                
                {sendMethod === "email" && (
                  <div className="mt-4">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="customer@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Message Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {sendMethod === "email" ? (
                  <Textarea
                    placeholder="Custom email message..."
                    value={customMessage || defaultEmailMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                ) : (
                  <Textarea
                    placeholder="Custom SMS message..."
                    value={customMessage || defaultSMSMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {sendMethod === "email" 
                    ? "Edit the email message above or leave as default"
                    : "Edit the SMS message above or leave as default"
                  }
                </p>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1f3f2c]">Transaction Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Transaction ID:</span>
                    <p className="font-medium">{transaction.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{transaction.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Breed:</span>
                    <p className="font-medium">{transaction.breed}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium">₱{transaction.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={isSending || (sendMethod === "email" && !recipientEmail)}
            className="bg-[#3d6c58] hover:bg-[#4e816b]"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 " />
                Send Confirmation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

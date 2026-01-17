import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Eye, 
  Send,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard
} from "lucide-react"
import { SalesTransaction } from "../types"

interface SalesTableProps {
  transactions: SalesTransaction[]
  onViewTransaction: (transaction: SalesTransaction) => void
  onUpdateTransaction: (transaction: SalesTransaction) => void
  onUpdatePayment: (transaction: SalesTransaction) => void
  onCancelTransaction: (transaction: SalesTransaction) => void
  onSendConfirmation: (transaction: SalesTransaction) => void
}

export function SalesTable({
  transactions,
  onViewTransaction,
  onUpdateTransaction,
  onUpdatePayment,
  onCancelTransaction,
  onSendConfirmation,
}: SalesTableProps) {
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

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#4a6741]">No transactions found</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border border-[#3d6c58]/20 bg-white p-4" style={{ borderRadius: 0 }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-[#1f3f2c] truncate">{transaction.customerName}</div>
                <div className="text-sm text-[#4a6741] truncate">{transaction.transactionId || transaction.id} • {transaction.date}</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewTransaction(transaction)}>
                    <Eye className=" h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {transaction.status === "pending" && (
                    <DropdownMenuItem onClick={() => onUpdatePayment(transaction)}>
                      <CreditCard className=" h-4 w-4" />
                      Update Payment
                    </DropdownMenuItem>
                  )}
                  {transaction.status === "pending" && (
                    <DropdownMenuItem onClick={() => onCancelTransaction(transaction)} className="text-red-600">
                      <XCircle className=" h-4 w-4" />
                      Cancel Transaction
                    </DropdownMenuItem>
                  )}
                  {transaction.status === "completed" && transaction.paymentStatus === "paid" && (
                    <DropdownMenuItem onClick={() => onSendConfirmation(transaction)}>
                      <Send className=" h-4 w-4" />
                      Send Confirmation
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[#4a6741]">Breed</div>
                <div className="text-[#1f3f2c] font-medium truncate">{transaction.breed}</div>
              </div>
              <div>
                <div className="text-[#4a6741]">Amount</div>
                <div className="text-[#1f3f2c] font-medium">₱{transaction.amount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[#4a6741]">Payment</div>
                <Badge className={getPaymentStatusColor(transaction.paymentStatus)}>
                  {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
                </Badge>
              </div>
              <div>
                <div className="text-[#4a6741]">Status</div>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {transaction.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                  {transaction.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => onViewTransaction(transaction)} className="w-full bg-[#3d6c58] hover:bg-[#4e816b]">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              {transaction.status === "pending" && (
                <Button variant="outline" onClick={() => onUpdatePayment(transaction)} className="w-full border-[#3d6c58]/20">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block w-full overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.transactionId || transaction.id}
                </TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.customerName}</TableCell>
                <TableCell>{transaction.breed}</TableCell>
                <TableCell className="font-medium">
                  ₱{transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={getPaymentStatusColor(transaction.paymentStatus)}>
                    {transaction.paymentStatus.charAt(0).toUpperCase() + transaction.paymentStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                    {transaction.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                    {transaction.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onViewTransaction(transaction)}
                      >
                        <Eye className=" h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      {/* Show Update Payment for pending transactions with any payment status */}
                      {transaction.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => onUpdatePayment(transaction)}
                        >
                          <CreditCard className=" h-4 w-4" />
                          Update Payment
                        </DropdownMenuItem>
                      )}
                      
                      {/* Show Cancel for pending transactions */}
                      {transaction.status === "pending" && (
                        <DropdownMenuItem
                          onClick={() => onCancelTransaction(transaction)}
                          className="text-red-600"
                        >
                          <XCircle className=" h-4 w-4" />
                          Cancel Transaction
                        </DropdownMenuItem>
                      )}
                      
                      {/* Show Send Confirmation for completed/paid transactions */}
                      {transaction.status === "completed" && transaction.paymentStatus === "paid" && (
                        <DropdownMenuItem
                          onClick={() => onSendConfirmation(transaction)}
                        >
                          <Send className=" h-4 w-4" />
                          Send Confirmation
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

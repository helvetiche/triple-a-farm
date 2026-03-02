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
  Eye
} from "lucide-react"
import { SalesTransaction } from "../types"

interface SalesTableProps {
  transactions: SalesTransaction[]
  onViewTransaction: (transaction: SalesTransaction) => void
}

export function SalesTable({
  transactions,
  onViewTransaction,
}: SalesTableProps) {
  const getStatusColor = (status: string) => {
    // All sales are completed now
    return "bg-green-100 text-green-800 border-green-200"
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
                <div className="text-[#4a6741]">Payment Method</div>
                <div className="text-[#1f3f2c] font-medium capitalize">{transaction.paymentMethod.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-[#4a6741]">Status</div>
                <Badge className={getStatusColor("sold")}>
                  Sold
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={() => onViewTransaction(transaction)} className="w-full bg-[#3d6c58] hover:bg-[#4e816b]">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
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
              <TableHead>Payment Method</TableHead>
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
                <TableCell className="capitalize">
                  {transaction.paymentMethod.replace('_', ' ')}
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

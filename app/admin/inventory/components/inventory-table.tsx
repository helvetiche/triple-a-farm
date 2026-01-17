import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { MoreHorizontal, Eye, Edit, Plus } from "lucide-react"
import { InventoryItem } from "../data/mock-data"
import { formatInventoryDisplayId } from "@/lib/inventory-types"

interface InventoryTableProps {
  items: InventoryItem[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onRestock: (id: string) => void
}

export function InventoryTable({
  items,
  onViewDetails,
  onEdit,
  onRestock,
}: InventoryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "adequate": return "bg-green-100 text-green-800"
      case "low": return "bg-yellow-100 text-yellow-800"
      case "critical": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStockProgress = (current: number, min: number) => {
    const percentage = (current / min) * 100
    return Math.min(percentage, 100)
  }

  const getProgressColor = (current: number, min: number) => {
    const percentage = (current / min) * 100
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (items.length === 0) {
    return (
      <Card className="border-[#3d6c58]/20">
        <CardHeader>
          <CardTitle className="text-[#1f3f2c]">Inventory Items</CardTitle>
          <CardDescription>Current stock levels and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#4a6741]">No inventory items found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <CardTitle className="text-[#1f3f2c]">Inventory Items</CardTitle>
        <CardDescription>Current stock levels and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:hidden">
          {items.map((item) => (
            <div key={item.id} className="border border-[#3d6c58]/20 bg-white p-4" style={{ borderRadius: 0 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[#1f3f2c] truncate">{item.name}</div>
                  <div className="text-sm text-[#4a6741] truncate">{formatInventoryDisplayId(item)} • {item.category}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(item.id)}>
                      <Eye className=" h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item.id)}>
                      <Edit className=" h-4 w-4" />
                      Edit Item
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onRestock(item.id)}>
                      <Plus className=" h-4 w-4" />
                      Restock
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-[#4a6741]">Supplier</div>
                  <div className="text-[#1f3f2c] font-medium truncate">{item.supplier}</div>
                </div>
                <div>
                  <div className="text-[#4a6741]">Status</div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-[#4a6741]">Stock</div>
                  <div className="text-[#1f3f2c] font-medium">
                    {item.currentStock} / {item.minStock} {item.unit}
                  </div>
                </div>
                <div className="mt-2">
                  <Progress
                    value={getStockProgress(item.currentStock, item.minStock)}
                    className="h-2"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => onViewDetails(item.id)} className="w-full bg-[#3d6c58] hover:bg-[#4e816b]">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" onClick={() => onEdit(item.id)} className="w-full border-[#3d6c58]/20">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => onRestock(item.id)} className="w-full border-[#3d6c58]/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Restock
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block w-full overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{formatInventoryDisplayId(item)}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.currentStock} / {item.minStock} {item.unit}</span>
                      </div>
                      <Progress 
                        value={getStockProgress(item.currentStock, item.minStock)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(item.id)}>
                          <Eye className=" h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item.id)}>
                          <Edit className=" h-4 w-4" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onRestock(item.id)}>
                          <Plus className=" h-4 w-4" />
                          Restock
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

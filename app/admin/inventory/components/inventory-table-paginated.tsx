import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Plus, Minus, History, ChevronLeft, ChevronRight } from "lucide-react";
import type { InventoryItem } from "@/lib/inventory-types";
import { formatInventoryDisplayId } from "@/lib/inventory-types";

interface InventoryTablePaginatedProps {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onRestock: (id: string) => void;
  onConsume: (id: string) => void;
  onViewActivity: (id: string) => void;
}

export function InventoryTablePaginated({
  items,
  total,
  page,
  limit,
  totalPages,
  isLoading,
  onPageChange,
  onViewDetails,
  onEdit,
  onRestock,
  onConsume,
  onViewActivity,
}: InventoryTablePaginatedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "perfect":
        return "bg-emerald-100 text-emerald-800";
      case "good":
        return "bg-green-100 text-green-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStockProgress = (item: InventoryItem) => {
    // Always use maxStock as baseline, fallback to minStock * 2 if not provided
    const targetStock = item.maxStock && item.maxStock > 0 
      ? item.maxStock 
      : item.minStock * 2;
    
    if (targetStock === 0) return 100;
    
    return Math.min((item.currentStock / targetStock) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 5) return "bg-red-500";
    if (percentage <= 15) return "bg-yellow-500";
    if (percentage <= 50) return "bg-blue-500";
    if (percentage <= 75) return "bg-green-500";
    return "bg-emerald-500";
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  if (isLoading) {
    return (
      <Card className="border-[#3d6c58]/20">
        <CardHeader>
          <CardTitle className="text-[#1f3f2c]">Inventory Items</CardTitle>
          <CardDescription>Loading inventory data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-[#4a6741]">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
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
    );
  }

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#1f3f2c]">Inventory Items</CardTitle>
            <CardDescription>
              Showing {startItem}-{endItem} of {total} items
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-3 sm:hidden">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-[#3d6c58]/20 bg-white p-4"
              style={{ borderRadius: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[#1f3f2c] truncate">
                    {item.name}
                  </div>
                  <div className="text-sm text-[#4a6741] truncate">
                    {formatInventoryDisplayId(item)} • {item.category}
                  </div>
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
                    <DropdownMenuItem onClick={() => onConsume(item.id)}>
                      <Minus className=" h-4 w-4" />
                      Consume
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewActivity(item.id)}>
                      <History className=" h-4 w-4" />
                      View Activity Log
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-[#4a6741]">Supplier</div>
                  <div className="text-[#1f3f2c] font-medium truncate">
                    {item.supplier}
                  </div>
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
                    {item.currentStock}
                    {item.maxStock ? ` / ${item.maxStock}` : ""} {item.unit}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${getProgressColor(getStockProgress(item))}`}
                      style={{ width: `${getStockProgress(item)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
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
                  <TableCell className="font-medium">
                    {formatInventoryDisplayId(item)}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.currentStock}
                          {item.maxStock ? ` / ${item.maxStock}` : ""}{" "}
                          {item.unit}
                        </span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full transition-all ${getProgressColor(getStockProgress(item))}`}
                          style={{ width: `${getStockProgress(item)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
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
                        <DropdownMenuItem
                          onClick={() => onViewDetails(item.id)}
                        >
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
                        <DropdownMenuItem onClick={() => onConsume(item.id)}>
                          <Minus className=" h-4 w-4" />
                          Consume
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onViewActivity(item.id)}
                        >
                          <History className=" h-4 w-4" />
                          View Activity Log
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-[#4a6741]">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

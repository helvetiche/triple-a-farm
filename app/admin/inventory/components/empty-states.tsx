import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus, Search, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"

// Empty inventory state
export function EmptyInventoryState() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-[#4a6741] mb-4" />
        <h3 className="text-xl font-semibold text-[#1f3f2c] mb-2">No inventory items yet</h3>
        <p className="text-[#4a6741] text-center mb-6 max-w-md">
          Start by adding your first inventory item to track stock levels, suppliers, and manage your farm supplies efficiently.
        </p>
        <Button asChild className="bg-[#3d6c58] hover:bg-[#4e816b]">
          <Link href="/admin/inventory/add">
            <Plus className="w-4 h-4 " />
            Add Your First Item
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// No search results state
export function NoSearchResultsState({ searchValue }: { searchValue: string }) {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Search className="h-16 w-16 text-[#4a6741] mb-4" />
        <h3 className="text-xl font-semibold text-[#1f3f2c] mb-2">No items found</h3>
        <p className="text-[#4a6741] text-center mb-6 max-w-md">
          We couldn't find any inventory items matching "{searchValue}". Try adjusting your search terms or browse all items.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#3d6c58]/20">
            Clear Search
          </Button>
          <Button asChild className="bg-[#3d6c58] hover:bg-[#4e816b]">
            <Link href="/admin/inventory/add">
              <Plus className="w-4 h-4 " />
              Add New Item
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// No alerts state
export function NoAlertsState() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-16 w-16 text-green-600 mb-4" />
        <h3 className="text-xl font-semibold text-[#1f3f2c] mb-2">All stock levels are adequate</h3>
        <p className="text-[#4a6741] text-center mb-6 max-w-md">
          Great job! All your inventory items have sufficient stock levels. No immediate attention is required.
        </p>
        <Button variant="outline" className="border-[#3d6c58]/20">
          View All Inventory
        </Button>
      </CardContent>
    </Card>
  )
}

// No suppliers state
export function NoSuppliersState() {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Users className="h-16 w-16 text-[#4a6741] mb-4" />
        <h3 className="text-xl font-semibold text-[#1f3f2c] mb-2">No suppliers added yet</h3>
        <p className="text-[#4a6741] text-center mb-6 max-w-md">
          Add your first supplier to start tracking vendor relationships, contact information, and order history.
        </p>
        <Button className="bg-[#3d6c58] hover:bg-[#4e816b]">
          <Plus className="w-4 h-4 " />
          Add Supplier
        </Button>
      </CardContent>
    </Card>
  )
}

// Empty category state
export function EmptyCategoryState({ category }: { category: string }) {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-[#4a6741] mb-4" />
        <h3 className="text-xl font-semibold text-[#1f3f2c] mb-2">No {category.toLowerCase()} items</h3>
        <p className="text-[#4a6741] text-center mb-6 max-w-md">
          There are currently no items in the {category.toLowerCase()} category. Add your first {category.toLowerCase()} item to get started.
        </p>
        <Button asChild className="bg-[#3d6c58] hover:bg-[#4e816b]">
          <Link href="/admin/inventory/add">
            <Plus className="w-4 h-4 " />
            Add {category} Item
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

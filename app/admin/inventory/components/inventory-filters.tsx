import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface InventoryFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onFilterClick: () => void
  onClearSearch: () => void
}

export function InventoryFilters({
  searchValue,
  onSearchChange,
  onFilterClick,
  onClearSearch,
}: InventoryFiltersProps) {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <CardTitle className="text-[#1f3f2c]">Search & Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4a6741] w-4 h-4" />
            <Input 
              placeholder="Search by name, category, or supplier..." 
              className="pl-10 border-[#3d6c58]/20"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="border-[#3d6c58]/20 w-full sm:w-auto"
            onClick={onFilterClick}
          >
            <Filter className="w-4 h-4 " />
            Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

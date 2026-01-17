import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"

interface RoosterFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onFilterClick: () => void
}

export function RoosterFilters({ searchValue, onSearchChange, onFilterClick }: RoosterFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative w-full sm:flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search roosters..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-[#3d6c58]/20 focus:border-[#3d6c58]"
        />
      </div>
      <Button
        variant="outline"
        className="border-[#3d6c58]/20 w-full sm:w-auto"
        onClick={onFilterClick}
      >
        <Filter className="h-4 w-4 " />
        Filters
      </Button>
    </div>
  )
}

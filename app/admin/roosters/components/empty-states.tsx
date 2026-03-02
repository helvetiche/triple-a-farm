import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Bird, Plus, Search } from "lucide-react"
import Link from "next/link"

interface RoosterEmptyStateProps {
  type: "no-data" | "no-search-results"
  onClearSearch?: () => void
}

export function RoosterEmptyState({ type, onClearSearch }: RoosterEmptyStateProps) {
  if (type === "no-search-results") {
    return (
      <Empty>
        <EmptyContent>
          <EmptyMedia variant="icon">
            <Search className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No roosters found</EmptyTitle>
          <EmptyDescription>
            We couldn't find any roosters matching your search criteria. 
            Try adjusting your search terms or filters.
          </EmptyDescription>
          {onClearSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              Clear Search
            </Button>
          )}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Empty>
      <EmptyContent>
        <EmptyMedia variant="icon">
          <Bird className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No roosters yet</EmptyTitle>
        <EmptyDescription>
          You haven't added any roosters to your inventory yet. 
          Get started by adding your first rooster to track their health, 
          feed schedules, and sales information.
        </EmptyDescription>
        <Button asChild className="bg-[#3d6c58] hover:bg-[#4e816b]">
          <Link href="/admin/roosters/add">
            <Plus className="h-4 w-4 " />
            Add Your First Rooster
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

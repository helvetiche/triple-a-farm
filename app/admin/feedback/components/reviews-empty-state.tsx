import React from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ReviewsEmptyStateProps = {
  searchValue: string
  onClearSearch: () => void
}

export function ReviewsEmptyState({ searchValue, onClearSearch }: ReviewsEmptyStateProps) {
  return (
    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
      <CardContent className="py-12" style={{ borderRadius: 0 }}>
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-none flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1f3f2c] mb-2">No reviews found</h3>
          <p className="text-[#4a6741] mb-4">No reviews match your search for "{searchValue}"</p>
          <Button variant="outline" className="border-[#3d6c58]/20" onClick={onClearSearch}>
            Clear Search
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

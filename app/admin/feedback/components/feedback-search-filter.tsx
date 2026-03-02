import React from "react"
import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type FeedbackSearchFilterProps = {
  searchValue: string
  onSearchValueChange: (value: string) => void
}

export function FeedbackSearchFilter({
  searchValue,
  onSearchValueChange,
}: FeedbackSearchFilterProps) {
  return (
    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
      <CardHeader style={{ borderRadius: 0 }}>
        <CardTitle className="text-[#1f3f2c]">Search & Filter</CardTitle>
      </CardHeader>
      <CardContent style={{ borderRadius: 0 }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4a6741] w-4 h-4" />
            <Input
              placeholder="Search by customer, rooster, or comment..."
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              className="pl-10 border-[#3d6c58]/20"
            />
          </div>
          <Button variant="outline" className="border-[#3d6c58]/20 w-full sm:w-auto">
            <Filter className="w-4 h-4 " />
            Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

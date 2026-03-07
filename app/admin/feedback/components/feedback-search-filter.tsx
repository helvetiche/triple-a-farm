import React, { useState } from "react";
import { Filter, Search, X, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

type FeedbackSearchFilterProps = {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ratingFilter: string;
  onRatingFilterChange: (value: string) => void;
};

export function FeedbackSearchFilter({
  searchValue,
  onSearchValueChange,
  statusFilter,
  onStatusFilterChange,
  ratingFilter,
  onRatingFilterChange,
}: FeedbackSearchFilterProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (ratingFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    onStatusFilterChange("all");
    onRatingFilterChange("all");
  };

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
          <div className="relative">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#3d6c58]/20 w-full sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-[#3d6c58] text-white">
                      {activeFilterCount}
                    </Badge>
                  )}
                  {isFiltersOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="absolute top-full right-0 z-50 mt-2 w-80">
                <div className="border border-[#3d6c58]/20 rounded-lg bg-white shadow-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#4a6741] mb-2 block">
                        Status
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={onStatusFilterChange}
                      >
                        <SelectTrigger className="border-[#3d6c58]/20">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#4a6741] mb-2 block">
                        Rating
                      </label>
                      <Select
                        value={ratingFilter}
                        onValueChange={onRatingFilterChange}
                      >
                        <SelectTrigger className="border-[#3d6c58]/20">
                          <SelectValue placeholder="All ratings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {activeFilterCount > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t border-[#3d6c58]/20">
                        <div className="text-sm text-[#4a6741]">
                          {activeFilterCount} filter
                          {activeFilterCount > 1 ? "s" : ""} active
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-xs border-[#3d6c58]/20"
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

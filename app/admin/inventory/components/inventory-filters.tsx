import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
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
import { useState } from "react";

interface InventoryFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function InventoryFilters({
  searchValue,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
}: InventoryFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    onCategoryFilterChange("all");
    onStatusFilterChange("all");
  };

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
                        Category
                      </label>
                      <Select
                        value={categoryFilter}
                        onValueChange={onCategoryFilterChange}
                      >
                        <SelectTrigger className="border-[#3d6c58]/20">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Feed">Feed</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                          <SelectItem value="Vitamins">Vitamins</SelectItem>
                          <SelectItem value="Equipment">Equipment</SelectItem>
                          <SelectItem value="Supplements">Supplements</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#4a6741] mb-2 block">
                        Stock Status
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
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="low">Low Stock</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="perfect">Perfect</SelectItem>
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

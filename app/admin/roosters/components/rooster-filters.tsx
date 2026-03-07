import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useState, useEffect } from "react";

interface RoosterFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  breedFilter: string;
  onBreedFilterChange: (value: string) => void;
}

export function RoosterFilters({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  breedFilter,
  onBreedFilterChange,
}: RoosterFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [breeds, setBreeds] = useState<Array<{ breedId: string; name: string }>>([]);

  // Fetch breeds
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch("/api/public/breeds");
        const result = await response.json();
        if (result.success && result.data) {
          setBreeds(result.data);
        }
      } catch (error) {
        console.error("Error fetching breeds:", error);
      }
    };
    fetchBreeds();
  }, []);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) + (breedFilter !== "all" ? 1 : 0);

  const handleClearFilters = () => {
    onStatusFilterChange("all");
    onBreedFilterChange("all");
  };

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
      <div className="relative">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="border-[#3d6c58]/20 w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-[#3d6c58] text-white">
                  {activeFilterCount}
                </Badge>
              )}
              {isFiltersOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
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
                  <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="border-[#3d6c58]/20">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Quarantine">Quarantine</SelectItem>
                      <SelectItem value="Deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#4a6741] mb-2 block">
                    Breed
                  </label>
                  <Select value={breedFilter} onValueChange={onBreedFilterChange}>
                    <SelectTrigger className="border-[#3d6c58]/20">
                      <SelectValue placeholder="All breeds" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Breeds</SelectItem>
                      {breeds.map((breed) => (
                        <SelectItem key={breed.breedId} value={breed.breedId}>
                          {breed.name}
                        </SelectItem>
                      ))}
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
  );
}

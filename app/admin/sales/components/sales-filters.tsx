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
import { useState } from "react";

interface SalesFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  paymentMethodFilter: string;
  onPaymentMethodFilterChange: (value: string) => void;
}

export function SalesFilters({
  searchValue,
  onSearchChange,
  paymentMethodFilter,
  onPaymentMethodFilterChange,
}: SalesFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount = paymentMethodFilter !== "all" ? 1 : 0;

  const handleClearFilters = () => {
    onPaymentMethodFilterChange("all");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by customer, breed, or transaction ID..."
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
                    Payment Method
                  </label>
                  <Select
                    value={paymentMethodFilter}
                    onValueChange={onPaymentMethodFilterChange}
                  >
                    <SelectTrigger className="border-[#3d6c58]/20">
                      <SelectValue placeholder="All payment methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t border-[#3d6c58]/20">
                    <div className="text-sm text-[#4a6741]">
                      {activeFilterCount} filter active
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

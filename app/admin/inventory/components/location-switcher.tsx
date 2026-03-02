"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

export interface FarmLocation {
  locationId: string;
  name: string;
  address?: string;
}

interface LocationSwitcherProps {
  selectedLocationId: string | null;
  onLocationChange: (location: FarmLocation | null) => void;
  locations: FarmLocation[];
  isLoading?: boolean;
}

export const LocationSwitcher = ({
  selectedLocationId,
  onLocationChange,
  locations,
  isLoading = false,
}: LocationSwitcherProps) => {
  const selectedLocation = locations.find(
    (loc) => loc.locationId === selectedLocationId
  );

  const handleValueChange = (value: string) => {
    if (value === "all") {
      onLocationChange(null);
      return;
    }

    const location = locations.find((loc) => loc.locationId === value);
    if (location) {
      onLocationChange(location);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-[#3d6c58]/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#3d6c58]" />
            <span className="text-sm text-[#4a6741]">Loading locations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card className="border-[#3d6c58]/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#3d6c58]" />
            <span className="text-sm text-[#4a6741]">
              No farm locations found. Please create a location first.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#3d6c58]/20">
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#3d6c58]" />
            <div>
              <p className="text-sm font-medium text-[#1f3f2c]">
                Farm Location
              </p>
              {selectedLocation?.address && (
                <p className="text-xs text-[#4a6741]">
                  {selectedLocation.address}
                </p>
              )}
            </div>
          </div>

          <Select
            value={selectedLocationId || "all"}
            onValueChange={handleValueChange}
          >
            <SelectTrigger className="w-full sm:w-[280px] border-[#3d6c58]/20">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem
                  key={location.locationId}
                  value={location.locationId}
                >
                  <div className="flex flex-col">
                    <span>{location.name}</span>
                    {location.address && (
                      <span className="text-xs text-gray-500">
                        {location.address}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

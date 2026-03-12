// Rooster data types and utilities

export interface Vaccination {
  name: string;
  date: string;
}

export interface BreedOption {
  breedId: string;
  name: string;
}

export interface Rooster {
  id: string;
  breedId: string;
  breed: string;
  name: string;
  nameLower?: string; // Lowercase version for efficient search indexing
  age: string;
  weight: string;
  price: string;
  status: "Available" | "Sold" | "Reserved" | "Quarantine" | "Deceased";
  health: "excellent" | "good" | "fair" | "poor";
  images: string[];
  dateAdded: string;
  description: string;
  locationId: string;
  location: string; // Keep for backward compatibility and display
  locationAddress?: string;
  owner?: string;
  image?: string; // Added for backward compatibility
  vaccinations?: Vaccination[];
}

// Available breeds for dropdown/select - now fetched dynamically from API
export const getRoosterBreeds = async (): Promise<string[]> => {
  try {
    const response = await fetch("/api/public/breeds");
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map((breed: { name: string }) => breed.name);
    }

    // Fallback to hardcoded breeds if API fails
    return fallbackBreeds;
  } catch (error) {
    console.error("Error fetching breeds:", error);
    return fallbackBreeds;
  }
};

export const getRoosterBreedsWithIds = async (): Promise<BreedOption[]> => {
  try {
    const response = await fetch("/api/public/breeds");
    const result = await response.json();

    if (result.success && result.data) {
      return result.data
        .map(
          (breed: { breedId?: string; id?: string; name: string }) =>
            ({
              breedId: breed.breedId || breed.id || "",
              name: breed.name,
            }) satisfies BreedOption
        )
        .filter((breed: BreedOption) => breed.breedId && breed.name);
    }

    return fallbackBreeds.map((name) => ({
      breedId: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }));
  } catch (error) {
    console.error("Error fetching breeds:", error);
    return fallbackBreeds.map((name) => ({
      breedId: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }));
  }
};

// Fallback breeds for when API is unavailable
export const fallbackBreeds = [
  "Kelso",
  "Sweater",
  "Roundhead",
  "Hatch",
  "Grey",
  "Butcher",
  "Lemon",
  "Claret",
];

// Legacy export for backward compatibility - use getRoosterBreeds() instead
export const roosterBreeds = fallbackBreeds;

// Location interface for dropdown
export interface LocationOption {
  locationId: string;
  name: string;
  address?: string;
}

// Available locations for dropdown/select - now fetched dynamically from API
export const getRoosterLocations = async (): Promise<string[]> => {
  try {
    const response = await fetch("/api/public/locations");
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map((location: { name: string }) => location.name);
    }

    // Fallback to default location if API fails
    return fallbackLocations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return fallbackLocations;
  }
};

// Get locations with IDs for forms
export const getRoosterLocationsWithIds = async (): Promise<
  LocationOption[]
> => {
  try {
    const response = await fetch("/api/public/locations");
    const result = await response.json();

    if (result.success && result.data) {
      return result.data.map(
        (location: {
          locationId?: string;
          id?: string;
          name: string;
          address?: string;
        }) => ({
          locationId: location.locationId || location.id,
          name: location.name,
          address: location.address,
        })
      );
    }

    // Fallback to empty array if API fails
    return [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

// Fallback locations for when API is unavailable
export const fallbackLocations = ["Main Farm"];

// Status options
export const roosterStatuses = [
  {
    value: "Available",
    label: "Available",
    color: "bg-green-100 text-green-800",
  },
  { value: "Sold", label: "Sold", color: "bg-gray-100 text-gray-800" },
  {
    value: "Reserved",
    label: "Reserved",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "Quarantine",
    label: "Quarantine",
    color: "bg-red-100 text-red-800",
  },
  { value: "Deceased", label: "Deceased", color: "bg-red-100 text-red-800" },
];

// Health status options
export const healthStatuses = [
  {
    value: "excellent",
    label: "Excellent",
    color: "bg-green-100 text-green-800",
  },
  { value: "good", label: "Good", color: "bg-blue-100 text-blue-800" },
  { value: "fair", label: "Fair", color: "bg-yellow-100 text-yellow-800" },
  { value: "poor", label: "Poor", color: "bg-red-100 text-red-800" },
];

// Utility functions
export const getRoosterStats = (roosters: Rooster[]) => {
  const total = roosters.length;
  const available = roosters.filter((r) => r.status === "Available").length;
  const sold = roosters.filter((r) => r.status === "Sold").length;
  const reserved = roosters.filter((r) => r.status === "Reserved").length;
  const quarantine = roosters.filter((r) => r.status === "Quarantine").length;

  const totalValue = roosters.reduce(
    (sum, r) => sum + parseFloat(r.price || "0"),
    0
  );
  const availableValue = roosters
    .filter((r) => r.status === "Available")
    .reduce((sum, r) => sum + parseFloat(r.price || "0"), 0);

  const averagePrice = total > 0 ? totalValue / total : 0;

  // Most popular breed
  const breedCounts = roosters.reduce(
    (acc, r) => {
      acc[r.breed] = (acc[r.breed] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topBreed =
    Object.entries(breedCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

  return {
    total,
    available,
    sold,
    reserved,
    quarantine,
    totalValue,
    availableValue,
    averagePrice,
    topBreed,
  };
};

export const filterRoosters = (roosters: Rooster[], searchValue: string) => {
  if (!searchValue) return roosters;

  const search = searchValue.toLowerCase();
  return roosters.filter(
    (rooster) =>
      rooster.id.toLowerCase().includes(search) ||
      rooster.breed.toLowerCase().includes(search) ||
      rooster.location.toLowerCase().includes(search) ||
      rooster.status.toLowerCase().includes(search)
  );
};

export const getAvailableRoosters = (roosters: Rooster[]) => {
  return roosters.filter((r) => {
    // Handle case-insensitive matching and trim whitespace
    const status = String(r.status || "").trim();
    return status === "Available" || status.toLowerCase() === "available";
  });
};

export const getRoosterById = (roosters: Rooster[], id: string) => {
  return roosters.find((r) => r.id === id);
};

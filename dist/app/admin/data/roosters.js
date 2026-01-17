"use strict";
// Rooster data types and utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoosterById = exports.getAvailableRoosters = exports.filterRoosters = exports.getRoosterStats = exports.healthStatuses = exports.roosterStatuses = exports.roosterBreeds = exports.fallbackBreeds = exports.getRoosterBreeds = void 0;
// Available breeds for dropdown/select - now fetched dynamically from API
const getRoosterBreeds = async () => {
    try {
        const response = await fetch('/api/public/breeds');
        const result = await response.json();
        if (result.success && result.data) {
            return result.data.map((breed) => breed.name);
        }
        // Fallback to hardcoded breeds if API fails
        return exports.fallbackBreeds;
    }
    catch (error) {
        console.error('Error fetching breeds:', error);
        return exports.fallbackBreeds;
    }
};
exports.getRoosterBreeds = getRoosterBreeds;
// Fallback breeds for when API is unavailable
exports.fallbackBreeds = [
    "Kelso",
    "Sweater",
    "Roundhead",
    "Hatch",
    "Grey",
    "Butcher",
    "Lemon",
    "Claret"
];
// Legacy export for backward compatibility - use getRoosterBreeds() instead
exports.roosterBreeds = exports.fallbackBreeds;
// Status options
exports.roosterStatuses = [
    { value: "Available", label: "Available", color: "bg-green-100 text-green-800" },
    { value: "Sold", label: "Sold", color: "bg-gray-100 text-gray-800" },
    { value: "Reserved", label: "Reserved", color: "bg-yellow-100 text-yellow-800" },
    { value: "Quarantine", label: "Quarantine", color: "bg-red-100 text-red-800" },
    { value: "Deceased", label: "Deceased", color: "bg-red-100 text-red-800" }
];
// Health status options
exports.healthStatuses = [
    { value: "excellent", label: "Excellent", color: "bg-green-100 text-green-800" },
    { value: "good", label: "Good", color: "bg-blue-100 text-blue-800" },
    { value: "fair", label: "Fair", color: "bg-yellow-100 text-yellow-800" },
    { value: "poor", label: "Poor", color: "bg-red-100 text-red-800" }
];
// Utility functions
const getRoosterStats = (roosters) => {
    const total = roosters.length;
    const available = roosters.filter(r => r.status === 'Available').length;
    const sold = roosters.filter(r => r.status === 'Sold').length;
    const reserved = roosters.filter(r => r.status === 'Reserved').length;
    const quarantine = roosters.filter(r => r.status === 'Quarantine').length;
    const totalValue = roosters.reduce((sum, r) => sum + parseFloat(r.price || '0'), 0);
    const availableValue = roosters.filter(r => r.status === 'Available').reduce((sum, r) => sum + parseFloat(r.price || '0'), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;
    // Most popular breed
    const breedCounts = roosters.reduce((acc, r) => {
        acc[r.breed] = (acc[r.breed] || 0) + 1;
        return acc;
    }, {});
    const topBreed = Object.entries(breedCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    return {
        total,
        available,
        sold,
        reserved,
        quarantine,
        totalValue,
        availableValue,
        averagePrice,
        topBreed
    };
};
exports.getRoosterStats = getRoosterStats;
const filterRoosters = (roosters, searchValue) => {
    if (!searchValue)
        return roosters;
    const search = searchValue.toLowerCase();
    return roosters.filter(rooster => rooster.id.toLowerCase().includes(search) ||
        rooster.name.toLowerCase().includes(search) ||
        rooster.breed.toLowerCase().includes(search) ||
        rooster.status.toLowerCase().includes(search) ||
        rooster.location.toLowerCase().includes(search));
};
exports.filterRoosters = filterRoosters;
const getAvailableRoosters = (roosters) => {
    return roosters.filter(r => {
        // Handle case-insensitive matching and trim whitespace
        const status = String(r.status || '').trim();
        return status === 'Available' || status.toLowerCase() === 'available';
    });
};
exports.getAvailableRoosters = getAvailableRoosters;
const getRoosterById = (roosters, id) => {
    return roosters.find(r => r.id === id);
};
exports.getRoosterById = getRoosterById;

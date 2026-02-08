"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FarmLocation {
  id: string;
  name: string;
  address?: string;
}

interface LocationManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationManagementDialog({ open, onOpenChange }: LocationManagementDialogProps) {
  const [locations, setLocations] = useState<FarmLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FarmLocation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/roosters/locations");
      const result = await response.json();

      if (result.success) {
        setLocations(result.data || []);
      } else {
        toast.error("Failed to load locations");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLocations();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
    });
    setEditingLocation(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Location name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingLocation
        ? `/api/roosters/locations`
        : `/api/roosters/locations`;

      const method = editingLocation ? "PUT" : "POST";
      const payload = editingLocation
        ? { id: editingLocation.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingLocation ? "Location updated successfully" : "Location created successfully"
        );
        resetForm();
        fetchLocations();
      } else {
        toast.error(result.message || "Failed to save location");
      }
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (location: FarmLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (location: FarmLocation) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roosters/locations?id=${location.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Location deleted successfully");
        fetchLocations();
      } else {
        toast.error(result.message || "Failed to delete location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Farm Location Management</DialogTitle>
          <DialogDescription>
            Manage farm locations. Add, edit, or remove locations from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="border p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter location name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address (optional)"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingLocation ? "Update Location" : "Add Location"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Locations List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Existing Locations</h3>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No locations found. Add your first location to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="border p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{location.name}</h4>
                      </div>
                      {location.address && (
                        <p className="text-sm text-gray-600">{location.address}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(location)}
                        disabled={showAddForm}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(location)}
                        disabled={showAddForm}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
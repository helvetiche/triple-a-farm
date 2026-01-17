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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoosterBreed {
  id: string;
  name: string;
  description?: string;
  characteristics?: string[];
  origin?: string;
}

interface BreedManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BreedManagementDialog({ open, onOpenChange }: BreedManagementDialogProps) {
  const [breeds, setBreeds] = useState<RoosterBreed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBreed, setEditingBreed] = useState<RoosterBreed | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    characteristics: [] as string[],
    origin: "",
  });

  const [newCharacteristic, setNewCharacteristic] = useState("");

  const fetchBreeds = async () => {
    try {
      const response = await fetch("/api/roosters/breeds");
      const result = await response.json();
      
      if (result.success) {
        setBreeds(result.data || []);
      } else {
        toast.error("Failed to load breeds");
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
      toast.error("Failed to load breeds");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchBreeds();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      characteristics: [],
      origin: "",
    });
    setNewCharacteristic("");
    setEditingBreed(null);
    setShowAddForm(false);
  };

  const handleAddCharacteristic = () => {
    if (newCharacteristic.trim() && !formData.characteristics.includes(newCharacteristic.trim())) {
      setFormData(prev => ({
        ...prev,
        characteristics: [...prev.characteristics, newCharacteristic.trim()]
      }));
      setNewCharacteristic("");
    }
  };

  const handleRemoveCharacteristic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Breed name is required");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = editingBreed 
        ? `/api/roosters/breeds`
        : `/api/roosters/breeds`;
      
      const method = editingBreed ? "PUT" : "POST";
      const payload = editingBreed 
        ? { id: editingBreed.id, ...formData }
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
          editingBreed ? "Breed updated successfully" : "Breed created successfully"
        );
        resetForm();
        fetchBreeds();
      } else {
        toast.error(result.message || "Failed to save breed");
      }
    } catch (error) {
      console.error("Error saving breed:", error);
      toast.error("Failed to save breed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (breed: RoosterBreed) => {
    setEditingBreed(breed);
    setFormData({
      name: breed.name,
      description: breed.description || "",
      characteristics: breed.characteristics || [],
      origin: breed.origin || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (breed: RoosterBreed) => {
    if (!confirm(`Are you sure you want to delete "${breed.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roosters/breeds?id=${breed.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Breed deleted successfully");
        fetchBreeds();
      } else {
        toast.error(result.message || "Failed to delete breed");
      }
    } catch (error) {
      console.error("Error deleting breed:", error);
      toast.error("Failed to delete breed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Breed Management</DialogTitle>
          <DialogDescription>
            Manage rooster breeds. Add, edit, or remove breeds from the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">
                {editingBreed ? "Edit Breed" : "Add New Breed"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Breed Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter breed name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                      placeholder="Enter origin (e.g., USA, Philippines)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter breed description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Characteristics</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCharacteristic}
                      onChange={(e) => setNewCharacteristic(e.target.value)}
                      placeholder="Add characteristic"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCharacteristic())}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCharacteristic}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.characteristics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.characteristics.map((char, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {char}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleRemoveCharacteristic(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBreed ? "Update Breed" : "Add Breed"}
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

          {/* Breeds List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Existing Breeds</h3>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Breed
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : breeds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No breeds found. Add your first breed to get started.
              </div>
            ) : (
              <div className="grid gap-4">
                {breeds.map((breed) => (
                  <div
                    key={breed.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{breed.name}</h4>
                        {breed.origin && (
                          <Badge variant="outline">{breed.origin}</Badge>
                        )}
                      </div>
                      {breed.description && (
                        <p className="text-sm text-gray-600 mb-2">{breed.description}</p>
                      )}
                      {breed.characteristics && breed.characteristics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {breed.characteristics.map((char, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {char}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(breed)}
                        disabled={showAddForm}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(breed)}
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

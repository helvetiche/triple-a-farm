"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Bird, Save, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "../../components";
import { toastCRUD } from "../../utils/toast";
import {
  getRoosterBreeds,
  roosterStatuses,
  healthStatuses,
  type Rooster,
} from "../../../data/roosters";

export const description = "Edit Rooster";

export default function EditRoosterPage() {
  const params = useParams();
  const router = useRouter();
  const roosterId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for dynamic breeds
  const [breeds, setBreeds] = useState<string[]>([]);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true);

  // State for form fields
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    breed: "",
    age: "",
    weight: "",
    status: "",
    health: "",
    price: "",
    description: "",
    location: "",
    owner: "",
  });
  const [vaccinations, setVaccinations] = useState<Array<{ name: string; date: string }>>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load rooster data from API
  useEffect(() => {
    const fetchRooster = async () => {
      if (!roosterId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/roosters/${roosterId}`);
        const result = await response.json();

        if (result.success && result.data) {
          const rooster = result.data as Rooster;
          setFormData({
            id: rooster.id || "",
            name: rooster.name || "",
            breed: rooster.breed || "",
            age: rooster.age || "",
            weight: rooster.weight || "",
            status: rooster.status || "",
            health: rooster.health || "",
            price: rooster.price || "",
            description: rooster.description || "",
            location: rooster.location || "",
            owner: rooster.owner || "",
          });
          setImages(rooster.images || []);
          setVaccinations(rooster.vaccinations || []);
        } else {
          toastCRUD.loadError("rooster");
          router.push("/admin/roosters");
        }
      } catch (error) {
        toastCRUD.networkError();
        console.error("Error fetching rooster:", error);
        router.push("/admin/roosters");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooster();
  }, [roosterId, router]);

  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedsList = await getRoosterBreeds()
        setBreeds(breedsList)
      } catch (error) {
        console.error('Error fetching breeds:', error)
      } finally {
        setIsLoadingBreeds(false)
      }
    }
    
    fetchBreeds()
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadPromises: Promise<string>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("image", file);

      const uploadPromise = fetch("/api/roosters/upload-image", {
        method: "POST",
        body: formData,
      }).then(async (res) => {
        const result = await res.json();
        if (result.success) {
          return result.data.url;
        } else {
          throw new Error(result.error?.message || "Upload failed");
        }
      });

      uploadPromises.push(uploadPromise);
    }

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
      toastCRUD.createSuccess(
        "Images",
        `${uploadedUrls.length} image(s) uploaded`
      );
    } catch (error) {
      toastCRUD.createError(
        "images",
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVaccination = () => {
    setVaccinations((prev) => [...prev, { name: "", date: "" }]);
  };

  const handleRemoveVaccination = (index: number) => {
    setVaccinations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVaccinationChange = (index: number, field: "name" | "date", value: string) => {
    setVaccinations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    if (
      !formData.id ||
      !formData.breed ||
      !formData.age ||
      !formData.weight ||
      !formData.price ||
      !formData.status ||
      !formData.health
    ) {
      toastCRUD.validationError("required fields");
      return;
    }

    setIsSaving(true);

    try {
      // Filter out empty vaccinations
      const validVaccinations = vaccinations.filter(v => v.name.trim() && v.date.trim());

      const roosterData = {
        name: formData.name || formData.breed,
        breed: formData.breed,
        age: formData.age,
        weight: formData.weight,
        price: formData.price,
        status: formData.status as
          | "Available"
          | "Sold"
          | "Reserved"
          | "Quarantine"
          | "Deceased",
        health: formData.health as "excellent" | "good" | "fair" | "poor",
        description: formData.description || "",
        images: images,
        location: formData.location || "Main Farm",
        owner: formData.owner.trim() || undefined,
        vaccinations: validVaccinations.length > 0 ? validVaccinations : undefined,
        image: images[0] || undefined,
      };

      const response = await fetch(`/api/roosters/${roosterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roosterData),
      });

      const result = await response.json();

      if (result.success) {
        toastCRUD.roosterUpdated(formData.name);
        router.push("/admin/roosters");
      } else {
        toastCRUD.updateError("rooster", result.error?.message);
      }
    } catch (error) {
      toastCRUD.networkError();
      console.error("Error updating rooster:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/roosters/${roosterId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toastCRUD.roosterDeleted(formData.id);
        router.push("/admin/roosters");
      } else {
        toastCRUD.deleteError("rooster", result.error?.message);
      }
    } catch (error) {
      toastCRUD.networkError();
      console.error("Error deleting rooster:", error);
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/roosters">
                      <ArrowLeft className="w-4 h-4 " />
                      Back to Inventory
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-[#1f3f2c]">
                      Edit Rooster
                    </h1>
                    <p className="text-[#4a6741]">
                      Update rooster profile information
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 " />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <Card className="border-[#3d6c58]/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-[#1f3f2c]">
                      Rooster Information
                    </CardTitle>
                    <CardDescription>
                      Update the details about the rooster
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1f3f2c]">
                        Basic Information
                      </h3>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Spinner className="w-8 h-8" />
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="id">Rooster ID</Label>
                              <Input
                                id="id"
                                value={formData.id}
                                onChange={(e) =>
                                  handleInputChange("id", e.target.value)
                                }
                                className="border-[#3d6c58]/20 text-black"
                                disabled
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                  handleInputChange("name", e.target.value)
                                }
                                placeholder="Thunder Strike"
                                className="border-[#3d6c58]/20 text-black"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="breed">Breed</Label>
                              <Select
                                value={formData.breed}
                                onValueChange={(value) =>
                                  handleInputChange("breed", value)
                                }
                              >
                                <SelectTrigger className="border-[#3d6c58]/20">
                                  <SelectValue placeholder="Select breed" />
                                </SelectTrigger>
                                <SelectContent>
                                  {isLoadingBreeds ? (
                                    <SelectItem value="loading" disabled>
                                      Loading breeds...
                                    </SelectItem>
                                  ) : (
                                    breeds.map((breed: string) => (
                                      <SelectItem key={breed} value={breed}>
                                        {breed}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="age">Age</Label>
                              <Input
                                id="age"
                                value={formData.age}
                                onChange={(e) =>
                                  handleInputChange("age", e.target.value)
                                }
                                placeholder="18 months"
                                className="border-[#3d6c58]/20 text-black"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="weight">Weight</Label>
                              <Input
                                id="weight"
                                value={formData.weight}
                                onChange={(e) =>
                                  handleInputChange("weight", e.target.value)
                                }
                                placeholder="4.5 kg"
                                className="border-[#3d6c58]/20 text-black"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                  handleInputChange("status", value)
                                }
                              >
                                <SelectTrigger className="border-[#3d6c58]/20">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roosterStatuses.map((status) => (
                                    <SelectItem
                                      key={status.value}
                                      value={status.value}
                                    >
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="health">Health Status</Label>
                              <Select
                                value={formData.health}
                                onValueChange={(value) =>
                                  handleInputChange("health", value)
                                }
                              >
                                <SelectTrigger className="border-[#3d6c58]/20">
                                  <SelectValue placeholder="Select health status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {healthStatuses.map((health) => (
                                    <SelectItem
                                      key={health.value}
                                      value={health.value}
                                    >
                                      {health.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) =>
                                  handleInputChange("location", e.target.value)
                                }
                                placeholder="Main Farm"
                                className="border-[#3d6c58]/20 text-black"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1f3f2c]">
                        Pricing
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">Selling Price (₱)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                              handleInputChange("price", e.target.value)
                            }
                            placeholder="15000"
                            className="border-[#3d6c58]/20 text-black"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="owner">Owner (if sold)</Label>
                          <Input
                            id="owner"
                            value={formData.owner}
                            onChange={(e) =>
                              handleInputChange("owner", e.target.value)
                            }
                            placeholder="Owner name"
                            className="border-[#3d6c58]/20 text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1f3f2c]">
                        Additional Information
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Describe the rooster's characteristics, temperament, fighting style, etc."
                          className="border-[#3d6c58]/20 text-black"
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Vaccination Records */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#1f3f2c]">
                          Vaccination Records
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddVaccination}
                          className="border-[#3d6c58]/20"
                        >
                          Add Vaccination
                        </Button>
                      </div>
                      {vaccinations.length === 0 ? (
                        <p className="text-sm text-[#4a6741]">
                          No vaccination records yet. Click "Add Vaccination" to add one.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {vaccinations.map((vaccination, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-start p-3 border border-[#3d6c58]/20 rounded-md"
                            >
                              <div className="flex-1 grid gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label htmlFor={`vax-name-${index}`} className="text-xs">
                                    Vaccine Name
                                  </Label>
                                  <Input
                                    id={`vax-name-${index}`}
                                    value={vaccination.name}
                                    onChange={(e) =>
                                      handleVaccinationChange(index, "name", e.target.value)
                                    }
                                    placeholder="e.g., Newcastle Disease"
                                    className="border-[#3d6c58]/20 text-black"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`vax-date-${index}`} className="text-xs">
                                    Date Administered
                                  </Label>
                                  <Input
                                    id={`vax-date-${index}`}
                                    type="date"
                                    value={vaccination.date}
                                    onChange={(e) =>
                                      handleVaccinationChange(index, "date", e.target.value)
                                    }
                                    className="border-[#3d6c58]/20 text-black"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveVaccination(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Delete Confirmation Dialog */}
                  <ConfirmDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Delete Rooster"
                    description={`Are you sure you want to delete ${formData.breed} rooster "${formData.id}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="destructive"
                    onConfirm={handleDelete}
                  />
                  {/* Image Upload */}
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c]">
                        Rooster Photos
                      </CardTitle>
                      <CardDescription>
                        Update images for the sales display
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-[#3d6c58]/30 p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-[#3d6c58]/50 mb-4" />
                        <p className="text-sm text-[#4a6741] mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-[#4a6741]">
                          PNG, JPG, GIF up to 10MB
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4 border-[#3d6c58]/20"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImages}
                        >
                          {uploadingImages ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Uploading...
                            </>
                          ) : (
                            "Select Files"
                          )}
                        </Button>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {images.map((url, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded overflow-hidden border border-[#3d6c58]/20"
                            >
                              <Image
                                src={url}
                                alt={`Rooster image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-[#4a6741]">
                        <p>• Upload at least 3 photos</p>
                        <p>• Include side and front views</p>
                        <p>• Good lighting recommended</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Tips */}
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c] flex items-center gap-2">
                        <Bird className="w-5 h-5" />
                        Edit Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-[#4a6741] space-y-2">
                        <p>• Keep ID unique and consistent</p>
                        <p>• Update weight regularly</p>
                        <p>• Maintain accurate health records</p>
                        <p>• Refresh photos periodically</p>
                        <p>• Update descriptions with performance</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card className="border-[#3d6c58]/20">
                    <CardContent className="pt-6 space-y-3">
                      <Button
                        className="w-full bg-[#3d6c58] hover:bg-[#4e816b]"
                        onClick={handleSave}
                        disabled={isSaving || uploadingImages || isLoading}
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="w-4 h-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-[#4a6741]"
                        asChild
                      >
                        <Link href="/admin/roosters">Cancel</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

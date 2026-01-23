"use client"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { EnhancedDropzone } from "@/components/ui/enhanced-dropzone"
import { ArrowLeft, Upload, Bird, X } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toastCRUD } from "../utils/toast"
import { getRoosterBreeds, roosterStatuses, healthStatuses } from "../../data/roosters"
import Image from "next/image"

export const description = "Add New Rooster"

export default function AddRoosterPage() {
  const router = useRouter()
  // State for dynamic breeds
  const [breeds, setBreeds] = useState<string[]>([])
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(true)
  
  // State for form fields
  const [formData, setFormData] = useState({
    id: "",
    breedId: "",
    breed: "",
    age: "",
    weight: "",
    price: "",
    status: "",
    health: "",
    owner: "",
  })
  const [vaccinations, setVaccinations] = useState<Array<{ name: string; date: string }>>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [images, setImages] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

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
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
      !formData.breedId ||
      !formData.breed ||
      !formData.age ||
      !formData.weight ||
      !formData.price ||
      !formData.status ||
      !formData.health
    ) {
      toastCRUD.validationError("required fields")
      return
    }

    if (imageFiles.length === 0) {
      toastCRUD.validationError("images")
      return
    }

    setIsSaving(true)

    try {
      // Upload images first
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/roosters/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload image')
        }

        const result = await response.json()
        return result.data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(uploadedUrls)

      const dateAdded = new Date().toISOString().split("T")[0]

      // Filter out empty vaccinations
      const validVaccinations = vaccinations.filter(v => v.name.trim() && v.date.trim());

      const roosterData = {
        id: formData.id,
        breedId: formData.breedId,
        breed: formData.breed,
        name: formData.breed, // Use breed as name for now
        age: formData.age,
        weight: formData.weight,
        price: formData.price,
        status: formData.status as "Available" | "Sold" | "Reserved" | "Quarantine" | "Deceased",
        health: formData.health as "excellent" | "good" | "fair" | "poor",
        images: uploadedUrls,
        dateAdded: dateAdded,
        description: "", // Empty for now
        location: "Main Farm", // Default location
        owner: formData.owner || undefined,
        vaccinations: validVaccinations.length > 0 ? validVaccinations : undefined,
        image: uploadedUrls[0] || undefined,
      }

      const response = await fetch("/api/roosters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roosterData),
      })

      const result = await response.json()

      if (result.success) {
        toastCRUD.roosterAdded(formData.breed)
        router.push("/admin/roosters")
      } else {
        toastCRUD.createError("rooster", result.error?.message)
      }
    } catch (error) {
      toastCRUD.networkError()
      console.error("Error creating rooster:", error)
    } finally {
      setIsSaving(false)
    }
  }

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
                    <h1 className="text-3xl font-bold text-[#1f3f2c]">Add New Rooster</h1>
                    <p className="text-[#4a6741]">Create a profile for a new rooster</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <Card className="border-[#3d6c58]/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-[#1f3f2c]">Rooster Information</CardTitle>
                    <CardDescription>Fill in the details about the rooster</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1f3f2c]">Basic Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="id">Rooster ID</Label>
                          <Input 
                            id="id" 
                            value={formData.id}
                            onChange={(e) => handleInputChange("id", e.target.value)}
                            placeholder="TR-001" 
                            className="border-[#3d6c58]/20 text-black" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="breed">Breed</Label>
                          <Select value={formData.breed} onValueChange={(value) => {
                            handleInputChange("breed", value);
                            handleInputChange("breedId", value.toLowerCase().replace(/\s+/g, '-'));
                          }}>
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
                            onChange={(e) => handleInputChange("age", e.target.value)}
                            placeholder="18 months" 
                            className="border-[#3d6c58]/20 text-black" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight</Label>
                          <Input 
                            id="weight" 
                            value={formData.weight}
                            onChange={(e) => handleInputChange("weight", e.target.value)}
                            placeholder="4.5 kg" 
                            className="border-[#3d6c58]/20 text-black" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                            <SelectTrigger className="border-[#3d6c58]/20">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {roosterStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="health">Health Status</Label>
                          <Select value={formData.health} onValueChange={(value) => handleInputChange("health", value)}>
                            <SelectTrigger className="border-[#3d6c58]/20">
                              <SelectValue placeholder="Select health status" />
                            </SelectTrigger>
                            <SelectContent>
                              {healthStatuses.map((health) => (
                                <SelectItem key={health.value} value={health.value}>
                                  {health.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>


                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#1f3f2c]">Pricing</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">Selling Price (₱)</Label>
                          <Input 
                            id="price" 
                            type="number" 
                            value={formData.price}
                            onChange={(e) => handleInputChange("price", e.target.value)}
                            placeholder="15000" 
                            className="border-[#3d6c58]/20 text-black" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="owner">Owner (if sold)</Label>
                          <Input 
                            id="owner" 
                            value={formData.owner}
                            onChange={(e) => handleInputChange("owner", e.target.value)}
                            placeholder="Owner name" 
                            className="border-[#3d6c58]/20 text-black" 
                          />
                        </div>
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
                  {/* Image Upload */}
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c]">Rooster Photos</CardTitle>
                      <CardDescription>Upload images for the sales display</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <EnhancedDropzone
                        value={imageFiles}
                        onValueChange={setImageFiles}
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        multiple
                        maxFiles={10}
                        maxSize={10}
                        disabled={isSaving}
                      />
                      <div className="text-xs text-[#4a6741]">
                        <p>• Upload high-quality photos (max 10MB each)</p>
                        <p>• Include side, front, and detail views</p>
                        <p>• Good lighting and clear background recommended</p>
                        <p>• Minimum 3 photos recommended for better sales</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Tips */}
                  <Card className="border-[#3d6c58]/20">
                    <CardHeader>
                      <CardTitle className="text-[#1f3f2c] flex items-center gap-2">
                        <Bird className="w-5 h-5" />
                        Quick Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-[#4a6741] space-y-2">
                        <p>• Use unique IDs for easy tracking</p>
                        <p>• Accurate weight affects pricing</p>
                        <p>• Health records build trust</p>
                        <p>• Quality photos increase sales</p>
                        <p>• Detailed descriptions help buyers</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card className="border-[#3d6c58]/20">
                    <CardContent className="pt-6 space-y-3">
                      <Button 
                        className="w-full bg-[#3d6c58] hover:bg-[#4e816b]"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="w-4 h-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Rooster Profile"
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
  )
}

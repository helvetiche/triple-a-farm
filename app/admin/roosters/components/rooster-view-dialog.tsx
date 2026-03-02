"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar, 
  Weight, 
  Heart, 
  MapPin,
  Edit, 
  Trash2,
  X,
  Bird,
  PhilippinePeso,
  ZoomIn
} from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"

import Zoom from "yet-another-react-lightbox/plugins/zoom"

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false })

interface RoosterViewDialogProps {
  rooster: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function RoosterViewDialog({ 
  rooster, 
  open, 
  onOpenChange, 
  onEdit, 
  onDelete 
}: RoosterViewDialogProps) {
  if (!rooster) return null

  const [lightboxOpen, setLightboxOpen] = useState(false)

  const slides = useMemo(
    () => [
      {
        src: rooster.image || "/images/roosters/rooster-sample.jpg",
        alt: `${rooster.breed || "Rooster"} - ${rooster.id}`,
      },
    ],
    [rooster]
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "quarantine":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200"
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bird className="w-6 h-6 text-[#3d6c58]" />
              <div>
                <DialogTitle className="text-xl text-[#1f3f2c]">
                  {rooster.breed} Rooster
                </DialogTitle>
                <DialogDescription className="text-[#4a6741]">
                  ID: {rooster.id}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-4">
            {/* Rooster Image */}
            <div className="group relative aspect-square overflow-hidden border border-[#3d6c58]/20">
              <div className="absolute inset-0 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`Preview ${rooster.breed || "Rooster"} ${rooster.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-[#3d6c58]/70 cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <ZoomIn className="h-8 w-8 text-white" />
                </button>
              </div>
              <Image
                src={rooster.image || "/images/roosters/rooster-sample.jpg"}
                alt={`${rooster.breed || "Rooster"} - ${rooster.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Status and Health */}
            <div className="flex gap-2">
              <Badge className={getStatusColor(rooster.status)}>
                {rooster.status}
              </Badge>
              <Badge className={getHealthColor(rooster.health || "Unknown")}>
                {rooster.health || "Unknown"}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-[#1f3f2c] mb-2">Description</h4>
              <p className="text-sm text-[#4a6741] leading-relaxed">
                {rooster.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="font-semibold text-[#1f3f2c] mb-3 flex items-center gap-2">
                <Bird className="w-4 h-4" />
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                  <span className="text-sm text-[#4a6741]">Breed</span>
                  <span className="text-sm font-medium text-[#1f3f2c]">{rooster.breed}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                  <span className="text-sm text-[#4a6741]">Age</span>
                  <span className="text-sm font-medium text-[#1f3f2c]">{rooster.age}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                  <span className="text-sm text-[#4a6741]">Weight</span>
                  <div className="flex items-center gap-1">
                    <Weight className="w-3 h-3 text-[#3d6c58]" />
                    <span className="text-sm font-medium text-[#1f3f2c]">{rooster.weight}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location and Health */}
            <div>
              <h4 className="font-semibold text-[#1f3f2c] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location & Health
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                  <span className="text-sm text-[#4a6741]">Location</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#3d6c58]" />
                    <span className="text-sm font-medium text-[#1f3f2c]">{rooster.location || "Not specified"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                  <span className="text-sm text-[#4a6741]">Health Status</span>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-[#3d6c58]" />
                    <span className="text-sm font-medium text-[#1f3f2c]">{rooster.health || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h4 className="font-semibold text-[#1f3f2c] mb-3 flex items-center gap-2">
                <PhilippinePeso className="w-4 h-4" />
                Pricing
              </h4>
              <div className="flex justify-between items-center py-2 border-b border-[#3d6c58]/10">
                <span className="text-sm text-[#4a6741]">Selling Price</span>
                <div className="flex items-center gap-1">
                  <PhilippinePeso className="w-3 h-3 text-[#3d6c58]" />
                  <span className="text-sm font-medium text-[#1f3f2c]">{rooster.price}</span>
                </div>
              </div>
            </div>

            {/* Vaccination Records */}
            {rooster.vaccinations && rooster.vaccinations.length > 0 && (
              <div>
                <h4 className="font-semibold text-[#1f3f2c] mb-3">
                  Vaccination Records
                </h4>
                <div className="space-y-2">
                  {rooster.vaccinations.map((vaccination: { name: string; date: string }, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-[#3d6c58]/5 rounded border border-[#3d6c58]/10"
                    >
                      <span className="text-sm font-medium text-[#1f3f2c]">{vaccination.name}</span>
                      <span className="text-xs text-[#4a6741]">{vaccination.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(rooster.id)}
                  className="flex-1 border-[#3d6c58]/20 hover:bg-[#3d6c58]/10"
                >
                  <Edit className="w-4 h-4 " />
                  Edit
                </Button>
              )}
              {onDelete && rooster.status !== "Sold" && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(rooster.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 " />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
        </ScrollArea>

        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={0}
          plugins={[Zoom]}
          carousel={{ finite: true }}
          controller={{ closeOnBackdropClick: true, closeOnPullDown: false, closeOnPullUp: false }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
        />
      </DialogContent>
    </Dialog>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, MapPin, Heart, ZoomIn } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"

import Zoom from "yet-another-react-lightbox/plugins/zoom"
import { useLightbox } from "@/hooks/use-lightbox"

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false })

interface RoosterCardsProps {
  roosters: any[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function RoosterCards({ roosters, onViewDetails, onEdit, onDelete }: RoosterCardsProps) {
  const slides = roosters.map((rooster) => ({
    src: rooster.image || "/images/roosters/rooster-sample.jpg",
    alt: `${rooster.breed} - ${rooster.id}`,
  }))

  const lightbox = useLightbox(slides)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-100 text-green-800"
      case "Sold": return "bg-gray-100 text-gray-800"
      case "Quarantine": return "bg-yellow-100 text-yellow-800"
      case "Deceased": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent": return "bg-green-100 text-green-800"
      case "Good": return "bg-blue-100 text-blue-800"
      case "Fair": return "bg-yellow-100 text-yellow-800"
      case "Under Observation": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roosters.map((rooster, index) => (
        <Card key={rooster.id} className="border-[#3d6c58]/20 hover:border-[#3d6c58]/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-[#1f3f2c]">{rooster.id}</CardTitle>
                <CardDescription className="text-sm font-medium text-[#4a6741]">
                  {rooster.breed}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewDetails(rooster.id)}>
                    <Eye className=" h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(rooster.id)}>
                    <Edit className=" h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => onDelete(rooster.id)}
                  >
                    <Trash2 className=" h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Rooster Image */}
            <div className="group relative aspect-square overflow-hidden bg-gray-100">
              <div className="absolute inset-0 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label={`Preview ${rooster.breed} ${rooster.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-[#3d6c58]/70 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    lightbox.openAt(index)
                  }}
                >
                  <ZoomIn className="h-8 w-8 text-white" />
                </button>
              </div>
              <Image
                src={rooster.image || "/images/roosters/rooster-sample.jpg"}
                alt={`${rooster.breed} - ${rooster.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              {rooster.status === "Available" && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-[#3d6c58] text-white">
                    Available
                  </Badge>
                </div>
              )}
            </div>

            {/* Rooster Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4a6741]">Age:</span>
                <span className="text-sm font-medium text-[#1f3f2c]">{rooster.age}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4a6741]">Weight:</span>
                <span className="text-sm font-medium text-[#1f3f2c]">{rooster.weight}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#4a6741]">Health:</span>
                <Badge className={getHealthColor(rooster.health || "Good")}>
                  {rooster.health || "Good"}
                </Badge>
              </div>
              {rooster.location && (
                <div className="flex items-center gap-1 text-sm text-[#4a6741]">
                  <MapPin className="h-3 w-3" />
                  <span>{rooster.location}</span>
                </div>
              )}
            </div>

            {/* Status and Price */}
            <div className="flex items-center justify-between pt-2 border-t border-[#3d6c58]/20">
              <Badge className={getStatusColor(rooster.status)}>
                {rooster.status}
              </Badge>
              <span className="text-lg font-bold text-[#1f3f2c]">₱{rooster.price}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-[#3d6c58]/20"
                onClick={() => onViewDetails(rooster.id)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {rooster.status === "Available" && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#3d6c58] hover:bg-[#4e816b]"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Reserve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>

      <Lightbox
        open={lightbox.open}
        close={lightbox.close}
        slides={lightbox.slides}
        index={lightbox.index}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        controller={{ closeOnBackdropClick: true, closeOnPullDown: false, closeOnPullUp: false }}
        render={{ buttonPrev: () => null, buttonNext: () => null }}
      />
    </>
  )
}

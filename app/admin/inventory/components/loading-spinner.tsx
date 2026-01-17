import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin text-[#3d6c58] ${sizeClasses[size]}`} />
    </div>
  )
}

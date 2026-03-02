export function LoadingSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <div className={`animate-spin rounded-none border-2 border-gray-300 border-t-[#3d6c58] ${sizeClasses[size]}`} />
  )
}

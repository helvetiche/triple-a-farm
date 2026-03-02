import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

interface PageHeaderActionProps {
  children: ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive"
  asChild?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-[#1f3f2c]">{title}</h1>
        <p className="text-[#4a6741]">{description}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
        {children}
      </div>
    </div>
  )
}

export function PageHeaderAction({ 
  children, 
  variant = "default", 
  asChild = false, 
  href, 
  onClick,
  className = ""
}: PageHeaderActionProps) {
  const buttonClass = variant === "default" 
    ? "bg-[#3d6c58] hover:bg-[#4e816b]" 
    : variant === "outline" 
    ? "border-[#3d6c58]/20" 
    : ""

  const combinedClassName = `${buttonClass} w-full sm:w-auto ${className}`.trim()

  if (asChild && href) {
    return (
      <Button asChild variant={variant} className={combinedClassName}>
        <Link href={href}>
          {children}
        </Link>
      </Button>
    )
  }

  return (
    <Button variant={variant} onClick={onClick} className={combinedClassName}>
      {children}
    </Button>
  )
}

export function PageHeaderAddButton({ 
  text, 
  href, 
  onClick 
}: { 
  text: string
  href?: string
  onClick?: () => void 
}) {
  return (
    <PageHeaderAction 
      variant="default" 
      asChild={!!href} 
      href={href} 
      onClick={onClick}
    >
      <>
        <Plus className="w-4 h-4 " />
        {text}
      </>
    </PageHeaderAction>
  )
}

export function PageHeaderLinkButton({ 
  text, 
  href 
}: { 
  text: string
  href: string 
}) {
  return (
    <PageHeaderAction 
      variant="outline" 
      asChild={true} 
      href={href}
    >
      {text}
    </PageHeaderAction>
  )
}
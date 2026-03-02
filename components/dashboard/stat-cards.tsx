import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  trend?: {
    value: string
    type: "increase" | "decrease" | "neutral"
  }
}

interface StatCardsProps {
  cards: StatCardProps[]
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#1f3f2c]">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#3d6c58]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#1f3f2c]">{value}</div>
        <p className="text-xs text-[#4a6741]">
          {trend && (
            <span className={`${
              trend.type === "increase" ? "text-green-600" : 
              trend.type === "decrease" ? "text-red-600" : 
              "text-gray-600"
            }`}>
              {trend.type === "increase" && "+"}
              {trend.value}
            </span>
          )}
          {trend && " "}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export function StatCards({ cards, className = "" }: StatCardsProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { Table, Grid3X3 } from "lucide-react"
import { type ViewMode } from "../utils/settings"

interface ViewToggleProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-none">
      <Button
        variant={currentView === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className={currentView === "table" ? "bg-[#3d6c58] hover:bg-[#4e816b]" : "text-[#4a6741]"}
      >
        <Table className="h-4 w-4 " />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={currentView === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("cards")}
        className={currentView === "cards" ? "bg-[#3d6c58] hover:bg-[#4e816b]" : "text-[#4a6741]"}
      >
        <Grid3X3 className="h-4 w-4 " />
        <span className="hidden sm:inline">Cards</span>
      </Button>
    </div>
  )
}

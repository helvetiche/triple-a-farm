import React from "react"
import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

type FeedbackPageHeaderProps = {
  onExportReport: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function FeedbackPageHeader({ onExportReport, onRefresh, isRefreshing = false }: FeedbackPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-[#1f3f2c]">Feedback & Ratings</h1>
        <p className="text-[#4a6741]">Customer reviews and satisfaction metrics</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            className="border-[#3d6c58]/20 w-full sm:w-auto"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
        <Button
          className="bg-[#3d6c58] hover:bg-[#4e816b] w-full sm:w-auto"
          onClick={onExportReport}
        >
          <Download className="w-4 h-4 " />
          Export Report
        </Button>
      </div>
    </div>
  )
}

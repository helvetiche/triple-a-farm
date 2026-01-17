"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import { DateRange } from "../data/mock-data"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateRangeSelectorProps {
  onDateRangeChange: (dateRange: DateRange) => void
  initialDateRange?: DateRange
}

export function DateRangeSelector({
  onDateRangeChange,
  initialDateRange
}: DateRangeSelectorProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: initialDateRange?.startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: initialDateRange?.endDate || new Date()
  })

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange = { from: range.from, to: range.to }
      setDateRange(newRange)
      onDateRangeChange({
        startDate: range.from,
        endDate: range.to
      })
    }
  }

  const handlePresetChange = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    const newRange = { from, to }
    setDateRange(newRange)
    onDateRangeChange({
      startDate: from,
      endDate: to
    })
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-[#3d6c58]" />
        <span className="text-sm font-medium text-[#1f3f2c]">Date Range:</span>
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal border-[#3d6c58]/20 rounded-none",
              "w-full sm:w-auto sm:min-w-[200px]"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="min-w-0 flex-1 truncate">
              {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-1rem)] max-w-[720px] p-0 rounded-none sm:w-auto"
          align="end"
        >
          <div className="p-3 space-y-3">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetChange(7)}
                className="text-xs rounded-none"
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetChange(30)}
                className="text-xs rounded-none"
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetChange(90)}
                className="text-xs rounded-none"
              >
                Last 3 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetChange(180)}
                className="text-xs rounded-none"
              >
                Last 6 Months
              </Button>
            </div>
            
            {/* Calendar Range Picker */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <div className="flex justify-end mb-2">
                  <p className="text-sm font-medium">Start Date</p>
                </div>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => {
                    if (date && (!dateRange.to || date <= dateRange.to)) {
                      const newRange = { from: date, to: dateRange.to }
                      setDateRange(newRange)
                      if (newRange.to) {
                        onDateRangeChange({
                          startDate: date,
                          endDate: newRange.to
                        })
                      }
                    }
                  }}
                  className="border"
                  disabled={(date) => date > new Date() || (dateRange.to ? date > dateRange.to : false)}
                />
              </div>
              <div className="min-w-0">
                <div className="flex justify-end mb-2">
                  <p className="text-sm font-medium">End Date</p>
                </div>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => {
                    if (date && (!dateRange.from || date >= dateRange.from)) {
                      const newRange = { from: dateRange.from, to: date }
                      setDateRange(newRange)
                      if (newRange.from) {
                        onDateRangeChange({
                          startDate: newRange.from,
                          endDate: date
                        })
                      }
                    }
                  }}
                  className="border"
                  disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

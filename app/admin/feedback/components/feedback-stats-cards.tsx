import React from "react"
import { MessageSquare, Star, ThumbsUp, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeedbackStatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2"
          style={{ borderRadius: 0 }}
        >
          <CardTitle className="text-sm font-medium text-[#1f3f2c]">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent style={{ borderRadius: 0 }}>
          <div className="text-2xl font-bold text-[#1f3f2c]">4.4</div>
          <p className="text-xs text-[#4a6741]">
            <span className="text-green-600">+0.2</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2"
          style={{ borderRadius: 0 }}
        >
          <CardTitle className="text-sm font-medium text-[#1f3f2c]">Total Reviews</CardTitle>
          <MessageSquare className="h-4 w-4 text-[#3d6c58]" />
        </CardHeader>
        <CardContent style={{ borderRadius: 0 }}>
          <div className="text-2xl font-bold text-[#1f3f2c]">156</div>
          <p className="text-xs text-[#4a6741]">Customer feedback</p>
        </CardContent>
      </Card>

      <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2"
          style={{ borderRadius: 0 }}
        >
          <CardTitle className="text-sm font-medium text-[#1f3f2c]">Satisfaction Rate</CardTitle>
          <ThumbsUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent style={{ borderRadius: 0 }}>
          <div className="text-2xl font-bold text-[#1f3f2c]">92%</div>
          <p className="text-xs text-[#4a6741]">Positive reviews</p>
        </CardContent>
      </Card>

      <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2"
          style={{ borderRadius: 0 }}
        >
          <CardTitle className="text-sm font-medium text-[#1f3f2c]">Response Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#3d6c58]" />
        </CardHeader>
        <CardContent style={{ borderRadius: 0 }}>
          <div className="text-2xl font-bold text-[#1f3f2c]">78%</div>
          <p className="text-xs text-[#4a6741]">Feedback collected</p>
        </CardContent>
      </Card>
    </div>
  )
}

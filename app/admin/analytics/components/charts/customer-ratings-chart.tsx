"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Star } from "lucide-react"

interface CustomerRatingsChartProps {
  title: string
  description: string
  data: Array<{
    date: string
    rating: number
    customerId: string
    transactionId: string
  }>
}

export function CustomerRatingsChart({ title, description, data }: CustomerRatingsChartProps) {
  // Calculate average rating
  const averageRating = data.length > 0 
    ? (data.reduce((sum, item) => sum + item.rating, 0) / data.length).toFixed(1)
    : "0.0"

  // Count ratings by star level
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: data.filter(item => item.rating === stars).length,
    percentage: data.length > 0 ? (data.filter(item => item.rating === stars).length / data.length) * 100 : 0
  }))

  return (
    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
      <CardHeader style={{ borderRadius: 0 }}>
        <CardTitle className="text-[#1f3f2c] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#3d6c58]" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent style={{ borderRadius: 0 }}>
        <div className="space-y-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3d6c58]">{averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= parseFloat(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on {data.length} reviews
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#1f3f2c]">Rating Distribution</h4>
            {ratingCounts.map((rating) => (
              <div key={rating.stars} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-700">{rating.stars}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-700">Stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 h-2" style={{ borderRadius: 0 }}>
                    <div
                      className="h-2 bg-yellow-400"
                      style={{ 
                        width: `${rating.percentage}%`,
                        borderRadius: 0
                      }}
                    />
                  </div>
                  <span className="text-gray-600 text-xs w-12 text-right">
                    {rating.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Reviews Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-[#1f3f2c] mb-2">Recent Activity</h4>
            <div className="text-xs text-gray-600">
              <div className="flex justify-between">
                <span>This Month:</span>
                <span className="font-medium">{data.length} reviews</span>
              </div>
              <div className="flex justify-between">
                <span>Satisfaction Rate:</span>
                <span className="font-medium text-green-600">
                  {((ratingCounts[0].count + ratingCounts[1].count) / data.length * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

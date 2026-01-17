"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

import { type CustomerReview } from "./data/reviews"
import { filterReviews, getStatusColor, renderStars } from "./utils/feedback-utils"
import { FeedbackPageHeader } from "./components/feedback-page-header"
import { FeedbackSearchFilter } from "./components/feedback-search-filter"
import { FeedbackStatsCards } from "./components/feedback-stats-cards"
import { PageHeaderSkeleton, FeedbackStatsCardsSkeleton, ReviewsTableSkeleton } from "./components/feedback-skeletons"
import { ReviewsTable } from "./components/reviews-table"
import { ReviewsEmptyState } from "./components/reviews-empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const description = "Feedback & Ratings Management"

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null)
  const [editFormData, setEditFormData] = useState({
    customer: "",
    rooster: "",
    rating: 5,
    comment: ""
  })

  const fetchReviews = async (retryCount = 0, isRefresh = false) => {
    try {
      const response = await fetch('/api/feedback/reviews')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setReviews(data.data || [])
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      
      // Retry up to 3 times for network errors
      if (retryCount < 3 && error?.message?.includes('Failed to fetch')) {
        setTimeout(() => fetchReviews(retryCount + 1, isRefresh), 1000 * (retryCount + 1))
        return
      }
      
      toast.error('Failed to load reviews', {
        description: 'Please refresh the page or try again later.'
      })
      // Set fallback empty state
      setReviews([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Fetch reviews from API with retry mechanism
  useEffect(() => {
    fetchReviews()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchReviews(0, true)
  }

  // Filter reviews based on search
  const filteredReviews = filterReviews(reviews, searchValue)

  const handleClearSearch = () => {
    setSearchValue("")
  }

  const handleEditReview = (review: CustomerReview) => {
    setEditingReview(review)
    setEditFormData({
      customer: review.customer,
      rooster: review.rooster,
      rating: review.rating,
      comment: review.comment
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    toast.success("Review updated successfully")
    setIsEditDialogOpen(false)
    setEditingReview(null)
  }

  const handlePublishReview = (review: CustomerReview) => {
    setSelectedReview(review)
    setIsPublishDialogOpen(true)
  }

  const handleConfirmPublish = async () => {
  if (!selectedReview) return
  
  try {
    const response = await fetch('/api/feedback/reviews', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedReview.id,
        status: 'published'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to publish review')
    }

    // Update local state
    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id 
        ? { ...review, status: 'published' }
        : review
    ))

    toast.success("Review published to landing page successfully")
    setIsPublishDialogOpen(false)
    setSelectedReview(null)
  } catch (error) {
    console.error('Error publishing review:', error)
    toast.error('Failed to publish review')
  }
}

  const handleUnpublishReview = (review: CustomerReview) => {
    setSelectedReview(review)
    setIsUnpublishDialogOpen(true)
  }

  const handleConfirmUnpublish = async () => {
  if (!selectedReview) return
  
  try {
    const response = await fetch('/api/feedback/reviews', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: selectedReview.id,
        status: 'hidden'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to unpublish review')
    }

    // Update local state
    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id 
        ? { ...review, status: 'hidden' }
        : review
    ))

    toast.success("Review removed from landing page successfully")
    setIsUnpublishDialogOpen(false)
    setSelectedReview(null)
  } catch (error) {
    console.error('Error unpublishing review:', error)
    toast.error('Failed to remove review')
  }
}

  const handleViewReview = (review: CustomerReview) => {
    setSelectedReview(review)
    setIsViewDialogOpen(true)
  }

  const handleExportReport = () => {
    toast.success("Feedback report exported successfully")
  }

  

  if (isLoading) {
    return (
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <PageHeaderSkeleton />
                <FeedbackStatsCardsSkeleton />
                <ReviewsTableSkeleton />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    )
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
              <FeedbackPageHeader onExportReport={handleExportReport} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
              <FeedbackStatsCards />

              {/* Tabs */}
              <Tabs defaultValue="reviews" className="space-y-4">
                <div className="w-full overflow-x-auto">
                  <TabsList className="flex w-max min-w-max gap-2">
                    <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
                    <TabsTrigger value="analytics">Rating Analysis</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="reviews" className="space-y-4">
                  <FeedbackSearchFilter searchValue={searchValue} onSearchValueChange={setSearchValue} />
                  <ReviewsTable
                    reviews={filteredReviews}
                    onView={handleViewReview}
                    onEdit={handleEditReview}
                    onPublish={handlePublishReview}
                    onUnpublish={handleUnpublishReview}
                  />

                  {/* Empty State for No Search Results */}
                  {filteredReviews.length === 0 && searchValue && (
                    <ReviewsEmptyState searchValue={searchValue} onClearSearch={handleClearSearch} />
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Rating Distribution */}
                    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                      <CardHeader style={{ borderRadius: 0 }}>
                        <CardTitle className="text-[#1f3f2c]">Rating Distribution</CardTitle>
                        <CardDescription>Breakdown of customer ratings</CardDescription>
                      </CardHeader>
                      <CardContent style={{ borderRadius: 0 }}>
                        <div className="space-y-4">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-4">
                              <div className="flex items-center w-12">
                                <span className="text-sm font-medium">{rating}</span>
                                <Star className="h-4 w-4 text-yellow-400 ml-1" />
                              </div>
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 h-2">
                                  <div 
                                    className="bg-[#3d6c58] h-2" 
                                    style={{ 
                                      width: `${rating === 5 ? 65 : rating === 4 ? 20 : rating === 3 ? 8 : rating === 2 ? 4 : 3}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm text-[#4a6741] w-12 text-right">
                                {rating === 5 ? '65%' : rating === 4 ? '20%' : rating === 3 ? '8%' : rating === 2 ? '4%' : '3%'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Rating Trends */}
                    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                      <CardHeader style={{ borderRadius: 0 }}>
                        <CardTitle className="text-[#1f3f2c]">Rating Trends</CardTitle>
                        <CardDescription>Monthly average ratings</CardDescription>
                      </CardHeader>
                      <CardContent style={{ borderRadius: 0 }}>
                        <div className="space-y-4">
                          {[
                            { month: "November", rating: 4.4, change: 0.2, positive: true },
                            { month: "October", rating: 4.2, change: -0.1, positive: false },
                            { month: "September", rating: 4.3, change: 0.1, positive: true },
                            { month: "August", rating: 4.2, change: 0.0, positive: null },
                            { month: "July", rating: 4.2, change: 0.2, positive: true },
                            { month: "June", rating: 4.0, change: -0.2, positive: false },
                          ].map((trend, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-[#1f3f2c]">{trend.month}</p>
                                <div className="flex items-center">
                                  {renderStars(Math.round(trend.rating))}
                                  <span className="ml-2 text-sm text-[#4a6741]">{trend.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                {trend.positive === true && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
                                {trend.positive === false && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
                                <span className={`text-sm ${trend.positive === true ? 'text-green-600' : trend.positive === false ? 'text-red-600' : 'text-gray-600'}`}>
                                  {trend.change > 0 ? '+' : ''}{trend.change}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Rated Breeds */}
                  <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
                    <CardHeader style={{ borderRadius: 0 }}>
                      <CardTitle className="text-[#1f3f2c]">Top Rated Breeds</CardTitle>
                      <CardDescription>Customer favorites by breed</CardDescription>
                    </CardHeader>
                    <CardContent style={{ borderRadius: 0 }}>
                      <div className="grid gap-4 md:grid-cols-3">
                        {[
                          { breed: "Sweater", rating: 4.6, reviews: 45, sentiment: "Very Positive" },
                          { breed: "Kelso", rating: 4.5, reviews: 38, sentiment: "Very Positive" },
                          { breed: "Roundhead", rating: 4.3, reviews: 32, sentiment: "Positive" },
                          { breed: "Claret", rating: 4.3, reviews: 28, sentiment: "Positive" },
                          { breed: "Hatch", rating: 4.2, reviews: 25, sentiment: "Positive" },
                          { breed: "Leiper", rating: 4.1, reviews: 22, sentiment: "Positive" },
                        ].map((breed, index) => (
                          <div key={index} className="p-4 border" style={{ borderRadius: 0 }}>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-[#1f3f2c]">{breed.breed}</h3>
                              <Badge className="bg-green-100 text-green-800">
                                {breed.sentiment}
                              </Badge>
                            </div>
                            <div className="flex items-center mb-2">
                              {renderStars(Math.round(breed.rating))}
                              <span className="ml-2 text-sm font-medium">{breed.rating}</span>
                            </div>
                            <p className="text-sm text-[#4a6741]">{breed.reviews} reviews</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl" style={{ borderRadius: 0 }}>
          <DialogHeader style={{ borderRadius: 0 }}>
            <DialogTitle>Customer Review Details</DialogTitle>
            <DialogDescription>
              Full review information and customer feedback
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-[#4a6741]">Review ID</p>
                  <p className="font-semibold">{selectedReview.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a6741]">Date</p>
                  <p className="font-semibold">{selectedReview.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a6741]">Customer</p>
                  <p className="font-semibold">{selectedReview.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a6741]">Rooster</p>
                  <p className="font-semibold">{selectedReview.rooster}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a6741] mb-2">Rating</p>
                <div className="flex items-center">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-sm font-medium">({selectedReview.rating}/5)</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a6741] mb-2">Comment</p>
                <p className="text-[#1f3f2c]">{selectedReview.comment}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a6741] mb-2">Status</p>
                <Badge className={getStatusColor(selectedReview.status)}>
                  {selectedReview.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl" style={{ borderRadius: 0 }}>
          <DialogHeader style={{ borderRadius: 0 }}>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>
              Modify review information
            </DialogDescription>
          </DialogHeader>
          {editingReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-[#4a6741] mb-2">Customer Name</p>
                  <Input 
                    value={editFormData.customer}
                    onChange={(e) => setEditFormData({...editFormData, customer: e.target.value})}
                    className="border-[#3d6c58]/20"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a6741] mb-2">Rooster</p>
                  <Input 
                    value={editFormData.rooster}
                    onChange={(e) => setEditFormData({...editFormData, rooster: e.target.value})}
                    className="border-[#3d6c58]/20"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a6741] mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEditFormData({...editFormData, rating})}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= editFormData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-[#4a6741]">({editFormData.rating}/5)</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#4a6741] mb-2">Comment</p>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) => setEditFormData({...editFormData, comment: e.target.value})}
                  className="w-full p-3 border border-[#3d6c58]/20 min-h-[100px] resize-none"
                  style={{ borderRadius: 0 }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="border-[#3d6c58]/20"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#3d6c58] hover:bg-[#4e816b]"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-md" style={{ borderRadius: 0 }}>
          <DialogHeader style={{ borderRadius: 0 }}>
            <DialogTitle>Publish to Landing Page</DialogTitle>
            <DialogDescription>
              This review will be displayed on the landing page testimonials section.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border">
                <p className="font-semibold text-[#1f3f2c]">{selectedReview.customer}</p>
                <div className="flex items-center my-2">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-sm text-[#4a6741]">({selectedReview.rating}/5)</span>
                </div>
                <p className="text-sm text-[#4a6741] line-clamp-3">"{selectedReview.comment}"</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="border-[#3d6c58]/20"
                  onClick={() => setIsPublishDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-[#3d6c58] hover:bg-[#4e816b]"
                  onClick={handleConfirmPublish}
                >
                  Publish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unpublish Confirmation Dialog */}
      <Dialog open={isUnpublishDialogOpen} onOpenChange={setIsUnpublishDialogOpen}>
        <DialogContent className="max-w-md" style={{ borderRadius: 0 }}>
          <DialogHeader style={{ borderRadius: 0 }}>
            <DialogTitle>Remove from Landing Page</DialogTitle>
            <DialogDescription>
              This review will no longer be displayed on the landing page testimonials section.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border">
                <p className="font-semibold text-[#1f3f2c]">{selectedReview.customer}</p>
                <div className="flex items-center my-2">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-sm text-[#4a6741]">({selectedReview.rating}/5)</span>
                </div>
                <p className="text-sm text-[#4a6741] line-clamp-3">"{selectedReview.comment}"</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="border-[#3d6c58]/20"
                  onClick={() => setIsUnpublishDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleConfirmUnpublish}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

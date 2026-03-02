import React from "react"
import { Check, Edit, Eye, EyeOff, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { CustomerReview } from "../data/reviews"
import { getStatusColor, renderStars } from "../utils/feedback-utils"

type ReviewsTableProps = {
  reviews: CustomerReview[]
  onView: (review: CustomerReview) => void
  onEdit: (review: CustomerReview) => void
  onPublish: (review: CustomerReview) => void
  onUnpublish: (review: CustomerReview) => void
}

export function ReviewsTable({ reviews, onView, onEdit, onPublish, onUnpublish }: ReviewsTableProps) {
  return (
    <Card className="border-[#3d6c58]/20" style={{ borderRadius: 0 }}>
      <CardHeader style={{ borderRadius: 0 }}>
        <CardTitle className="text-[#1f3f2c]">Customer Reviews</CardTitle>
        <CardDescription>Latest customer feedback</CardDescription>
      </CardHeader>
      <CardContent style={{ borderRadius: 0 }}>
        <div className="space-y-3 sm:hidden">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-[#3d6c58]/20 bg-white p-4"
              style={{ borderRadius: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[#1f3f2c] truncate">{review.customer}</div>
                  <div className="text-sm text-[#4a6741] truncate">{review.date}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(review)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Full Review
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(review)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Review
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {review.status === "published" ? (
                      <DropdownMenuItem onClick={() => onUnpublish(review)}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unpublish from Landing
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onPublish(review)}>
                        <Check className="mr-2 h-4 w-4" />
                        Publish to Landing
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center min-w-0">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-[#4a6741]">({review.rating})</span>
                </div>
                <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
              </div>

              <div className="mt-3 text-sm text-[#1f3f2c]">
                <div className="text-[#4a6741]">Rooster</div>
                <div className="font-medium truncate">{review.rooster}</div>
              </div>

              <div className="mt-3 text-sm text-[#1f3f2c]">
                <div className="text-[#4a6741]">Comment</div>
                <div className="line-clamp-3">{review.comment}</div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => onView(review)} className="w-full bg-[#3d6c58] hover:bg-[#4e816b]">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEdit(review)}
                  className="w-full border-[#3d6c58]/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block w-full overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Rating</TableHead>
                <TableHead className="hidden md:table-cell">Rooster</TableHead>
                <TableHead className="hidden lg:table-cell">Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.date}</TableCell>
                  <TableCell>{review.customer}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-[#4a6741]">({review.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{review.rooster}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="max-w-xs truncate" title={review.comment}>
                      {review.comment}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onView(review)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(review)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Review
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {review.status === "published" ? (
                          <DropdownMenuItem onClick={() => onUnpublish(review)}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Unpublish from Landing
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onPublish(review)}>
                            <Check className="mr-2 h-4 w-4" />
                            Publish to Landing
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

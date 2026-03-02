import React from "react"
import { Star } from "lucide-react"

export function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
    />
  ))
}

export function getStatusColor(status: string) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "hidden":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function filterReviews<T extends { [key: string]: any }>(reviews: T[], searchValue: string) {
  if (!searchValue) return reviews

  const search = searchValue.toLowerCase()
  return reviews.filter((review: any) =>
    [
      review.id,
      review.customer,
      review.rooster,
      review.comment,
      review.status,
      review.date,
    ]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(search))
  )
}

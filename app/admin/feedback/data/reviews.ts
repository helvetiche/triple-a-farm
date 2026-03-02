export type ReviewStatus = "published" | "pending" | "hidden"

export type CustomerReview = {
  id: string
  date: string
  customer: string
  rating: number
  rooster: string
  comment: string
  status: ReviewStatus
}

export const customerReviews: CustomerReview[] = [
  {
    id: "REV-001",
    date: "2024-11-20",
    customer: "Juan Dela Cruz",
    rating: 5,
    rooster: "Sweater - TR-002",
    comment:
      "Excellent quality rooster! Very healthy and strong. Great communication from the farm.",
    status: "published",
  },
  {
    id: "REV-002",
    date: "2024-11-19",
    customer: "Maria Santos",
    rating: 4,
    rooster: "Roundhead - TR-003",
    comment:
      "Good quality bird, arrived in good condition. Slightly smaller than expected but overall satisfied.",
    status: "published",
  },
  {
    id: "REV-003",
    date: "2024-11-18",
    customer: "Roberto Reyes",
    rating: 5,
    rooster: "Claret - TR-007",
    comment:
      "Outstanding breed! Perfect for breeding purposes. Will definitely buy again.",
    status: "published",
  },
  {
    id: "REV-004",
    date: "2024-11-17",
    customer: "Antonio Martinez",
    rating: 3,
    rooster: "Kelso - TR-001",
    comment:
      "Average quality. The rooster was healthy but not as impressive as described. Delivery was delayed.",
    status: "pending",
  },
  {
    id: "REV-005",
    date: "2024-11-16",
    customer: "Luis Garcia",
    rating: 5,
    rooster: "Butcher - TR-006",
    comment:
      "Fantastic bird! Exactly as described. Great customer service and fast delivery.",
    status: "published",
  },
]

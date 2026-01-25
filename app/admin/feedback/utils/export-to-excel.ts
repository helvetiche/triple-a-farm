import type { CustomerReview } from "../data/reviews"

export const exportFeedbackToExcel = (reviews: CustomerReview[], exportedBy?: string) => {
  // Dynamic import to ensure this only runs on client
  if (typeof window === 'undefined') {
    throw new Error('Export can only be performed in the browser')
  }

  import('xlsx').then((XLSX) => {
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Summary Statistics
    const totalReviews = reviews.length
    const publishedReviews = reviews.filter(r => r.status === 'published').length
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: ((reviews.filter(r => r.rating === rating).length / totalReviews) * 100).toFixed(1)
    }))

    const summaryData = [
      ["Feedback & Ratings Report"],
      ["Generated:", new Date().toLocaleString()],
      ["Exported by:", exportedBy || "Unknown"],
      [],
      ["Metric", "Value"],
      ["Total Reviews", totalReviews],
      ["Published Reviews", publishedReviews],
      ["Average Rating", averageRating.toFixed(2)],
      [],
      ["Rating Distribution"],
      ["Rating", "Count", "Percentage"],
      ...ratingDistribution.map(r => [r.rating, r.count, `${r.percentage}%`])
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Sheet 2: All Reviews (sorted alphabetically by customer name)
    const sortedReviews = [...reviews].sort((a, b) => 
      a.customer.localeCompare(b.customer)
    )
    const reviewsData = [
      ["Review ID", "Date", "Customer", "Rooster", "Rating", "Comment", "Status"],
      ...sortedReviews.map(review => [
        review.id,
        review.date,
        review.customer,
        review.rooster,
        review.rating,
        review.comment,
        review.status
      ])
    ]
    const reviewsSheet = XLSX.utils.aoa_to_sheet(reviewsData)
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, "All Reviews")

    // Sheet 3: Published Reviews Only (sorted alphabetically by customer name)
    const publishedReviews = reviews
      .filter(r => r.status === 'published')
      .sort((a, b) => a.customer.localeCompare(b.customer))
    const publishedData = [
      ["Review ID", "Date", "Customer", "Rooster", "Rating", "Comment"],
      ...publishedReviews.map(review => [
          review.id,
          review.date,
          review.customer,
          review.rooster,
          review.rating,
          review.comment
        ])
    ]
    const publishedSheet = XLSX.utils.aoa_to_sheet(publishedData)
    XLSX.utils.book_append_sheet(workbook, publishedSheet, "Published Reviews")

    // Generate filename with current date
    const dateStr = new Date().toISOString().split("T")[0]
    const filename = `feedback_report_${dateStr}.xlsx`

    // Write file
    XLSX.writeFile(workbook, filename)
  }).catch((error) => {
    console.error('Failed to load XLSX library:', error)
    throw new Error('Failed to export report')
  })
}

import type { SessionUser } from "@/lib/auth";
import { getSalesTransactions, getSalesStats } from "@/lib/sales";
import { getRoosters, getRoosterStats } from "@/lib/roosters";
import { getInventoryStats } from "@/lib/inventory";
import { adminDb } from "@/lib/firebase";
import type { SalesTransaction } from "@/app/admin/sales/types";
import type { Rooster } from "@/app/admin/data/roosters";
import type {
  AnalyticsStats,
  MonthlyData,
  BreedData,
  HealthMetrics,
  CustomerRating,
} from "@/app/admin/analytics/data/mock-data";

const REVIEWS_COLLECTION = "reviews";

export interface Review {
  id: string;
  date: string;
  customer: string;
  rating: number;
  rooster: string;
  comment: string;
  status: "published" | "pending" | "hidden";
  customerId?: string;
  transactionId?: string;
}

const getReviews = async (user: SessionUser | null): Promise<Review[]> => {
  const snapshot = await adminDb
    .collection(REVIEWS_COLLECTION)
    .orderBy("date", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      date: data.date || "",
      customer: data.customer || "",
      rating: data.rating || 0,
      rooster: data.rooster || "",
      comment: data.comment || "",
      status: data.status || "pending",
      customerId: data.customerId,
      transactionId: data.transactionId,
    };
  });
};

export const getAnalyticsStats = async (
  user: SessionUser | null,
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsStats> => {
  const [salesStats, roosterStats, inventoryStats, transactions, reviews] =
    await Promise.all([
      getSalesStats(user),
      getRoosterStats(user),
      getInventoryStats(user),
      getSalesTransactions(user),
      getReviews(user),
    ]);

  let filteredTransactions = transactions;
  if (startDate && endDate) {
    filteredTransactions = transactions.filter((t) => {
      const saleDate = new Date(t.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  const paidTransactions = filteredTransactions.filter(
    (t) => t.paymentStatus === "paid"
  );
  const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalSales = filteredTransactions.length;
  const averageSale =
    paidTransactions.length > 0 ? totalRevenue / paidTransactions.length : 0;

  // Calculate yearly growth (compare current year to previous year)
  const now = new Date();
  const currentYear = filteredTransactions.filter((t) => {
    const saleDate = new Date(t.date);
    return saleDate.getFullYear() === now.getFullYear();
  });

  const lastYear = filteredTransactions.filter((t) => {
    const saleDate = new Date(t.date);
    return saleDate.getFullYear() === now.getFullYear() - 1;
  });

  const currentYearRevenue = currentYear
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const lastYearRevenue = lastYear
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyGrowth =
    lastYearRevenue > 0
      ? ((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100
      : 0;

  // Calculate monthly growth (compare current month to previous month)
  const currentMonth = filteredTransactions.filter((t) => {
    const saleDate = new Date(t.date);
    return (
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });

  const lastMonth = filteredTransactions.filter((t) => {
    const saleDate = new Date(t.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return (
      saleDate.getMonth() === lastMonthDate.getMonth() &&
      saleDate.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  const currentMonthRevenue = currentMonth
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthRevenue = lastMonth
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyGrowth =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Calculate monthly sales growth (compare current month sales count to previous month)
  const currentMonthSales = currentMonth.length;
  const lastMonthSales = lastMonth.length;
  const monthlySalesGrowth =
    lastMonthSales > 0
      ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100
      : 0;

  // Calculate top breed from filtered transactions
  const breedCounts = filteredTransactions.reduce((acc, t) => {
    acc[t.breed] = (acc[t.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topBreed =
    Object.entries(breedCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "N/A";

  // Get unique customers
  const uniqueCustomers = new Set(
    filteredTransactions.map((t) => t.customerName)
  ).size;

  return {
    totalRevenue,
    totalSales,
    averageSale,
    topBreed,
    monthlyGrowth,
    yearlyGrowth,
    monthlySalesGrowth,
    totalCustomers: uniqueCustomers,
    activeRoosters: roosterStats.available,
  };
};

export const getMonthlyTrends = async (
  user: SessionUser | null,
  startDate?: Date,
  endDate?: Date
): Promise<MonthlyData[]> => {
  const transactions = await getSalesTransactions(user);

  let filteredTransactions = transactions;
  if (startDate && endDate) {
    filteredTransactions = transactions.filter((t) => {
      const saleDate = new Date(t.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Group transactions by month
  const monthlyMap = new Map<string, SalesTransaction[]>();

  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(transaction);
  });

  // Convert to array and sort by date
  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([monthKey, monthTransactions]) => {
      const date = new Date(monthKey + "-01");
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const revenue = monthTransactions
        .filter((t) => t.paymentStatus === "paid")
        .reduce((sum, t) => sum + t.amount, 0);

      const sales = monthTransactions.length;

      // Calculate profit (assuming 30% profit margin)
      const profit = revenue * 0.3;

      // Get unique customers
      const uniqueCustomers = new Set(
        monthTransactions.map((t) => t.customerName)
      ).size;

      return {
        month: monthName,
        revenue,
        sales,
        profit,
        customers: uniqueCustomers,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.month + " 1, 2024");
      const dateB = new Date(b.month + " 1, 2024");
      return dateA.getTime() - dateB.getTime();
    });

  return monthlyData;
};

export const getBreedPerformance = async (
  user: SessionUser | null,
  startDate?: Date,
  endDate?: Date
): Promise<BreedData[]> => {
  const transactions = await getSalesTransactions(user);

  let filteredTransactions = transactions;
  if (startDate && endDate) {
    filteredTransactions = transactions.filter((t) => {
      const saleDate = new Date(t.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Group by breed
  const breedMap = new Map<string, SalesTransaction[]>();

  filteredTransactions.forEach((transaction) => {
    const breed = transaction.breed;
    if (!breedMap.has(breed)) {
      breedMap.set(breed, []);
    }
    breedMap.get(breed)!.push(transaction);
  });

  // Calculate totals
  const totalRevenue = filteredTransactions
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const breedData: BreedData[] = Array.from(breedMap.entries()).map(
    ([breed, breedTransactions]) => {
      const sales = breedTransactions.length;
      const revenue = breedTransactions
        .filter((t) => t.paymentStatus === "paid")
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;

      return {
        breed,
        sales,
        revenue,
        percentage: Math.round(percentage * 100) / 100,
      };
    }
  );

  // Sort by revenue descending
  return breedData.sort((a, b) => b.revenue - a.revenue);
};

export const getHealthMetrics = async (
  user: SessionUser | null,
  startDate?: Date,
  endDate?: Date
): Promise<HealthMetrics[]> => {
  const roosters = await getRoosters(user);

  // Filter roosters by date if provided
  let filteredRoosters = roosters;
  if (startDate && endDate) {
    filteredRoosters = roosters.filter((r) => {
      const roosterDate = new Date(r.dateAdded);
      return roosterDate >= startDate && roosterDate <= endDate;
    });
  }

  // Group by month
  const monthlyMap = new Map<string, Rooster[]>();

  filteredRoosters.forEach((rooster) => {
    const date = new Date(rooster.dateAdded);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthName = date.toLocaleDateString("en-US", { month: "short" });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, []);
    }
    monthlyMap.get(monthKey)!.push(rooster);
  });

  // Calculate health metrics for each month
  const healthMetrics: HealthMetrics[] = Array.from(monthlyMap.entries())
    .map(([monthKey, monthRoosters]) => {
      const date = new Date(monthKey + "-01");
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      const total = monthRoosters.length;
      const excellent = monthRoosters.filter((r) => r.health === "excellent")
        .length;
      const good = monthRoosters.filter((r) => r.health === "good").length;
      const fair = monthRoosters.filter((r) => r.health === "fair").length;
      const poor = monthRoosters.filter((r) => r.health === "poor").length;

      // Calculate overall health score (weighted average)
      const overallHealth =
        total > 0
          ? (excellent * 100 + good * 75 + fair * 50 + poor * 25) / total
          : 0;

      // Vaccination coverage (assume excellent/good = vaccinated)
      const vaccinationCoverage =
        total > 0 ? ((excellent + good) / total) * 100 : 0;

      // Disease incidence (poor health = disease)
      const diseaseIncidence = total > 0 ? (poor / total) * 100 : 0;

      // Mortality rate (deceased status)
      const deceased = monthRoosters.filter((r) => r.status === "Deceased")
        .length;
      const mortalityRate = total > 0 ? (deceased / total) * 100 : 0;

      // Average weight
      const weights = monthRoosters
        .map((r) => parseFloat(r.weight || "0"))
        .filter((w) => w > 0);
      const averageWeight =
        weights.length > 0
          ? weights.reduce((sum, w) => sum + w, 0) / weights.length
          : 0;

      return {
        date: monthName,
        overallHealth: Math.round(overallHealth * 10) / 10,
        vaccinationCoverage: Math.round(vaccinationCoverage * 10) / 10,
        diseaseIncidence: Math.round(diseaseIncidence * 10) / 10,
        mortalityRate: Math.round(mortalityRate * 10) / 10,
        averageWeight: Math.round(averageWeight * 10) / 10,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + " 1, 2024");
      const dateB = new Date(b.date + " 1, 2024");
      return dateA.getTime() - dateB.getTime();
    });

  return healthMetrics;
};

export const getCustomerRatings = async (
  user: SessionUser | null,
  startDate?: Date,
  endDate?: Date
): Promise<CustomerRating[]> => {
  const reviews = await getReviews(user);

  let filteredReviews = reviews;
  if (startDate && endDate) {
    filteredReviews = reviews.filter((r) => {
      const reviewDate = new Date(r.date);
      return reviewDate >= startDate && reviewDate <= endDate;
    });
  }

  // Group by date
  const dateMap = new Map<string, Review[]>();

  filteredReviews.forEach((review) => {
    const date = review.date.split("T")[0]; // Get YYYY-MM-DD part
    if (!dateMap.has(date)) {
      dateMap.set(date, []);
    }
    dateMap.get(date)!.push(review);
  });

  // Convert to CustomerRating format
  const customerRatings: CustomerRating[] = Array.from(dateMap.entries()).map(
    ([date, dateReviews]) => {
      // Get average rating for the date
      const avgRating =
        dateReviews.length > 0
          ? dateReviews.reduce((sum, r) => sum + r.rating, 0) /
            dateReviews.length
          : 0;

      // Use first review's customerId and transactionId, or generate defaults
      const firstReview = dateReviews[0];
      return {
        date,
        rating: Math.round(avgRating * 10) / 10,
        customerId: firstReview.customerId || firstReview.customer,
        transactionId: firstReview.transactionId || firstReview.id,
      };
    }
  );

  // Sort by date
  return customerRatings.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};


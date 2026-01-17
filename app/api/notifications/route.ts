import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getSalesTransactions } from "@/lib/sales";
import { getInventoryItems } from "@/lib/inventory";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

const REVIEWS_COLLECTION = "reviews";
const ROOSTERS_COLLECTION = "roosters";

interface Notification {
  id: string;
  type: "inventory" | "sales" | "feedback" | "health";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  read: boolean;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  
  const weeks = Math.floor(diffDays / 7);
  return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
};

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    const canRead = hasRequiredRole(sessionUser.roles, ["admin", "staff"]);
    if (!canRead) {
      return jsonError("FORBIDDEN", "You do not have permission to view notifications.", 403);
    }

    const notifications: Notification[] = [];

    // Get recent sales (last 10, within last 7 days)
    try {
      const sales = await getSalesTransactions(sessionUser);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSales = sales
        .filter((sale) => {
          const saleDate = new Date(sale.date);
          return saleDate >= sevenDaysAgo && sale.status === "completed";
        })
        .slice(0, 5)
        .map((sale) => {
          const saleDate = new Date(sale.date);
          return {
            id: `sale-${sale.id}`,
            type: "sales" as const,
            title: "New Sale Completed",
            description: `Rooster ${sale.transactionId || sale.id} sold for ₱${sale.amount.toLocaleString()}`,
            time: formatTimeAgo(saleDate),
            timestamp: saleDate.getTime(),
            read: false,
          };
        });

      notifications.push(...recentSales);
    } catch (error) {
      console.error("Error fetching sales for notifications:", error);
    }

    // Get low stock inventory items
    try {
      const inventory = await getInventoryItems(sessionUser);
      const lowStockItems = inventory
        .filter((item) => item.status === "low" || item.status === "critical")
        .slice(0, 5)
        .map((item) => {
          const lastRestocked = item.lastRestocked ? new Date(item.lastRestocked) : new Date();
          return {
            id: `inventory-${item.id}`,
            type: "inventory" as const,
            title: item.status === "critical" ? "Critical Stock Alert" : "Low Stock Alert",
            description: `${item.name} running low. Only ${item.currentStock} ${item.unit} remaining.`,
            time: formatTimeAgo(lastRestocked),
            timestamp: lastRestocked.getTime(),
            read: false,
          };
        });

      notifications.push(...lowStockItems);
    } catch (error) {
      console.error("Error fetching inventory for notifications:", error);
    }

    // Get recent reviews (last 5, within last 7 days)
    try {
      const reviewsSnapshot = await adminDb
        .collection(REVIEWS_COLLECTION)
        .orderBy("date", "desc")
        .limit(5)
        .get();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentReviews = reviewsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const reviewDate = new Date(data.date || Date.now());
          return {
            id: `review-${doc.id}`,
            type: "feedback" as const,
            title: "New Customer Review",
            description: `${data.rating || 0}-star rating from ${data.customer || "Customer"} on ${data.rooster || "recent purchase"}`,
            time: formatTimeAgo(reviewDate),
            timestamp: reviewDate.getTime(),
            read: false,
          };
        })
        .filter((review) => {
          const reviewDate = new Date(review.timestamp);
          return reviewDate >= sevenDaysAgo;
        });

      notifications.push(...recentReviews);
    } catch (error) {
      console.error("Error fetching reviews for notifications:", error);
    }

    // Get roosters in quarantine (health alerts)
    try {
      const roostersSnapshot = await adminDb
        .collection(ROOSTERS_COLLECTION)
        .where("status", "==", "Quarantine")
        .limit(5)
        .get();

      const healthAlerts = roostersSnapshot.docs.map((doc) => {
        const data = doc.data();
        const dateAdded = data.dateAdded ? new Date(data.dateAdded) : new Date();
        return {
          id: `health-${doc.id}`,
          type: "health" as const,
          title: "Health Check Reminder",
          description: `Rooster ${data.id || doc.id} (${data.breed || "Unknown breed"}) is in quarantine`,
          time: formatTimeAgo(dateAdded),
          timestamp: dateAdded.getTime(),
          read: false,
        };
      });

      notifications.push(...healthAlerts);
    } catch (error) {
      console.error("Error fetching roosters for notifications:", error);
    }

    // Sort by timestamp (most recent first) and limit to 20
    notifications.sort((a, b) => b.timestamp - a.timestamp);
    const limitedNotifications = notifications.slice(0, 20);

    return jsonSuccess(limitedNotifications, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to view notifications.", 403);
      }
    }

    console.error("GET /api/notifications error:", error);
    return jsonError("NOTIFICATIONS_FETCH_FAILED", "Failed to load notifications.", 500);
  }
}


import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { getSalesTransactions } from "@/lib/sales";
import { getInventoryItems } from "@/lib/inventory";
import { getRoosters } from "@/lib/roosters";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

const REVIEWS_COLLECTION = "reviews";

interface Activity {
  action: string;
  detail: string;
  time: string;
  timestamp: number;
  icon: string;
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
      return jsonError("FORBIDDEN", "You do not have permission to view activity.", 403);
    }

    const activities: Activity[] = [];

    // Get recent rooster additions (last 30 days)
    try {
      const roosters = await getRoosters(sessionUser);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRoosters = roosters
        .filter((rooster) => {
          const dateAdded = new Date(rooster.dateAdded || rooster.arrivalDate);
          return dateAdded >= thirtyDaysAgo;
        })
        .sort((a, b) => {
          const dateA = new Date(a.dateAdded || a.arrivalDate).getTime();
          const dateB = new Date(b.dateAdded || b.arrivalDate).getTime();
          return dateB - dateA;
        })
        .slice(0, 3)
        .map((rooster) => {
          const dateAdded = new Date(rooster.dateAdded || rooster.arrivalDate);
          return {
            action: "New rooster added",
            detail: `${rooster.breed} breed - ${rooster.id}`,
            time: formatTimeAgo(dateAdded),
            timestamp: dateAdded.getTime(),
            icon: "Bird",
          };
        });

      activities.push(...recentRoosters);
    } catch (error) {
      console.error("Error fetching roosters for activity:", error);
    }

    // Get recent sales (last 30 days)
    try {
      const sales = await getSalesTransactions(sessionUser);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSales = sales
        .filter((sale) => {
          const saleDate = new Date(sale.date);
          return saleDate >= thirtyDaysAgo && sale.status === "completed";
        })
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
        .slice(0, 2)
        .map((sale) => {
          const saleDate = new Date(sale.date);
          return {
            action: "Sale completed",
            detail: `${sale.breed} breed - ₱${sale.amount.toLocaleString()}`,
            time: formatTimeAgo(saleDate),
            timestamp: saleDate.getTime(),
            icon: "PhilippinePeso",
          };
        });

      activities.push(...recentSales);
    } catch (error) {
      console.error("Error fetching sales for activity:", error);
    }

    // Get inventory alerts
    try {
      const inventory = await getInventoryItems(sessionUser);
      const lowStockItems = inventory.filter(
        (item) => item.status === "low" || item.status === "critical"
      );

      if (lowStockItems.length > 0) {
        const criticalCount = lowStockItems.filter((item) => item.status === "critical").length;
        const lowCount = lowStockItems.length - criticalCount;

        let alertText = "";
        if (criticalCount > 0) {
          alertText = `${criticalCount} critical item${criticalCount > 1 ? "s" : ""}`;
          if (lowCount > 0) {
            alertText += ` and ${lowCount} low stock item${lowCount > 1 ? "s" : ""}`;
          }
        } else {
          alertText = `${lowCount} low stock item${lowCount > 1 ? "s" : ""}`;
        }

        const mostRecentAlert = lowStockItems
          .map((item) => {
            const lastRestocked = item.lastRestocked ? new Date(item.lastRestocked) : new Date();
            return {
              item,
              timestamp: lastRestocked.getTime(),
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp)[0];

        activities.push({
          action: "Inventory alert",
          detail: `Stock below threshold: ${alertText}`,
          time: formatTimeAgo(new Date(mostRecentAlert.timestamp)),
          timestamp: mostRecentAlert.timestamp,
          icon: "Package",
        });
      }
    } catch (error) {
      console.error("Error fetching inventory for activity:", error);
    }

    // Get health check info (roosters in quarantine)
    try {
      const roosters = await getRoosters(sessionUser);
      const quarantineCount = roosters.filter((r) => r.status === "Quarantine").length;

      if (quarantineCount > 0) {
        activities.push({
          action: "Health check completed",
          detail: `${quarantineCount} rooster${quarantineCount > 1 ? "s" : ""} in quarantine`,
          time: formatTimeAgo(new Date()),
          timestamp: Date.now(),
          icon: "Users",
        });
      } else {
        const totalRoosters = roosters.length;
        if (totalRoosters > 0) {
          activities.push({
            action: "Health check completed",
            detail: `${totalRoosters} rooster${totalRoosters > 1 ? "s" : ""} examined`,
            time: formatTimeAgo(new Date(Date.now() - 86400000)), // 1 day ago
            timestamp: Date.now() - 86400000,
            icon: "Users",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching health info for activity:", error);
    }

    // Sort by timestamp (most recent first) and limit to 10
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const limitedActivities = activities.slice(0, 10);

    return jsonSuccess(limitedActivities, { status: 200 });
  } catch (error: any) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return jsonError("UNAUTHENTICATED", "No active session.", 401);
      }

      if (error.message === "FORBIDDEN") {
        return jsonError("FORBIDDEN", "You do not have permission to view activity.", 403);
      }
    }

    console.error("GET /api/dashboard/activity error:", error);
    return jsonError("ACTIVITY_FETCH_FAILED", "Failed to load activity.", 500);
  }
}


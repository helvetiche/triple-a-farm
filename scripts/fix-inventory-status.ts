/**
 * Script to recalculate and fix all inventory item statuses
 * This will update all items to use the correct status based on percentage of maxStock
 *
 * Usage:
 *   npx tsx scripts/fix-inventory-status.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load env before importing firebase
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const INVENTORY_COLLECTION = "inventoryItems";

async function fixInventoryStatus() {
  console.log("🔧 Starting inventory status fix...");
  console.log("=".repeat(60));

  try {
    // Dynamic import after env is loaded
    const { adminDb } = await import("../lib/firebase");
    const { calculateInventoryStatus } = await import("../lib/inventory-types");

    const inventorySnapshot = await adminDb
      .collection(INVENTORY_COLLECTION)
      .get();

    if (inventorySnapshot.empty) {
      console.log("  No inventory items found.");
      return;
    }

    console.log(`\nFound ${inventorySnapshot.size} inventory items to process\n`);

    const batchSize = 500;
    let processedCount = 0;
    let updatedCount = 0;

    const allDocs = inventorySnapshot.docs;

    for (let i = 0; i < allDocs.length; i += batchSize) {
      const batch = adminDb.batch();
      const chunk = allDocs.slice(i, i + batchSize);

      for (const doc of chunk) {
        const data = doc.data();
        const currentStock = data.currentStock || 0;
        const minStock = data.minStock || 0;
        const maxStock = data.maxStock || minStock * 2;

        // Calculate the correct status
        const correctStatus = calculateInventoryStatus(
          currentStock,
          minStock,
          maxStock
        );

        const oldStatus = data.status;

        // Only update if status changed
        if (oldStatus !== correctStatus) {
          batch.update(doc.ref, { status: correctStatus });
          updatedCount++;
          
          const percentage = maxStock > 0 ? ((currentStock / maxStock) * 100).toFixed(1) : 0;
          console.log(
            `  ${data.name}: ${oldStatus} → ${correctStatus} (${currentStock}/${maxStock} = ${percentage}%)`
          );
        }

        processedCount++;
      }

      await batch.commit();
      console.log(`\nProcessed ${processedCount}/${allDocs.length} items...`);
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Status fix complete!`);
    console.log(`   Processed: ${processedCount} items`);
    console.log(`   Updated: ${updatedCount} items`);
    console.log(`   Unchanged: ${processedCount - updatedCount} items`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error fixing inventory status:", error);
    throw error;
  }
}

fixInventoryStatus()
  .then(() => {
    console.log("\n✨ Script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

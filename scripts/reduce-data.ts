/**
 * Script to reduce inventory and sales data
 * - Deletes half of the inventory items
 * - Reduces sales transactions to only 10
 *
 * Usage:
 *   npx tsx scripts/reduce-data.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load env before importing firebase
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const INVENTORY_COLLECTION = "inventoryItems";
const SALES_COLLECTION = "sales";

async function reduceInventory(adminDb: FirebaseFirestore.Firestore) {
  console.log("\n📦 Processing Inventory...");
  console.log("-".repeat(60));

  const inventorySnapshot = await adminDb.collection(INVENTORY_COLLECTION).get();

  if (inventorySnapshot.empty) {
    console.log("  No inventory items found.");
    return;
  }

  const totalItems = inventorySnapshot.size;
  const itemsToDelete = Math.floor(totalItems / 2);

  console.log(`  Total inventory items: ${totalItems}`);
  console.log(`  Items to delete: ${itemsToDelete}`);
  console.log(`  Items to keep: ${totalItems - itemsToDelete}`);

  // Shuffle and take half
  const allDocs = inventorySnapshot.docs;
  const shuffled = allDocs.sort(() => Math.random() - 0.5);
  const docsToDelete = shuffled.slice(0, itemsToDelete);

  // Delete in batches
  const batchSize = 500;
  let deletedCount = 0;

  for (let i = 0; i < docsToDelete.length; i += batchSize) {
    const batch = adminDb.batch();
    const chunk = docsToDelete.slice(i, i + batchSize);

    for (const doc of chunk) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    deletedCount += chunk.length;
    console.log(`  Deleted ${deletedCount}/${itemsToDelete} items...`);
  }

  console.log(`  ✅ Successfully deleted ${deletedCount} inventory items`);
}

async function reduceSales(adminDb: FirebaseFirestore.Firestore) {
  console.log("\n💰 Processing Sales...");
  console.log("-".repeat(60));

  const salesSnapshot = await adminDb.collection(SALES_COLLECTION).get();

  if (salesSnapshot.empty) {
    console.log("  No sales transactions found.");
    return;
  }

  const totalSales = salesSnapshot.size;
  const salesToKeep = 10;

  console.log(`  Total sales transactions: ${totalSales}`);

  if (totalSales <= salesToKeep) {
    console.log(`  Already at or below ${salesToKeep} transactions. No action needed.`);
    return;
  }

  const salesToDelete = totalSales - salesToKeep;
  console.log(`  Transactions to delete: ${salesToDelete}`);
  console.log(`  Transactions to keep: ${salesToKeep}`);

  // Sort by date (keep the most recent 10)
  const allDocs = salesSnapshot.docs;
  const sortedDocs = allDocs.sort((a, b) => {
    const dateA = a.data().date || "";
    const dateB = b.data().date || "";
    return dateB.localeCompare(dateA); // Descending order (newest first)
  });

  // Keep first 10, delete the rest
  const docsToDelete = sortedDocs.slice(salesToKeep);

  // Delete in batches
  const batchSize = 500;
  let deletedCount = 0;

  for (let i = 0; i < docsToDelete.length; i += batchSize) {
    const batch = adminDb.batch();
    const chunk = docsToDelete.slice(i, i + batchSize);

    for (const doc of chunk) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    deletedCount += chunk.length;
    console.log(`  Deleted ${deletedCount}/${salesToDelete} transactions...`);
  }

  console.log(`  ✅ Successfully deleted ${deletedCount} sales transactions`);
  console.log(`  ✅ Kept the ${salesToKeep} most recent transactions`);
}

async function reduceData() {
  console.log("🚀 Starting data reduction...");
  console.log("=".repeat(60));

  try {
    // Dynamic import after env is loaded
    const { adminDb } = await import("../lib/firebase");

    await reduceInventory(adminDb);
    await reduceSales(adminDb);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Data reduction complete!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Error reducing data:", error);
    throw error;
  }
}

reduceData()
  .then(() => {
    console.log("\n✨ Script finished successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

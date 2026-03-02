#!/usr/bin/env npx tsx
/**
 * Fix Overstock Script
 * Finds and corrects inventory items where currentStock exceeds maxStock.
 *
 * Usage:
 *   npx tsx scripts/fix-overstock.ts [options]
 *
 * Options:
 *   --dry-run    Preview changes without applying them (default: true)
 *   --apply      Actually apply the changes to the database
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg: string) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg: string) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warn: (msg: string) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  header: (msg: string) =>
    console.log(`\n${COLORS.bright}${COLORS.cyan}${msg}${COLORS.reset}\n`),
};

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  maxStock?: number;
  minStock: number;
  unit: string;
  status: string;
}

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountJson = process.env.NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error(
      "NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT environment variable is not set"
    );
  }

  let serviceAccount: Record<string, unknown>;
  try {
    const trimmed = serviceAccountJson.trim();
    const withoutOuterQuotes =
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ? trimmed.slice(1, -1)
        : trimmed;
    serviceAccount = JSON.parse(withoutOuterQuotes);
  } catch {
    throw new Error("NEXT_PRIVATE_FIREBASE_SERVICE_ACCOUNT is not valid JSON");
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.NEXT_PRIVATE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PRIVATE_FIREBASE_STORAGE_BUCKET,
  });
};

const calculateStatus = (currentStock: number, minStock: number): string => {
  if (currentStock <= 0) return "critical";
  if (currentStock <= minStock) return "low";
  return "adequate";
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--apply");

  console.log(`
${COLORS.bright}${COLORS.cyan}╔═══════════════════════════════════════════════════════╗
║         Triple A Farm - Fix Overstock Script          ║
╚═══════════════════════════════════════════════════════╝${COLORS.reset}
`);

  if (dryRun) {
    log.warn("DRY RUN MODE - No changes will be made");
    log.info("Use --apply flag to actually apply changes");
  } else {
    log.warn("APPLY MODE - Changes will be written to database");
  }

  log.header("Initializing Firebase...");

  try {
    initializeFirebase();
    log.success("Firebase initialized");
  } catch (error) {
    log.error(`Failed to initialize Firebase: ${error}`);
    process.exit(1);
  }

  const db = admin.firestore();
  const inventoryCollection = db.collection("inventory");

  log.header("Scanning inventory for overstock...");

  const snapshot = await inventoryCollection.get();
  const items: InventoryItem[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<InventoryItem, "id">),
  }));

  log.info(`Found ${items.length} total inventory items`);

  // Find items where currentStock > maxStock
  const overstockedItems = items.filter(
    (item) => item.maxStock !== undefined && item.currentStock > item.maxStock
  );

  if (overstockedItems.length === 0) {
    log.success("No overstocked items found! All inventory is within limits.");
    return;
  }

  log.warn(`Found ${overstockedItems.length} overstocked items:`);
  console.log("");
  console.log("─".repeat(90));
  console.log(
    `${"ID".padEnd(15)} ${"Name".padEnd(30)} ${"Current".padEnd(12)} ${"Max".padEnd(12)} ${"Excess".padEnd(10)} Unit`
  );
  console.log("─".repeat(90));

  let totalExcess = 0;

  for (const item of overstockedItems) {
    const excess = item.currentStock - (item.maxStock || 0);
    totalExcess += excess;

    console.log(
      `${COLORS.yellow}${item.id.substring(0, 14).padEnd(15)}${COLORS.reset} ` +
        `${item.name.substring(0, 29).padEnd(30)} ` +
        `${COLORS.red}${item.currentStock.toString().padEnd(12)}${COLORS.reset} ` +
        `${(item.maxStock || 0).toString().padEnd(12)} ` +
        `${COLORS.red}+${excess.toString().padEnd(9)}${COLORS.reset} ` +
        `${item.unit}`
    );
  }

  console.log("─".repeat(90));
  log.info(`Total excess units across all items: ${totalExcess}`);
  console.log("");

  if (dryRun) {
    log.header("Preview of changes:");
    for (const item of overstockedItems) {
      const newStock = item.maxStock || 0;
      const newStatus = calculateStatus(newStock, item.minStock);
      console.log(
        `  ${item.name}: ${COLORS.red}${item.currentStock}${COLORS.reset} → ${COLORS.green}${newStock}${COLORS.reset} ${item.unit} (status: ${newStatus})`
      );
    }
    console.log("");
    log.info("Run with --apply to make these changes");
    return;
  }

  // Apply changes
  log.header("Applying fixes...");

  const batch = db.batch();
  const changes: { name: string; before: number; after: number }[] = [];

  for (const item of overstockedItems) {
    const newStock = item.maxStock || 0;
    const newStatus = calculateStatus(newStock, item.minStock);

    const docRef = inventoryCollection.doc(item.id);
    batch.update(docRef, {
      currentStock: newStock,
      status: newStatus,
      lastModified: new Date().toISOString(),
    });

    changes.push({
      name: item.name,
      before: item.currentStock,
      after: newStock,
    });

    // Log activity for each fix
    const activityRef = db.collection("inventory_activity").doc();
    batch.set(activityRef, {
      itemId: item.id,
      itemName: item.name,
      type: "consume",
      amount: item.currentStock - newStock,
      unit: item.unit,
      reason: "Overstock correction (automated fix)",
      previousStock: item.currentStock,
      newStock: newStock,
      performedBy: "System (fix-overstock script)",
      performedAt: new Date().toISOString(),
    });
  }

  await batch.commit();

  log.success(`Fixed ${overstockedItems.length} items:`);
  for (const change of changes) {
    console.log(
      `  ${COLORS.green}✓${COLORS.reset} ${change.name}: ${change.before} → ${change.after}`
    );
  }

  log.header("Summary");
  console.log(`  Items fixed: ${overstockedItems.length}`);
  console.log(`  Total excess removed: ${totalExcess} units`);
  console.log(`  Activity logs created: ${overstockedItems.length}`);
  console.log("");
  log.success("Overstock fix complete!");
};

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Set Max Stock Script
 * Sets maxStock for all inventory items that don't have it.
 *
 * Usage:
 *   npx tsx scripts/set-max-stock.ts [options]
 *
 * Options:
 *   --multiplier <n>  Set maxStock as minStock * n (default: 3)
 *   --dry-run         Preview changes without applying them (default)
 *   --apply           Actually apply the changes to the database
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
  minStock: number;
  maxStock?: number;
  unit: string;
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

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--apply");

  let multiplier = 3;
  const multiplierIndex = args.indexOf("--multiplier");
  if (multiplierIndex !== -1 && args[multiplierIndex + 1]) {
    multiplier = parseFloat(args[multiplierIndex + 1]);
    if (isNaN(multiplier) || multiplier <= 0) {
      log.error("Invalid multiplier value. Using default: 3");
      multiplier = 3;
    }
  }

  console.log(`
${COLORS.bright}${COLORS.cyan}╔═══════════════════════════════════════════════════════╗
║        Triple A Farm - Set Max Stock Script           ║
╚═══════════════════════════════════════════════════════╝${COLORS.reset}
`);

  log.info(`Multiplier: ${multiplier}x (maxStock = minStock × ${multiplier})`);

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

  log.header("Scanning inventory...");

  const snapshot = await inventoryCollection.get();
  const items: InventoryItem[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<InventoryItem, "id">),
  }));

  log.info(`Found ${items.length} total inventory items`);

  // Find items without maxStock
  const itemsWithoutMax = items.filter((item) => !item.maxStock);
  const itemsWithMax = items.filter((item) => item.maxStock);

  log.info(`Items with maxStock: ${itemsWithMax.length}`);
  log.info(`Items without maxStock: ${itemsWithoutMax.length}`);

  if (itemsWithoutMax.length === 0) {
    log.success("All items already have maxStock set!");
    return;
  }

  console.log("");
  console.log("─".repeat(80));
  console.log(
    `${"Name".padEnd(30)} ${"Min".padEnd(10)} ${"Current".padEnd(10)} ${"New Max".padEnd(10)} Unit`
  );
  console.log("─".repeat(80));

  const updates: { item: InventoryItem; newMax: number }[] = [];

  for (const item of itemsWithoutMax) {
    const newMax = Math.ceil(item.minStock * multiplier);
    updates.push({ item, newMax });

    console.log(
      `${item.name.substring(0, 29).padEnd(30)} ` +
        `${item.minStock.toString().padEnd(10)} ` +
        `${item.currentStock.toString().padEnd(10)} ` +
        `${COLORS.green}${newMax.toString().padEnd(10)}${COLORS.reset} ` +
        `${item.unit}`
    );
  }

  console.log("─".repeat(80));
  console.log("");

  if (dryRun) {
    log.info("Run with --apply to set these maxStock values");
    log.info(
      `Example: npx tsx scripts/set-max-stock.ts --multiplier ${multiplier} --apply`
    );
    return;
  }

  // Apply changes
  log.header("Applying changes...");

  const batch = db.batch();

  for (const { item, newMax } of updates) {
    const docRef = inventoryCollection.doc(item.id);
    batch.update(docRef, { maxStock: newMax });
  }

  await batch.commit();

  log.success(`Updated ${updates.length} items with maxStock values`);

  log.header("Summary");
  console.log(`  Items updated: ${updates.length}`);
  console.log(`  Multiplier used: ${multiplier}x`);
  console.log("");
  log.success("Max stock values set!");
};

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

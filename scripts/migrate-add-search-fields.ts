/**
 * Migration script to add search index fields to existing documents
 * Run with: npx ts-node scripts/migrate-add-search-fields.ts
 */

import { adminDb } from "../lib/firebase";

async function migrateInventoryItems() {
  console.log("Migrating inventory items...");
  
  const snapshot = await adminDb.collection("inventoryItems").get();
  const batch = adminDb.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.nameLower && data.name) {
      batch.update(doc.ref, {
        nameLower: data.name.toLowerCase(),
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Updated ${count} inventory items with nameLower field`);
  } else {
    console.log("✅ All inventory items already have nameLower field");
  }
}

async function migrateRoosters() {
  console.log("Migrating roosters...");
  
  const snapshot = await adminDb.collection("roosters").get();
  const batch = adminDb.batch();
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.nameLower && data.name) {
      batch.update(doc.ref, {
        nameLower: data.name.toLowerCase(),
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Updated ${count} roosters with nameLower field`);
  } else {
    console.log("✅ All roosters already have nameLower field");
  }
}

async function main() {
  try {
    console.log("Starting migration to add search index fields...\n");
    
    await migrateInventoryItems();
    await migrateRoosters();
    
    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Create Firestore composite index for: inventoryItems (nameLower ASC, locationId ASC)");
    console.log("2. Create Firestore composite index for: roosters (nameLower ASC, status ASC)");
    console.log("\nRun these commands in Firebase Console or use the provided index links when you query.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();

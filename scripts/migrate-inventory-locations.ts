/**
 * Migration script to assign existing inventory items to a default farm location
 * Run with: npx tsx scripts/migrate-inventory-locations.ts
 */

import { adminDb } from "../lib/firebase";

const INVENTORY_COLLECTION = "inventoryItems";
const LOCATIONS_COLLECTION = "farm_locations";

async function migrateInventoryLocations() {
  console.log("Starting inventory location migration...");

  try {
    const locationsRef = adminDb.collection(LOCATIONS_COLLECTION);
    const inventoryRef = adminDb.collection(INVENTORY_COLLECTION);

    const locationsSnapshot = await locationsRef
      .orderBy("name", "asc")
      .limit(1)
      .get();

    if (locationsSnapshot.empty) {
      console.log("No farm locations found. Creating a default location...");

      const defaultLocation = {
        locationId: `LOC-${Date.now()}`,
        name: "Main Farm",
        address: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "migration-script",
      };

      await locationsRef.doc(defaultLocation.locationId).set(defaultLocation);
      console.log(
        `Created default location: ${defaultLocation.name} (ID: ${defaultLocation.locationId})`
      );

      await assignLocationToInventory(
        inventoryRef,
        defaultLocation.locationId,
        defaultLocation.name,
        defaultLocation.address
      );
    } else {
      const firstLocation = locationsSnapshot.docs[0];
      const locationData = firstLocation.data();
      const locationId = locationData.locationId || firstLocation.id;
      const locationName = locationData.name || "Main Farm";
      const locationAddress = locationData.address || "";

      console.log(
        `Using existing location: ${locationName} (ID: ${locationId})`
      );

      await assignLocationToInventory(
        inventoryRef,
        locationId,
        locationName,
        locationAddress
      );
    }

    console.log("\nMigration complete!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

async function assignLocationToInventory(
  inventoryRef: FirebaseFirestore.CollectionReference,
  locationId: string,
  locationName: string,
  locationAddress: string
) {
  const inventorySnapshot = await inventoryRef.get();

  if (inventorySnapshot.empty) {
    console.log("No inventory items found. Nothing to migrate.");
    return;
  }

  console.log(`Found ${inventorySnapshot.size} inventory items to process...`);

  let updated = 0;
  let skipped = 0;

  const batch = adminDb.batch();
  let batchCount = 0;
  const MAX_BATCH_SIZE = 500;

  for (const doc of inventorySnapshot.docs) {
    const data = doc.data();

    if (data.locationId) {
      skipped++;
      continue;
    }

    batch.update(doc.ref, {
      locationId,
      locationName,
      locationAddress: locationAddress || null,
    });

    updated++;
    batchCount++;

    if (batchCount >= MAX_BATCH_SIZE) {
      await batch.commit();
      console.log(`Committed batch of ${batchCount} updates...`);
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates...`);
  }

  console.log(`\nResults:`);
  console.log(`  - Updated: ${updated} items`);
  console.log(`  - Skipped (already have location): ${skipped} items`);
}

migrateInventoryLocations()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration failed:", error);
    process.exit(1);
  });

/**
 * Seed script to add inventory items for each farm location
 * Run with: npx tsx scripts/seed-inventory.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load env before importing firebase
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const INVENTORY_COLLECTION = "inventoryItems";
const LOCATIONS_COLLECTION = "farm_locations";

interface FarmLocation {
  locationId: string;
  name: string;
  address?: string;
}

const inventoryTemplates = [
  {
    name: "Premium Gamefowl Pellets",
    category: "Feed",
    currentStock: 150,
    minStock: 50,
    unit: "sacks",
    supplier: "AgriFeeds Corp",
    price: 1250,
    description: "High-protein pellets formulated for gamefowl conditioning and growth.",
  },
  {
    name: "Vitamin B Complex",
    category: "Supplements",
    currentStock: 45,
    minStock: 20,
    unit: "bottles",
    supplier: "VetMed Supply",
    price: 320,
    description: "Essential B vitamins for energy and metabolism support.",
  },
  {
    name: "Electrolyte Powder",
    category: "Supplements",
    currentStock: 30,
    minStock: 15,
    unit: "boxes",
    supplier: "VetMed Supply",
    price: 180,
    description: "Rehydration formula for stress recovery and hot weather.",
  },
  {
    name: "Antibacterial Solution",
    category: "Medicine",
    currentStock: 12,
    minStock: 10,
    unit: "bottles",
    supplier: "VetMed Supply",
    price: 450,
    description: "Broad-spectrum antibacterial for wound treatment.",
  },
  {
    name: "Deworming Tablets",
    category: "Medicine",
    currentStock: 8,
    minStock: 15,
    unit: "boxes",
    supplier: "VetMed Supply",
    price: 280,
    description: "Internal parasite control tablets.",
  },
  {
    name: "Wound Spray",
    category: "Medicine",
    currentStock: 25,
    minStock: 10,
    unit: "bottles",
    supplier: "VetMed Supply",
    price: 195,
    description: "Antiseptic spray for minor cuts and abrasions.",
  },
  {
    name: "Disinfectant Concentrate",
    category: "Cleaning",
    currentStock: 18,
    minStock: 8,
    unit: "liters",
    supplier: "CleanPro Solutions",
    price: 520,
    description: "Heavy-duty disinfectant for pen and equipment sanitation.",
  },
  {
    name: "Leg Bands (Assorted)",
    category: "Equipment",
    currentStock: 200,
    minStock: 100,
    unit: "pieces",
    supplier: "Farm Supply Co",
    price: 15,
    description: "Colored leg bands for identification.",
  },
  {
    name: "Feeding Troughs",
    category: "Equipment",
    currentStock: 35,
    minStock: 20,
    unit: "pieces",
    supplier: "Farm Supply Co",
    price: 85,
    description: "Durable plastic feeding troughs.",
  },
  {
    name: "Water Dispensers",
    category: "Equipment",
    currentStock: 28,
    minStock: 15,
    unit: "pieces",
    supplier: "Farm Supply Co",
    price: 120,
    description: "Automatic water dispensers for pens.",
  },
];

function randomizeStock(baseStock: number): number {
  const variance = Math.floor(baseStock * 0.3);
  return baseStock + Math.floor(Math.random() * variance * 2) - variance;
}

async function seedInventory() {
  // Dynamic import after env is loaded
  const { adminDb } = await import("../lib/firebase");
  const { calculateInventoryStatus, formatInventoryDisplayId } = await import("../lib/inventory-types");

  console.log("Starting inventory seeding...\n");

  try {
    const locationsSnapshot = await adminDb.collection(LOCATIONS_COLLECTION).get();
    
    const locations: FarmLocation[] = locationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        locationId: data.locationId || doc.id,
        name: data.name || "",
        address: data.address || "",
      };
    });

    if (locations.length === 0) {
      console.log("No farm locations found. Please create locations first.");
      return;
    }

    console.log(`Found ${locations.length} location(s):\n`);
    locations.forEach((loc) => {
      console.log(`  - ${loc.name} (${loc.locationId})`);
    });
    console.log("");

    const inventoryRef = adminDb.collection(INVENTORY_COLLECTION);
    let totalCreated = 0;

    for (const location of locations) {
      console.log(`\nSeeding inventory for: ${location.name}`);
      console.log("-".repeat(40));

      for (const template of inventoryTemplates) {
        const currentStock = randomizeStock(template.currentStock);
        const createdAt = new Date().toISOString().split("T")[0];
        const status = calculateInventoryStatus(currentStock, template.minStock);

        const docRef = inventoryRef.doc();
        
        const displayId = formatInventoryDisplayId({
          id: docRef.id,
          createdAt,
          lastRestocked: createdAt,
        });

        const inventoryItem = {
          displayId,
          createdAt,
          name: template.name,
          category: template.category,
          currentStock,
          minStock: template.minStock,
          unit: template.unit,
          supplier: template.supplier,
          price: template.price,
          description: template.description,
          lastRestocked: createdAt,
          status,
          locationId: location.locationId,
          locationName: location.name,
          locationAddress: location.address || "",
        };

        await docRef.set(inventoryItem);
        console.log(`  + ${template.name} (${currentStock} ${template.unit}) - ${status}`);
        totalCreated++;
      }
    }

    console.log(`\n${"=".repeat(40)}`);
    console.log(`Successfully seeded ${totalCreated} inventory items!`);
    console.log(`  - ${locations.length} locations`);
    console.log(`  - ${inventoryTemplates.length} items per location`);
  } catch (error) {
    console.error("Error seeding inventory:", error);
    throw error;
  }
}

seedInventory()
  .then(() => {
    console.log("\nSeeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  });

/**
 * Seed script to add inventory items for each farm location
 *
 * Usage:
 *   npm run seed:inventory         # Add inventory (keeps existing)
 *   npm run seed:inventory:fresh   # Clear existing and seed fresh
 *
 * Or directly:
 *   npx tsx scripts/seed-inventory.ts
 *   npx tsx scripts/seed-inventory.ts --clear
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
  // ===== FEEDS =====
  {
    name: "B-MEG Integra Power Maxx",
    category: "Feed",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "sacks",
    supplier: "San Miguel Foods (B-MEG)",
    price: 1850,
    description:
      "Premium conditioning pellet for gamebirds with high protein content for muscle development and peak performance.",
  },
  {
    name: "Salto Power Pellet",
    category: "Feed",
    currentStock: 30,
    minStock: 15,
    maxStock: 80,
    unit: "sacks",
    supplier: "Salto Philippines",
    price: 1650,
    description:
      "Fat-burning conditioning pellet with HYPERFLEX formula for stronger power and faster reflex. For gamefowls 16 months and above.",
  },
  {
    name: "Sagupaan Hi-Protein Booster",
    category: "Feed",
    currentStock: 25,
    minStock: 10,
    maxStock: 60,
    unit: "sacks",
    supplier: "Sagupaan Superfeeds",
    price: 1450,
    description:
      "Winning Line hi-protein power booster pellets formulated for gamefowl conditioning and muscle building.",
  },
  {
    name: "B-MEG Integra 3000 Plus",
    category: "Feed",
    currentStock: 60,
    minStock: 25,
    maxStock: 120,
    unit: "sacks",
    supplier: "San Miguel Foods (B-MEG)",
    price: 1350,
    description:
      "Mixed pellet and grains with balanced nutrition for daily maintenance of fighting cocks.",
  },

  // ===== VITAMINS & SUPPLEMENTS =====
  {
    name: "Lakpue Vitavet Plus",
    category: "Supplements",
    currentStock: 35,
    minStock: 15,
    maxStock: 80,
    unit: "jars",
    supplier: "Lakpue Drug Inc.",
    price: 485,
    description:
      "Egg and cockerel booster with highly concentrated multivitamins and amino acids. Available in 100g jars.",
  },
  {
    name: "LDI B12 5500",
    category: "Supplements",
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    unit: "bottles",
    supplier: "Lakpue Drug Inc.",
    price: 320,
    description:
      "Injectable Vitamin B12 with Cyanocobalamin and Hydroxocobalamine for conditioning and stamina boost.",
  },
  {
    name: "Belamyl B-Complex",
    category: "Supplements",
    currentStock: 40,
    minStock: 15,
    maxStock: 80,
    unit: "boxes",
    supplier: "Vetklix II",
    price: 280,
    description:
      "Vitamin B Complex with Liver Extract (10ml). Essential for gamefowl rooster conditioning and recovery.",
  },
  {
    name: "Battlecock VitminPRO",
    category: "Supplements",
    currentStock: 20,
    minStock: 10,
    maxStock: 50,
    unit: "packs",
    supplier: "Battlecock Products",
    price: 600,
    description:
      "Water-soluble vitamins, minerals, amino acids, and probiotics (1kg). For maintenance and conditioning periods.",
  },
  {
    name: "Multi-Lyte Electrolytes",
    category: "Supplements",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "sachets",
    supplier: "Lakpue Drug Inc.",
    price: 85,
    description:
      "Electrolyte powder for rehydration, stress recovery, and hot weather conditioning.",
  },
  {
    name: "Laktamino XE",
    category: "Supplements",
    currentStock: 25,
    minStock: 10,
    maxStock: 60,
    unit: "bottles",
    supplier: "Lakpue Drug Inc.",
    price: 520,
    description:
      "Amino acid supplement for muscle development and faster recovery after fights.",
  },

  // ===== MEDICINE =====
  {
    name: "Sulpar QR Tablets",
    category: "Medicine",
    currentStock: 30,
    minStock: 15,
    maxStock: 60,
    unit: "boxes",
    supplier: "Battlecock Products",
    price: 380,
    description:
      "Antibiotic with Sulfadiazine and Paracetamol. Treats coccidiosis, fowl typhoid, and fowl cholera. 1 tablet daily for 3 days.",
  },
  {
    name: "Vermex 4 Dewormer",
    category: "Medicine",
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "boxes",
    supplier: "Lakpue Drug Inc.",
    price: 295,
    description:
      "Broad-spectrum dewormer with Niclosamide, Levamisole, Albendazole, and Praziquantel. Effective against tapeworms, roundworms, and gapeworms.",
  },
  {
    name: "Coxiban Anticoccidial",
    category: "Medicine",
    currentStock: 18,
    minStock: 8,
    maxStock: 40,
    unit: "sachets",
    supplier: "Lakpue Drug Inc.",
    price: 165,
    description:
      "Amprolium Hydrochloride for treating and preventing coccidiosis. 5g per 4L water for 3-7 days.",
  },
  {
    name: "Red Gel Forte Plus",
    category: "Medicine",
    currentStock: 22,
    minStock: 10,
    maxStock: 50,
    unit: "tubes",
    supplier: "Lakpue Drug Inc.",
    price: 245,
    description:
      "Wound healing gel with antibacterial properties. For cuts, abrasions, and post-fight recovery.",
  },
  {
    name: "Thiabex XS",
    category: "Medicine",
    currentStock: 15,
    minStock: 8,
    maxStock: 35,
    unit: "bottles",
    supplier: "Lakpue Drug Inc.",
    price: 420,
    description:
      "Anti-parasitic solution for external parasites, lice, and mites. Keeps feathers healthy and clean.",
  },

  // ===== CLEANING & BIOSECURITY =====
  {
    name: "Virkon S Disinfectant",
    category: "Cleaning",
    currentStock: 12,
    minStock: 5,
    maxStock: 30,
    unit: "packs",
    supplier: "LANXESS (Virkon)",
    price: 1850,
    description:
      "Broad-spectrum disinfectant effective against 500+ viruses, bacteria, and fungi including Avian Influenza and Newcastle Disease. 1kg pack.",
  },
  {
    name: "Clorox Bleach",
    category: "Cleaning",
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "gallons",
    supplier: "Clorox Philippines",
    price: 285,
    description:
      "Multi-purpose bleach for pen sanitation, water treatment, and equipment disinfection.",
  },

  // ===== EQUIPMENT & ACCESSORIES =====
  {
    name: "Aluminum Leg Bands",
    category: "Equipment",
    currentStock: 300,
    minStock: 100,
    maxStock: 600,
    unit: "pieces",
    supplier: "Pintakasi Gamefowl Supply",
    price: 12,
    description:
      "Numbered aluminum leg bands for rooster identification and record-keeping. Assorted colors available.",
  },
  {
    name: "Wing Bands",
    category: "Equipment",
    currentStock: 200,
    minStock: 80,
    maxStock: 400,
    unit: "pieces",
    supplier: "Renesance Tech",
    price: 18,
    description:
      "Durable wing bands for permanent identification. Numbered and color-coded.",
  },
  {
    name: "Gaffing Tape",
    category: "Equipment",
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    unit: "rolls",
    supplier: "Pintakasi Gamefowl Supply",
    price: 85,
    description:
      "High-quality gaffing tape for securing tari. Available in red, yellow, black, blue, green, and white.",
  },
  {
    name: "Tari Knife Set",
    category: "Equipment",
    currentStock: 15,
    minStock: 5,
    maxStock: 30,
    unit: "sets",
    supplier: "Kampfstahl",
    price: 2800,
    description:
      "Semi-full slasher tari knives set (12 pieces). Premium steel for durability and sharpness.",
  },
  {
    name: "Plastic Feeders",
    category: "Equipment",
    currentStock: 40,
    minStock: 15,
    maxStock: 80,
    unit: "pieces",
    supplier: "Prime Feathers Corp",
    price: 95,
    description:
      "Durable plastic hanging feeders for gamefowl pens. Easy to clean and refill.",
  },
  {
    name: "Bell Drinkers",
    category: "Equipment",
    currentStock: 35,
    minStock: 15,
    maxStock: 70,
    unit: "pieces",
    supplier: "Prime Feathers Corp",
    price: 145,
    description:
      "Automatic bell drinkers with adjustable water flow. Keeps water clean and accessible.",
  },
  {
    name: "Cord Ties (Marking)",
    category: "Equipment",
    currentStock: 500,
    minStock: 200,
    maxStock: 1000,
    unit: "pieces",
    supplier: "Pintakasi Gamefowl Supply",
    price: 5,
    description:
      "Colored marking cable ties for temporary rooster identification during conditioning.",
  },
  {
    name: "Digital Weighing Scale",
    category: "Equipment",
    currentStock: 5,
    minStock: 2,
    maxStock: 10,
    unit: "units",
    supplier: "Renesance Tech",
    price: 1650,
    description:
      "Precision digital scale for accurate rooster weighing. Capacity up to 10kg with 1g accuracy.",
  },
];

function randomizeStock(baseStock: number): number {
  const variance = Math.floor(baseStock * 0.3);
  return baseStock + Math.floor(Math.random() * variance * 2) - variance;
}

async function clearExistingInventory(adminDb: FirebaseFirestore.Firestore) {
  console.log("Clearing existing inventory items...");
  const snapshot = await adminDb.collection(INVENTORY_COLLECTION).get();

  if (snapshot.empty) {
    console.log("  No existing items to clear.\n");
    return;
  }

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`  Deleted ${snapshot.size} existing items.\n`);
}

async function seedInventory() {
  // Dynamic import after env is loaded
  const { adminDb } = await import("../lib/firebase");
  const { calculateInventoryStatus, formatInventoryDisplayId } =
    await import("../lib/inventory-types");

  const shouldClear = process.argv.includes("--clear");

  console.log("Starting inventory seeding...\n");

  try {
    if (shouldClear) {
      await clearExistingInventory(adminDb);
    }

    const locationsSnapshot = await adminDb
      .collection(LOCATIONS_COLLECTION)
      .get();

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
        const status = calculateInventoryStatus(
          currentStock,
          template.minStock
        );

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
          maxStock: template.maxStock,
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
        console.log(
          `  + ${template.name} (${currentStock}/${template.maxStock} ${template.unit}) - ${status}`
        );
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

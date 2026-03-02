/**
 * Seed script to add initial suppliers to the database
 * Run with: npx tsx scripts/seed-suppliers.ts
 */

import { adminDb } from "../lib/firebase";

const SUPPLIERS_COLLECTION = "suppliers";

const initialSuppliers = [
  {
    name: "AgriFeeds Corp",
    contactPerson: "Juan Dela Cruz",
    phone: "+63 2 1234 5678",
    email: "contact@agrifeeds.com",
    address: "123 Farm Road, Quezon City, Metro Manila",
    itemsSupplied: 0,
    totalOrders: 0,
    notes: "Primary supplier for gamefowl feed and nutrition products",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "VetMed Supply",
    contactPerson: "Maria Santos",
    phone: "+63 2 2345 6789",
    email: "sales@vetmedsupply.ph",
    address: "456 Medical Ave, Makati City, Metro Manila",
    itemsSupplied: 0,
    totalOrders: 0,
    notes: "Veterinary medicines and supplements specialist",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Farm Supply Co",
    contactPerson: "Pedro Reyes",
    phone: "+63 2 3456 7890",
    email: "info@farmsupply.ph",
    address: "789 Agriculture St, Pasig City, Metro Manila",
    itemsSupplied: 0,
    totalOrders: 0,
    notes: "General farm supplies and equipment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "CleanPro Solutions",
    contactPerson: "Ana Garcia",
    phone: "+63 2 4567 8901",
    email: "support@cleanpro.ph",
    address: "321 Sanitation Blvd, Mandaluyong City, Metro Manila",
    itemsSupplied: 0,
    totalOrders: 0,
    notes: "Cleaning and sanitation products for farm facilities",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedSuppliers() {
  console.log("🌱 Starting supplier seeding...");

  try {
    const suppliersRef = adminDb.collection(SUPPLIERS_COLLECTION);

    // Check if suppliers already exist
    const existingSnapshot = await suppliersRef.limit(1).get();
    if (!existingSnapshot.empty) {
      console.log("⚠️  Suppliers already exist. Skipping seed.");
      console.log("   To re-seed, delete existing suppliers first.");
      return;
    }

    // Add each supplier
    for (const supplier of initialSuppliers) {
      const docRef = await suppliersRef.add(supplier);
      console.log(`✅ Added supplier: ${supplier.name} (ID: ${docRef.id})`);
    }

    console.log(`\n🎉 Successfully seeded ${initialSuppliers.length} suppliers!`);
  } catch (error) {
    console.error("❌ Error seeding suppliers:", error);
    throw error;
  }
}

// Run the seed function
seedSuppliers()
  .then(() => {
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });

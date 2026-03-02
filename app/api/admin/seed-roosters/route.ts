import { NextRequest } from "next/server";
import { getSessionUser, jsonError, jsonSuccess } from "@/lib/auth";
import { adminDb } from "@/lib/firebase";
import { hasRequiredRole } from "@/lib/roles";

const ROOSTERS_COLLECTION = "roosters";
const BREEDS_COLLECTION = "rooster_breeds";

// Sample breed data
const sampleBreeds = [
  {
    name: "Lemon",
    description: "A popular gamefowl breed known for its lemon-colored plumage and fighting prowess.",
    characteristics: ["Aggressive", "Fast", "Intelligent", "Good Cutter"],
    origin: "Philippines"
  },
  {
    name: "Golden Boy", 
    description: "A striking golden-colored breed with excellent fighting abilities and stamina.",
    characteristics: ["Strong", "Durable", "Smart Fighter", "Good Balance"],
    origin: "USA"
  },
  {
    name: "Sweater",
    description: "A well-known breed famous for its sweater-like color pattern and winning record.",
    characteristics: ["Powerful", "Game", "Breaker", "Good Body"],
    origin: "USA"
  }
];

// Sample rooster data for seeding
const sampleRoosters = [
  // Lemon Roosters
  {
    breed: "Lemon",
    age: "24 months",
    weight: "2.3 kg",
    price: "15000",
    status: "Available",
    health: "excellent",
    description: "A prime Lemon rooster with exceptional fighting lineage. Shows great potential in the pit.",
    images: [],
    dateAdded: "2024-01-15",
    location: "Main Farm",
    bloodline: "Lemon Hatch Cross",
  },
  {
    breed: "Lemon", 
    age: "18 months",
    weight: "2.1 kg",
    price: "12000",
    status: "Available",
    health: "good",
    description: "Young Lemon rooster showing great speed and agility. Perfect for breeding.",
    images: [],
    dateAdded: "2024-02-20",
    location: "North Farm",
    bloodline: "Pure Lemon",
  },

  // Golden Boy Roosters
  {
    breed: "Golden Boy",
    age: "30 months", 
    weight: "2.5 kg",
    price: "18000",
    status: "Available",
    health: "excellent",
    description: "Champion Golden Boy with proven track record. Excellent fighter and breeder.",
    images: [],
    dateAdded: "2023-12-10",
    location: "Main Farm",
    bloodline: "Golden Boy Line",
  },
  {
    breed: "Golden Boy",
    age: "22 months",
    weight: "2.4 kg", 
    price: "16000",
    status: "Reserved",
    health: "excellent",
    description: "Powerful Golden Boy with exceptional strength and fighting instinct.",
    images: [],
    dateAdded: "2024-01-25",
    location: "South Farm",
    bloodline: "Golden Cross",
    owner: "John Doe"
  },

  // Sweater Roosters
  {
    breed: "Sweater",
    age: "26 months",
    weight: "2.6 kg",
    price: "20000",
    status: "Available", 
    health: "excellent",
    description: "Premium Sweater rooster with championship bloodline. Top-tier fighter.",
    images: [],
    dateAdded: "2024-01-05",
    location: "Main Farm",
    bloodline: "Sweater Hatch Cross",
  }
];

// Generate unique ID with format: BREED-FIRST-3-LETTERS-YEAR-RANDOM
function generateRoosterId(breed: string, index: number): string {
  const breedCode = breed.toUpperCase().substring(0, 3);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetters = Array.from({ length: 3 }, () => 
    letters.charAt(Math.floor(Math.random() * letters.length))
  ).join('');
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${breedCode}-${year}${random}`;
}

async function clearExistingData() {
  console.log("🗑️  Clearing existing rooster data...");
  
  try {
    // Delete all existing roosters
    const roostersSnapshot = await adminDb.collection(ROOSTERS_COLLECTION).get();
    const deletePromises = roostersSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${roostersSnapshot.size} roosters`);

    // Delete all existing breeds
    const breedsSnapshot = await adminDb.collection(BREEDS_COLLECTION).get();
    const breedDeletePromises = breedsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(breedDeletePromises);
    console.log(`✅ Deleted ${breedsSnapshot.size} breeds`);
    
    return {
      roostersDeleted: roostersSnapshot.size,
      breedsDeleted: breedsSnapshot.size
    };
    
  } catch (error) {
    console.error("❌ Error clearing existing data:", error);
    throw error;
  }
}

async function seedBreeds() {
  console.log("🌱 Seeding breeds...");
  
  try {
    const batch = adminDb.batch();
    
    sampleBreeds.forEach((breed) => {
      const docRef = adminDb.collection(BREEDS_COLLECTION).doc();
      const breedData = {
        ...breed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      batch.set(docRef, breedData);
    });

    await batch.commit();
    console.log(`✅ Seeded ${sampleBreeds.length} breeds`);
    
    return sampleBreeds.length;
    
  } catch (error) {
    console.error("❌ Error seeding breeds:", error);
    throw error;
  }
}

async function seedRoosters() {
  console.log("🐓 Seeding roosters...");
  
  try {
    const batch = adminDb.batch();
    const generatedIds: string[] = [];
    
    sampleRoosters.forEach((rooster, index) => {
      const docRef = adminDb.collection(ROOSTERS_COLLECTION).doc();
      const roosterId = generateRoosterId(rooster.breed, index);
      generatedIds.push(roosterId);
      
      const roosterWithId = {
        ...rooster,
        id: roosterId
      };
      batch.set(docRef, roosterWithId);
    });

    await batch.commit();
    console.log(`✅ Seeded ${sampleRoosters.length} roosters`);
    
    return {
      roostersSeeded: sampleRoosters.length,
      generatedIds
    };
    
  } catch (error) {
    console.error("❌ Error seeding roosters:", error);
    throw error;
  }
}

async function verifySeeding() {
  console.log("🔍 Verifying seeded data...");
  
  try {
    const roostersSnapshot = await adminDb.collection(ROOSTERS_COLLECTION).get();
    const breedsSnapshot = await adminDb.collection(BREEDS_COLLECTION).get();
    
    // Show breed distribution
    const breedCounts: Record<string, number> = {};
    const roosterData: any[] = [];
    
    roostersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const breed = data.breed;
      breedCounts[breed] = (breedCounts[breed] || 0) + 1;
      roosterData.push({
        id: data.id,
        breed: data.breed,
        status: data.status,
        health: data.health
      });
    });
    
    console.log(`📊 Database now contains:`);
    console.log(`   - ${roostersSnapshot.size} roosters`);
    console.log(`   - ${breedsSnapshot.size} breeds`);
    
    console.log(`📈 Rooster distribution by breed:`);
    Object.entries(breedCounts).forEach(([breed, count]) => {
      console.log(`   - ${breed}: ${count} roosters`);
    });

    console.log(`🏷️ Generated rooster IDs:`);
    roostersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.id}`);
    });
    
    return {
      totalRoosters: roostersSnapshot.size,
      totalBreeds: breedsSnapshot.size,
      breedDistribution: breedCounts,
      roosters: roosterData
    };
    
  } catch (error) {
    console.error("❌ Error verifying seeding:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const sessionUser = await getSessionUser();
    
    if (!sessionUser) {
      return jsonError("UNAUTHENTICATED", "No active session.", 401);
    }

    if (!hasRequiredRole(sessionUser.roles, "admin")) {
      return jsonError("FORBIDDEN", "Only admins can seed the database.", 403);
    }

    console.log("🚀 Starting rooster database seeding...\n");
    
    // Clear existing data
    const clearedData = await clearExistingData();
    console.log("");
    
    // Seed breeds
    const breedsSeeded = await seedBreeds();
    console.log("");
    
    // Seed roosters
    const roostersSeeded = await seedRoosters();
    console.log("");
    
    // Verify seeding
    const verification = await verifySeeding();
    console.log("");
    
    console.log("🎉 Seeding completed successfully!");
    
    return jsonSuccess({
      message: "Database seeded successfully",
      cleared: clearedData,
      breedsSeeded,
      roostersSeeded: roostersSeeded.roostersSeeded,
      verification
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("\n💥 Seeding failed:", error);
    return jsonError("SEEDING_FAILED", "Failed to seed the database.", 500);
  }
}

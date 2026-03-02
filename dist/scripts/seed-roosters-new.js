"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearExistingData = clearExistingData;
exports.seedBreeds = seedBreeds;
exports.seedRoosters = seedRoosters;
exports.main = main;
const firebase_1 = require("../lib/firebase");
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
        arrivalDate: "2024-01-15",
        dateAdded: "2024-01-15",
        location: "Main Farm",
        bloodline: "Lemon Hatch Cross",
        fightRecord: {
            wins: 3,
            losses: 0,
            draws: 0
        }
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
        arrivalDate: "2024-02-20",
        dateAdded: "2024-02-20",
        location: "North Farm",
        bloodline: "Pure Lemon",
        fightRecord: {
            wins: 1,
            losses: 0,
            draws: 0
        }
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
        arrivalDate: "2023-12-10",
        dateAdded: "2023-12-10",
        location: "Main Farm",
        bloodline: "Golden Boy Line",
        fightRecord: {
            wins: 5,
            losses: 1,
            draws: 0
        }
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
        arrivalDate: "2024-01-25",
        dateAdded: "2024-01-25",
        location: "South Farm",
        bloodline: "Golden Cross",
        fightRecord: {
            wins: 2,
            losses: 0,
            draws: 1
        },
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
        arrivalDate: "2024-01-05",
        dateAdded: "2024-01-05",
        location: "Main Farm",
        bloodline: "Sweater Hatch Cross",
        fightRecord: {
            wins: 4,
            losses: 0,
            draws: 0
        }
    }
];
// Generate unique ID with format: BREED-FIRST-3-LETTERS-YEAR-RANDOM
function generateRoosterId(breed, index) {
    const breedCode = breed.toUpperCase().substring(0, 3);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${breedCode}-${year}${random}`;
}
async function clearExistingData() {
    console.log("🗑️  Clearing existing rooster data...");
    try {
        // Delete all existing roosters
        const roostersSnapshot = await firebase_1.adminDb.collection(ROOSTERS_COLLECTION).get();
        const deletePromises = roostersSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${roostersSnapshot.size} roosters`);
        // Delete all existing breeds
        const breedsSnapshot = await firebase_1.adminDb.collection(BREEDS_COLLECTION).get();
        const breedDeletePromises = breedsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(breedDeletePromises);
        console.log(`✅ Deleted ${breedsSnapshot.size} breeds`);
    }
    catch (error) {
        console.error("❌ Error clearing existing data:", error);
        throw error;
    }
}
async function seedBreeds() {
    console.log("🌱 Seeding breeds...");
    try {
        const batch = firebase_1.adminDb.batch();
        sampleBreeds.forEach((breed) => {
            const docRef = firebase_1.adminDb.collection(BREEDS_COLLECTION).doc();
            const breedData = {
                ...breed,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            batch.set(docRef, breedData);
        });
        await batch.commit();
        console.log(`✅ Seeded ${sampleBreeds.length} breeds`);
    }
    catch (error) {
        console.error("❌ Error seeding breeds:", error);
        throw error;
    }
}
async function seedRoosters() {
    console.log("🐓 Seeding roosters...");
    try {
        const batch = firebase_1.adminDb.batch();
        sampleRoosters.forEach((rooster, index) => {
            const docRef = firebase_1.adminDb.collection(ROOSTERS_COLLECTION).doc();
            const roosterWithId = {
                ...rooster,
                id: generateRoosterId(rooster.breed, index)
            };
            batch.set(docRef, roosterWithId);
        });
        await batch.commit();
        console.log(`✅ Seeded ${sampleRoosters.length} roosters`);
    }
    catch (error) {
        console.error("❌ Error seeding roosters:", error);
        throw error;
    }
}
async function verifySeeding() {
    console.log("🔍 Verifying seeded data...");
    try {
        const roostersSnapshot = await firebase_1.adminDb.collection(ROOSTERS_COLLECTION).get();
        const breedsSnapshot = await firebase_1.adminDb.collection(BREEDS_COLLECTION).get();
        console.log(`📊 Database now contains:`);
        console.log(`   - ${roostersSnapshot.size} roosters`);
        console.log(`   - ${breedsSnapshot.size} breeds`);
        // Show breed distribution
        const breedCounts = {};
        roostersSnapshot.docs.forEach(doc => {
            const breed = doc.data().breed;
            breedCounts[breed] = (breedCounts[breed] || 0) + 1;
        });
        console.log(`📈 Rooster distribution by breed:`);
        Object.entries(breedCounts).forEach(([breed, count]) => {
            console.log(`   - ${breed}: ${count} roosters`);
        });
        // Show generated IDs
        console.log(`🏷️ Generated rooster IDs:`);
        roostersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`   - ${data.id}`);
        });
    }
    catch (error) {
        console.error("❌ Error verifying seeding:", error);
        throw error;
    }
}
async function main() {
    console.log("🚀 Starting rooster database seeding...\n");
    try {
        await clearExistingData();
        console.log("");
        await seedBreeds();
        console.log("");
        await seedRoosters();
        console.log("");
        await verifySeeding();
        console.log("");
        console.log("🎉 Seeding completed successfully!");
    }
    catch (error) {
        console.error("\n💥 Seeding failed:", error);
        process.exit(1);
    }
}
// Run the seeding script
main();

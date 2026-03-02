/**
 * Seed script to add sales transactions
 * Run with: npx tsx scripts/seed-sales.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load env before importing firebase
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SALES_COLLECTION = "sales";

const breeds = [
  "Kelso",
  "Hatch",
  "Roundhead",
  "Sweater",
  "Albany",
  "Asil",
  "Lemon",
  "Grey",
  "Claret",
  "Butcher",
];

const customerNames = [
  "Juan Dela Cruz",
  "Pedro Santos",
  "Maria Garcia",
  "Jose Reyes",
  "Antonio Ramos",
  "Carlos Mendoza",
  "Roberto Cruz",
  "Miguel Torres",
  "Fernando Gonzales",
  "Ricardo Bautista",
  "Eduardo Villanueva",
  "Andres Santiago",
  "Ramon Aquino",
  "Luis Pascual",
  "Manuel Castillo",
];

const agentNames = [
  "Agent Marco",
  "Agent Luis",
  "Agent Rico",
  "Agent Danny",
  "Agent Jun",
];

const paymentMethods: Array<"cash" | "gcash" | "bank_transfer" | "paypal"> = [
  "cash",
  "gcash",
  "bank_transfer",
  "paypal",
];

const notes = [
  "Champion bloodline",
  "Excellent fighting stance",
  "High-quality feathers",
  "Strong build",
  "Fast and agile",
  "Premium grade",
  "Good temperament",
  "Well-trained",
  "From winning lineage",
  "Healthy and active",
  "",
  "",
  "",
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhoneNumber(): string {
  const prefix = ["0917", "0918", "0919", "0920", "0921", "0927", "0928", "0929", "0939", "0949"];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return `${randomElement(prefix)}-${number.slice(0, 3)}-${number.slice(3)}`;
}

function randomPrice(): number {
  const basePrices = [5000, 7500, 10000, 12500, 15000, 17500, 20000, 25000, 30000, 35000, 40000, 50000];
  return randomElement(basePrices);
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split("T")[0];
}

function formatSalesTransactionId(documentId: string, date: string): string {
  const idPart = documentId.slice(0, 4).toUpperCase();
  const [, month, day] = date.split("-");
  return `#${idPart}-${month}${day}`;
}

async function seedSales() {
  const { adminDb } = await import("../lib/firebase");

  console.log("Starting sales seeding...\n");

  try {
    const salesRef = adminDb.collection(SALES_COLLECTION);

    // Check if sales already exist
    const existingSnapshot = await salesRef.limit(1).get();
    if (!existingSnapshot.empty) {
      console.log("Sales transactions already exist.");
      console.log("Do you want to add more? The script will add 50 new transactions.\n");
    }

    const transactions = [];
    const numTransactions = 50;

    console.log(`Generating ${numTransactions} sales transactions...\n`);

    for (let i = 0; i < numTransactions; i++) {
      const docRef = salesRef.doc();
      const date = randomDate(90); // Last 90 days
      const amount = randomPrice();
      const hasAgent = Math.random() > 0.6;

      const transaction = {
        transactionId: formatSalesTransactionId(docRef.id, date),
        date,
        roosterId: `RST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        breed: randomElement(breeds),
        customerName: randomElement(customerNames),
        customerContact: randomPhoneNumber(),
        amount,
        paymentMethod: randomElement(paymentMethods),
        notes: randomElement(notes) || undefined,
        commission: hasAgent ? Math.round(amount * 0.1) : undefined,
        agentName: hasAgent ? randomElement(agentNames) : undefined,
      };

      // Remove undefined values
      const cleanTransaction = Object.fromEntries(
        Object.entries(transaction).filter(([, v]) => v !== undefined)
      );

      transactions.push({ docRef, data: cleanTransaction });
    }

    // Sort by date for display
    transactions.sort((a, b) => b.data.date.localeCompare(a.data.date));

    // Batch write
    const batchSize = 500;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = adminDb.batch();
      const chunk = transactions.slice(i, i + batchSize);
      
      for (const { docRef, data } of chunk) {
        batch.set(docRef, data);
      }
      
      await batch.commit();
    }

    // Display summary
    console.log("Sales transactions created:\n");
    console.log("-".repeat(60));
    
    const byBreed: Record<string, number> = {};
    const byPayment: Record<string, number> = {};
    let totalRevenue = 0;
    let totalCommission = 0;

    for (const { data } of transactions) {
      byBreed[data.breed] = (byBreed[data.breed] || 0) + 1;
      byPayment[data.paymentMethod] = (byPayment[data.paymentMethod] || 0) + 1;
      totalRevenue += data.amount;
      if (data.commission) totalCommission += data.commission;
    }

    console.log("\nBy Breed:");
    Object.entries(byBreed)
      .sort(([, a], [, b]) => b - a)
      .forEach(([breed, count]) => {
        console.log(`  ${breed}: ${count} sales`);
      });

    console.log("\nBy Payment Method:");
    Object.entries(byPayment).forEach(([method, count]) => {
      console.log(`  ${method}: ${count} transactions`);
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Total Transactions: ${transactions.length}`);
    console.log(`Total Revenue: ₱${totalRevenue.toLocaleString()}`);
    console.log(`Total Commissions: ₱${totalCommission.toLocaleString()}`);
    console.log(`Average Sale: ₱${Math.round(totalRevenue / transactions.length).toLocaleString()}`);

  } catch (error) {
    console.error("Error seeding sales:", error);
    throw error;
  }
}

seedSales()
  .then(() => {
    console.log("\nSeeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  });

/**
 * Seed script to add audit log entries for demo purposes
 * Run with: npx tsx scripts/seed-audit.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const AUDIT_COLLECTION = "auditLogs";

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "login"
  | "logout"
  | "restock"
  | "consume"
  | "export"
  | "settings_change";

type AuditEntity =
  | "inventory"
  | "sales"
  | "rooster"
  | "user"
  | "supplier"
  | "location"
  | "settings"
  | "system";

type AuditSeverity = "info" | "warning" | "critical";

const users = [
  { uid: "user1", email: "admin@tripleafarm.com", name: "Admin User", role: "admin" },
  { uid: "user2", email: "staff1@tripleafarm.com", name: "Juan Staff", role: "staff" },
  { uid: "user3", email: "staff2@tripleafarm.com", name: "Maria Staff", role: "staff" },
  { uid: "user4", email: "manager@tripleafarm.com", name: "Pedro Manager", role: "admin" },
];

const inventoryItems = [
  "Premium Gamefowl Pellets",
  "Vitamin B Complex",
  "Electrolyte Powder",
  "Antibacterial Solution",
  "Deworming Tablets",
  "Wound Spray",
  "Disinfectant Concentrate",
  "Leg Bands (Assorted)",
  "Feeding Troughs",
  "Water Dispensers",
];

const roosterNames = [
  "Thunder",
  "Lightning",
  "Storm",
  "Blaze",
  "Shadow",
  "Phantom",
  "Warrior",
  "Champion",
  "Victory",
  "Glory",
];

const breeds = ["Kelso", "Hatch", "Roundhead", "Sweater", "Albany", "Asil", "Lemon", "Grey"];

const supplierNames = ["AgriFeeds Corp", "VetMed Supply", "Farm Supply Co", "CleanPro Solutions"];

const locations = ["Paltok Angat TRIPLE A GF", "Plaridel TRIPLE A GF", "Sta Maria Triple A Farm"];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function getSeverity(action: AuditAction): AuditSeverity {
  switch (action) {
    case "delete":
      return "critical";
    case "update":
    case "settings_change":
      return "warning";
    default:
      return "info";
  }
}

interface AuditEntry {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  description: string;
  details?: Record<string, unknown>;
  severity: AuditSeverity;
  timestamp: string;
}

function generateAuditEntries(count: number): AuditEntry[] {
  const entries: AuditEntry[] = [];

  for (let i = 0; i < count; i++) {
    const user = randomElement(users);
    const date = randomDate(30);

    const scenarios = [
      () => {
        const item = randomElement(inventoryItems);
        return {
          action: "create" as AuditAction,
          entity: "inventory" as AuditEntity,
          entityId: `INV-${Math.random().toString(36).substring(2, 10)}`,
          entityName: item,
          description: `Created inventory item: ${item}`,
        };
      },
      () => {
        const item = randomElement(inventoryItems);
        const oldStock = Math.floor(Math.random() * 50) + 10;
        const newStock = oldStock + Math.floor(Math.random() * 30) + 5;
        return {
          action: "restock" as AuditAction,
          entity: "inventory" as AuditEntity,
          entityId: `INV-${Math.random().toString(36).substring(2, 10)}`,
          entityName: item,
          description: `Restocked inventory: ${item}`,
          details: {
            changes: [
              { field: "currentStock", oldValue: oldStock, newValue: newStock },
            ],
            metadata: { reason: "Purchase Order", amount: newStock - oldStock },
          },
        };
      },
      () => {
        const item = randomElement(inventoryItems);
        const oldStock = Math.floor(Math.random() * 50) + 20;
        const consumed = Math.floor(Math.random() * 10) + 1;
        return {
          action: "consume" as AuditAction,
          entity: "inventory" as AuditEntity,
          entityId: `INV-${Math.random().toString(36).substring(2, 10)}`,
          entityName: item,
          description: `Consumed inventory: ${item}`,
          details: {
            changes: [
              { field: "currentStock", oldValue: oldStock, newValue: oldStock - consumed },
            ],
            metadata: { reason: "Used in Operations", amount: consumed },
          },
        };
      },
      () => {
        const rooster = randomElement(roosterNames);
        const breed = randomElement(breeds);
        return {
          action: "create" as AuditAction,
          entity: "rooster" as AuditEntity,
          entityId: `RST-${Math.random().toString(36).substring(2, 10)}`,
          entityName: `${rooster} (${breed})`,
          description: `Added new rooster: ${rooster}`,
          details: {
            metadata: { breed, location: randomElement(locations) },
          },
        };
      },
      () => {
        const rooster = randomElement(roosterNames);
        return {
          action: "update" as AuditAction,
          entity: "rooster" as AuditEntity,
          entityId: `RST-${Math.random().toString(36).substring(2, 10)}`,
          entityName: rooster,
          description: `Updated rooster: ${rooster}`,
          details: {
            changes: [
              { field: "status", oldValue: "Available", newValue: "Sold" },
            ],
          },
        };
      },
      () => {
        const rooster = randomElement(roosterNames);
        const amount = (Math.floor(Math.random() * 40) + 10) * 1000;
        return {
          action: "create" as AuditAction,
          entity: "sales" as AuditEntity,
          entityId: `SALE-${Math.random().toString(36).substring(2, 10)}`,
          entityName: rooster,
          description: `Created sale transaction for: ${rooster}`,
          details: {
            metadata: { amount, paymentMethod: randomElement(["cash", "gcash", "bank_transfer"]) },
          },
        };
      },
      () => {
        return {
          action: "login" as AuditAction,
          entity: "user" as AuditEntity,
          entityId: user.uid,
          entityName: user.name,
          description: `User logged in`,
        };
      },
      () => {
        return {
          action: "logout" as AuditAction,
          entity: "user" as AuditEntity,
          entityId: user.uid,
          entityName: user.name,
          description: `User logged out`,
        };
      },
      () => {
        const supplier = randomElement(supplierNames);
        return {
          action: "update" as AuditAction,
          entity: "supplier" as AuditEntity,
          entityId: `SUP-${Math.random().toString(36).substring(2, 10)}`,
          entityName: supplier,
          description: `Updated supplier: ${supplier}`,
          details: {
            changes: [
              { field: "phone", oldValue: "0917-123-4567", newValue: "0918-765-4321" },
            ],
          },
        };
      },
      () => {
        return {
          action: "export" as AuditAction,
          entity: "inventory" as AuditEntity,
          description: `Exported inventory data`,
          details: {
            metadata: { format: "xlsx", records: Math.floor(Math.random() * 100) + 20 },
          },
        };
      },
      () => {
        const location = randomElement(locations);
        return {
          action: "create" as AuditAction,
          entity: "location" as AuditEntity,
          entityId: `LOC-${Math.random().toString(36).substring(2, 10)}`,
          entityName: location,
          description: `Created farm location: ${location}`,
        };
      },
      () => {
        const item = randomElement(inventoryItems);
        return {
          action: "delete" as AuditAction,
          entity: "inventory" as AuditEntity,
          entityId: `INV-${Math.random().toString(36).substring(2, 10)}`,
          entityName: item,
          description: `Deleted inventory item: ${item}`,
        };
      },
    ];

    const scenario = randomElement(scenarios)();

    entries.push({
      ...scenario,
      userId: user.uid,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      severity: getSeverity(scenario.action),
      timestamp: date.toISOString(),
    });
  }

  return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

async function seedAuditLogs() {
  const { adminDb } = await import("../lib/firebase");

  console.log("Starting audit log seeding...\n");

  try {
    const auditRef = adminDb.collection(AUDIT_COLLECTION);

    const entries = generateAuditEntries(100);

    console.log(`Generating ${entries.length} audit log entries...\n`);

    const batchSize = 500;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = adminDb.batch();
      const chunk = entries.slice(i, i + batchSize);

      for (const entry of chunk) {
        const docRef = auditRef.doc();
        const cleanEntry = Object.fromEntries(
          Object.entries(entry).filter(([, v]) => v !== undefined)
        );
        batch.set(docRef, cleanEntry);
      }

      await batch.commit();
    }

    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const entry of entries) {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
      byEntity[entry.entity] = (byEntity[entry.entity] || 0) + 1;
      bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
    }

    console.log("By Action:");
    Object.entries(byAction)
      .sort(([, a], [, b]) => b - a)
      .forEach(([action, count]) => {
        console.log(`  ${action}: ${count}`);
      });

    console.log("\nBy Entity:");
    Object.entries(byEntity)
      .sort(([, a], [, b]) => b - a)
      .forEach(([entity, count]) => {
        console.log(`  ${entity}: ${count}`);
      });

    console.log("\nBy Severity:");
    Object.entries(bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity}: ${count}`);
    });

    console.log(`\n${"=".repeat(50)}`);
    console.log(`Successfully seeded ${entries.length} audit log entries!`);
  } catch (error) {
    console.error("Error seeding audit logs:", error);
    throw error;
  }
}

seedAuditLogs()
  .then(() => {
    console.log("\nSeeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSeeding failed:", error);
    process.exit(1);
  });

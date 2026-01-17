import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole, type AppRole } from "@/lib/roles";
import {
  calculateInventoryStatus,
  formatInventoryDisplayId,
  type InventoryItem,
  type InventoryStats,
} from "@/lib/inventory-types";

type InventoryAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "restock"
  | "readStats";

const INVENTORY_COLLECTION = "inventoryItems";
const INVENTORY_META_COLLECTION = "inventoryMeta";
const INVENTORY_STATS_DOC_ID = "stats";

const assertInventoryPermission = (
  user: SessionUser | null,
  action: InventoryAction
) => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const roles = user.roles;

  const canRead = hasRequiredRole(roles, ["admin", "staff"]);
  const canWriteAdminOnly = hasRequiredRole(roles, "admin");
  const canRestock = hasRequiredRole(roles, ["admin", "staff"]);

  switch (action) {
    case "read":
    case "readStats":
      if (!canRead) {
        throw new Error("FORBIDDEN");
      }
      return;
    case "create":
    case "update":
    case "delete":
      if (!canWriteAdminOnly) {
        throw new Error("FORBIDDEN");
      }
      return;
    case "restock":
      if (!canRestock) {
        throw new Error("FORBIDDEN");
      }
      return;
    default:
      throw new Error("FORBIDDEN");
  }
};

const inventoryCollectionRef = () => adminDb.collection(INVENTORY_COLLECTION);

const inventoryStatsDocRef = () =>
  adminDb.collection(INVENTORY_META_COLLECTION).doc(INVENTORY_STATS_DOC_ID);

export const getInventoryItems = async (
  user: SessionUser | null
): Promise<InventoryItem[]> => {
  assertInventoryPermission(user, "read");

  const snapshot = await inventoryCollectionRef().get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<InventoryItem, "id">;

    return {
      id: doc.id,
      ...data,
    };
  });
};

export const getInventoryItemById = async (
  user: SessionUser | null,
  id: string
): Promise<InventoryItem | null> => {
  assertInventoryPermission(user, "read");

  const doc = await inventoryCollectionRef().doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Omit<InventoryItem, "id">;

  return {
    id: doc.id,
    ...data,
  };
};

export interface CreateInventoryItemInput {
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string;
  price?: number;
  location?: string;
  description?: string;
  lastRestocked?: string;
  expiryDate?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  supplier?: string;
  price?: number | null;
  location?: string | null;
  description?: string | null;
  lastRestocked?: string;
  expiryDate?: string | null;
}

const buildInventoryDocFromCreate = (
  input: CreateInventoryItemInput,
  createdAt: string
): Omit<InventoryItem, "id"> => {
  const currentStock = input.currentStock;
  const minStock = input.minStock;

  const status = calculateInventoryStatus(currentStock, minStock);

  return {
    createdAt,
    name: input.name,
    category: input.category,
    currentStock,
    minStock,
    unit: input.unit,
    supplier: input.supplier,
    price: input.price,
    location: input.location,
    description: input.description,
    lastRestocked: input.lastRestocked ?? createdAt,
    expiryDate: input.expiryDate,
    status,
  };
};

const applyUpdateToInventoryItem = (
  existing: InventoryItem,
  input: UpdateInventoryItemInput
): Omit<InventoryItem, "id"> => {
  const updatedCurrentStock =
    typeof input.currentStock === "number"
      ? input.currentStock
      : existing.currentStock;
  const updatedMinStock =
    typeof input.minStock === "number" ? input.minStock : existing.minStock;

  const status = calculateInventoryStatus(updatedCurrentStock, updatedMinStock);

  return {
    createdAt: existing.createdAt,
    displayId: existing.displayId,
    name: input.name ?? existing.name,
    category: input.category ?? existing.category,
    currentStock: updatedCurrentStock,
    minStock: updatedMinStock,
    unit: input.unit ?? existing.unit,
    supplier: input.supplier ?? existing.supplier,
    price: input.price === null ? undefined : input.price ?? existing.price,
    location:
      input.location === null ? undefined : input.location ?? existing.location,
    description:
      input.description === null
        ? undefined
        : input.description ?? existing.description,
    lastRestocked: input.lastRestocked ?? existing.lastRestocked,
    expiryDate:
      input.expiryDate === null
        ? undefined
        : input.expiryDate ?? existing.expiryDate,
    status,
  };
};

const recalculateInventoryStats = async (): Promise<InventoryStats> => {
  const snapshot = await inventoryCollectionRef().get();

  let totalItems = 0;
  let lowStockAlerts = 0;
  let criticalItems = 0;
  let monthlySpend = 0;

  snapshot.forEach((doc) => {
    totalItems += 1;
    const data = doc.data() as Omit<InventoryItem, "id">;

    if (data.status === "low") {
      lowStockAlerts += 1;
    }

    if (data.status === "critical") {
      criticalItems += 1;
    }

    if (typeof data.price === "number") {
      monthlySpend += data.price * data.currentStock;
    }
  });

  return {
    totalItems,
    lowStockAlerts,
    criticalItems,
    monthlySpend,
  };
};

export const createInventoryItem = async (
  user: SessionUser | null,
  input: CreateInventoryItemInput
): Promise<InventoryItem> => {
  assertInventoryPermission(user, "create");

  const docRef = inventoryCollectionRef().doc();

  const createdAt = new Date().toISOString().split("T")[0];

  const baseDocData = buildInventoryDocFromCreate(input, createdAt);

  const displayId = formatInventoryDisplayId({
    id: docRef.id,
    createdAt,
    lastRestocked: baseDocData.lastRestocked,
  });

  const docData: Omit<InventoryItem, "id"> = {
    ...baseDocData,
    displayId,
  };

  await adminDb.runTransaction(async (tx) => {
    tx.set(docRef, docData);

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });
  });

  return {
    id: docRef.id,
    ...docData,
  };
};

export const updateInventoryItem = async (
  user: SessionUser | null,
  id: string,
  input: UpdateInventoryItemInput
): Promise<InventoryItem> => {
  assertInventoryPermission(user, "update");

  const docRef = inventoryCollectionRef().doc(id);

  let updated: InventoryItem | null = null;

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const existing = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<InventoryItem, "id">),
    } as InventoryItem;

    const updatedDoc = applyUpdateToInventoryItem(existing, input);

    tx.set(docRef, updatedDoc, { merge: true });

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });

    updated = {
      id: snapshot.id,
      ...updatedDoc,
    };
  });

  if (!updated) {
    throw new Error("UNKNOWN_ERROR");
  }

  return updated;
};

export const deleteInventoryItem = async (
  user: SessionUser | null,
  id: string
): Promise<void> => {
  assertInventoryPermission(user, "delete");

  const docRef = inventoryCollectionRef().doc(id);

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    tx.delete(docRef);

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });
  });
};

export const restockInventoryItem = async (
  user: SessionUser | null,
  id: string,
  amount: number
): Promise<InventoryItem> => {
  assertInventoryPermission(user, "restock");

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_RESTOCK_AMOUNT");
  }

  const docRef = inventoryCollectionRef().doc(id);
  const nowIso = new Date().toISOString().split("T")[0];

  let updated: InventoryItem | null = null;

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const existing = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<InventoryItem, "id">),
    } as InventoryItem;

    const newCurrentStock = existing.currentStock + amount;

    const updatedDoc = applyUpdateToInventoryItem(existing, {
      currentStock: newCurrentStock,
      lastRestocked: nowIso,
    });

    tx.set(docRef, updatedDoc, { merge: true });

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });

    updated = {
      id: snapshot.id,
      ...updatedDoc,
    };
  });

  if (!updated) {
    throw new Error("UNKNOWN_ERROR");
  }

  return updated;
};

export const getInventoryStats = async (
  user: SessionUser | null
): Promise<InventoryStats> => {
  assertInventoryPermission(user, "readStats");

  const docRef = inventoryStatsDocRef();

  const stats = await recalculateInventoryStats();

  await docRef.set(stats, { merge: true });

  return stats;
};

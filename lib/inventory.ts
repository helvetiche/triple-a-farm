import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole, type AppRole } from "@/lib/roles";
import {
  calculateInventoryStatus,
  formatInventoryDisplayId,
  type InventoryItem,
  type InventoryStats,
  type InventoryActivity,
  type InventoryActivityType,
} from "@/lib/inventory-types";
import { logAuditEvent } from "@/lib/audit";

type InventoryAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "restock"
  | "consume"
  | "readStats"
  | "readActivity";

const INVENTORY_COLLECTION = "inventoryItems";
const INVENTORY_META_COLLECTION = "inventoryMeta";
const INVENTORY_ACTIVITY_COLLECTION = "inventoryActivity";
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
  const canConsume = hasRequiredRole(roles, ["admin", "staff"]);

  switch (action) {
    case "read":
    case "readStats":
    case "readActivity":
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
    case "consume":
      if (!canConsume) {
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

const inventoryActivityCollectionRef = () =>
  adminDb.collection(INVENTORY_ACTIVITY_COLLECTION);

export interface GetInventoryItemsOptions {
  locationId?: string;
}

export const getInventoryItems = async (
  user: SessionUser | null,
  options?: GetInventoryItemsOptions
): Promise<InventoryItem[]> => {
  assertInventoryPermission(user, "read");

  let query: FirebaseFirestore.Query = inventoryCollectionRef();

  if (options?.locationId) {
    query = query.where("locationId", "==", options.locationId);
  }

  const snapshot = await query.get();

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
  description?: string;
  lastRestocked?: string;
  expiryDate?: string;
  locationId: string;
  locationName: string;
  locationAddress?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  category?: string;
  currentStock?: number;
  minStock?: number;
  unit?: string;
  supplier?: string;
  price?: number | null;
  description?: string | null;
  lastRestocked?: string;
  expiryDate?: string | null;
  locationId?: string;
  locationName?: string;
  locationAddress?: string | null;
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
    description: input.description,
    lastRestocked: input.lastRestocked ?? createdAt,
    expiryDate: input.expiryDate,
    status,
    locationId: input.locationId,
    locationName: input.locationName,
    locationAddress: input.locationAddress,
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

  const result: any = {
    name: input.name ?? existing.name,
    category: input.category ?? existing.category,
    currentStock: updatedCurrentStock,
    minStock: updatedMinStock,
    unit: input.unit ?? existing.unit,
    supplier: input.supplier ?? existing.supplier,
    lastRestocked: input.lastRestocked ?? existing.lastRestocked,
    status,
    locationId: input.locationId ?? existing.locationId,
    locationName: input.locationName ?? existing.locationName,
  };

  // Only include optional fields if they have values
  if (existing.createdAt) {
    result.createdAt = existing.createdAt;
  }
  
  if (existing.displayId) {
    result.displayId = existing.displayId;
  }

  const price = input.price === null ? undefined : input.price ?? existing.price;
  if (price !== undefined) {
    result.price = price;
  }

  const description = input.description === null ? undefined : input.description ?? existing.description;
  if (description !== undefined) {
    result.description = description;
  }

  const expiryDate = input.expiryDate === null ? undefined : input.expiryDate ?? existing.expiryDate;
  if (expiryDate !== undefined) {
    result.expiryDate = expiryDate;
  }

  const locationAddress = input.locationAddress === null ? undefined : input.locationAddress ?? existing.locationAddress;
  if (locationAddress !== undefined) {
    result.locationAddress = locationAddress;
  }

  return result as Omit<InventoryItem, "id">;
};

const recalculateInventoryStats = async (locationId?: string): Promise<InventoryStats> => {
  let query: FirebaseFirestore.Query = inventoryCollectionRef();

  if (locationId) {
    query = query.where("locationId", "==", locationId);
  }

  const snapshot = await query.get();

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

  const createdItem = {
    id: docRef.id,
    ...docData,
  };

  logAuditEvent(user, {
    action: "create",
    entity: "inventory",
    entityId: createdItem.id,
    entityName: createdItem.name,
    description: `Created inventory item: ${createdItem.name}`,
    details: {
      metadata: {
        category: createdItem.category,
        currentStock: createdItem.currentStock,
        unit: createdItem.unit,
        locationName: createdItem.locationName,
      },
    },
  });

  return createdItem;
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

  const updatedItem = updated as InventoryItem;

  logAuditEvent(user, {
    action: "update",
    entity: "inventory",
    entityId: updatedItem.id,
    entityName: updatedItem.name,
    description: `Updated inventory item: ${updatedItem.name}`,
    details: {
      changes: Object.entries(input)
        .filter(([, v]) => v !== undefined)
        .map(([field, newValue]) => ({
          field,
          oldValue: undefined,
          newValue,
        })),
    },
  });

  return updatedItem;
};

export const deleteInventoryItem = async (
  user: SessionUser | null,
  id: string
): Promise<void> => {
  assertInventoryPermission(user, "delete");

  const docRef = inventoryCollectionRef().doc(id);

  let deletedItemName = "";

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const data = snapshot.data() as Omit<InventoryItem, "id">;
    deletedItemName = data.name;

    tx.delete(docRef);

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });
  });

  logAuditEvent(user, {
    action: "delete",
    entity: "inventory",
    entityId: id,
    entityName: deletedItemName,
    description: `Deleted inventory item: ${deletedItemName}`,
    severity: "critical",
  });
};

export const restockInventoryItem = async (
  user: SessionUser | null,
  id: string,
  amount: number,
  reason: string
): Promise<InventoryItem> => {
  assertInventoryPermission(user, "restock");

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_RESTOCK_AMOUNT");
  }

  if (!reason || reason.trim() === "") {
    throw new Error("REASON_REQUIRED");
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

    // Log activity
    const activityRef = inventoryActivityCollectionRef().doc();
    const activity: Omit<InventoryActivity, "id"> = {
      itemId: id,
      itemName: existing.name,
      type: "restock",
      amount,
      unit: existing.unit,
      reason: reason.trim(),
      previousStock: existing.currentStock,
      newStock: newCurrentStock,
      performedBy: user?.email || "Unknown",
      performedAt: new Date().toISOString(),
    };
    tx.set(activityRef, activity);

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

  const restockedItem = updated as InventoryItem;

  logAuditEvent(user, {
    action: "restock",
    entity: "inventory",
    entityId: restockedItem.id,
    entityName: restockedItem.name,
    description: `Restocked inventory: ${restockedItem.name} (+${amount} ${restockedItem.unit})`,
    details: {
      changes: [
        {
          field: "currentStock",
          oldValue: restockedItem.currentStock - amount,
          newValue: restockedItem.currentStock,
        },
      ],
      metadata: { reason, amount },
    },
  });

  return restockedItem;
};

export const getInventoryStats = async (
  user: SessionUser | null,
  locationId?: string
): Promise<InventoryStats> => {
  assertInventoryPermission(user, "readStats");

  const stats = await recalculateInventoryStats(locationId);

  if (!locationId) {
    const docRef = inventoryStatsDocRef();
    await docRef.set(stats, { merge: true });
  }

  return stats;
};

export const consumeInventoryItem = async (
  user: SessionUser | null,
  id: string,
  amount: number,
  reason: string
): Promise<InventoryItem> => {
  assertInventoryPermission(user, "consume");

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_CONSUME_AMOUNT");
  }

  if (!reason || reason.trim() === "") {
    throw new Error("REASON_REQUIRED");
  }

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

    const newCurrentStock = Math.max(0, existing.currentStock - amount);

    const updatedDoc = applyUpdateToInventoryItem(existing, {
      currentStock: newCurrentStock,
    });

    tx.set(docRef, updatedDoc, { merge: true });

    // Log activity
    const activityRef = inventoryActivityCollectionRef().doc();
    const activity: Omit<InventoryActivity, "id"> = {
      itemId: id,
      itemName: existing.name,
      type: "consume",
      amount,
      unit: existing.unit,
      reason: reason.trim(),
      previousStock: existing.currentStock,
      newStock: newCurrentStock,
      performedBy: user?.email || "Unknown",
      performedAt: new Date().toISOString(),
    };
    tx.set(activityRef, activity);

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

  const consumedItem = updated as InventoryItem;

  logAuditEvent(user, {
    action: "consume",
    entity: "inventory",
    entityId: consumedItem.id,
    entityName: consumedItem.name,
    description: `Consumed inventory: ${consumedItem.name} (-${amount} ${consumedItem.unit})`,
    details: {
      changes: [
        {
          field: "currentStock",
          oldValue: consumedItem.currentStock + amount,
          newValue: consumedItem.currentStock,
        },
      ],
      metadata: { reason, amount },
    },
  });

  return consumedItem;
};

export const getInventoryActivity = async (
  user: SessionUser | null,
  itemId?: string,
  limit: number = 50
): Promise<InventoryActivity[]> => {
  assertInventoryPermission(user, "readActivity");

  let query = inventoryActivityCollectionRef()
    .orderBy("performedAt", "desc")
    .limit(limit);

  if (itemId) {
    query = query.where("itemId", "==", itemId) as any;
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<InventoryActivity, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });
};

import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import {
  calculateInventoryStatus,
  formatInventoryDisplayId,
  type InventoryItem,
  type InventoryStats,
  type InventoryActivity,
} from "@/lib/inventory-types";
import { logAuditEvent } from "@/lib/audit";
import { invalidatePattern } from "@/lib/redis";

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

// Helper to invalidate all inventory-related caches
const invalidateInventoryCaches = async (locationId?: string) => {
  try {
    // Invalidate all paginated inventory caches
    await invalidatePattern("inventory:paginated:*");
    
    // Invalidate inventory list caches
    if (locationId) {
      await invalidatePattern(`inventory:location:${locationId}`);
      await invalidatePattern(`inventory:stats:${locationId}`);
    } else {
      await invalidatePattern("inventory:all");
      await invalidatePattern("inventory:stats:*");
    }
    
    // Invalidate activity caches
    await invalidatePattern("inventory:activities:*");
  } catch (error) {
    console.error("Failed to invalidate inventory caches:", error);
  }
};

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

export interface GetInventoryItemsPaginatedOptions {
  locationId?: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: "critical" | "low" | "normal" | "good" | "perfect" | "all";
}

export interface PaginatedInventoryResult {
  items: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export const getInventoryItemsPaginated = async (
  user: SessionUser | null,
  options: GetInventoryItemsPaginatedOptions = {}
): Promise<PaginatedInventoryResult> => {
  assertInventoryPermission(user, "read");

  const {
    locationId,
    page = 1,
    limit = 10,
    search,
    category,
    status,
  } = options;

  // Build base query with filters
  let query: FirebaseFirestore.Query = inventoryCollectionRef();

  // Apply filters
  if (locationId) {
    query = query.where("locationId", "==", locationId);
  }

  if (category && category !== "all") {
    query = query.where("category", "==", category);
  }

  if (status && status !== "all") {
    query = query.where("status", "==", status);
  }

  // Order by name for consistent pagination
  query = query.orderBy("name", "asc");

  // If search is provided, we need to fetch all and filter in memory
  // (Firestore doesn't support full-text search natively)
  // For better performance, we use prefix matching on indexed fields
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    
    // Try prefix search on name field first (most common search)
    // Firestore supports >= and < for prefix matching
    const searchEnd = searchLower.slice(0, -1) + String.fromCharCode(searchLower.charCodeAt(searchLower.length - 1) + 1);
    
    // Use name prefix search if search looks like a name
    const searchQuery = query
      .where("nameLower", ">=", searchLower)
      .where("nameLower", "<", searchEnd)
      .limit(limit * 3); // Get more results for client-side filtering
    
    const snapshot = await searchQuery.get();
    
    // Additional client-side filtering for other fields
    const filteredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return (
        data.name?.toLowerCase().includes(searchLower) ||
        data.displayId?.toLowerCase().includes(searchLower) ||
        data.supplier?.toLowerCase().includes(searchLower) ||
        data.description?.toLowerCase().includes(searchLower) ||
        data.category?.toLowerCase().includes(searchLower)
      );
    });

    const filteredTotal = filteredDocs.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    const items: InventoryItem[] = paginatedDocs.map((doc) => {
      const data = doc.data() as Omit<InventoryItem, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });

    return {
      items,
      total: filteredTotal,
      page,
      limit,
      totalPages,
    };
  }

  // No search - use proper Firestore pagination with cursor-based approach
  // For better performance, we'll use a two-query approach:
  // 1. Get paginated results with limit
  // 2. Get count separately (can be cached or estimated)
  
  const offset = (page - 1) * limit;
  
  // Get paginated results efficiently
  const paginatedQuery = query.limit(limit).offset(offset);
  const snapshot = await paginatedQuery.get();

  const items: InventoryItem[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<InventoryItem, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });

  // For total count, we have a few options:
  // Option 1: Get count from a separate aggregation (most efficient for large datasets)
  // Option 2: Use count() query (Firestore supports this)
  // Option 3: Estimate based on results (fastest but less accurate)
  
  // Using count query for accuracy
  let total = 0;
  try {
    const countQuery = query.count();
    const countSnapshot = await countQuery.get();
    total = countSnapshot.data().count;
  } catch (error) {
    // Fallback: if count fails, estimate based on whether we got full page
    console.warn("Count query failed, using estimation:", error);
    total = items.length < limit ? (page - 1) * limit + items.length : page * limit + 1;
  }
  
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
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
  maxStock?: number;
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
  maxStock?: number | null;
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
  const maxStock = input.maxStock;

  const status = calculateInventoryStatus(currentStock, minStock, maxStock);

  return {
    createdAt,
    name: input.name,
    nameLower: input.name.toLowerCase(), // For search indexing
    category: input.category,
    currentStock,
    minStock,
    maxStock: input.maxStock,
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
  const updatedMaxStock =
    typeof input.maxStock === "number" ? input.maxStock : existing.maxStock;

  const status = calculateInventoryStatus(updatedCurrentStock, updatedMinStock, updatedMaxStock);

  const price =
    input.price === null ? undefined : (input.price ?? existing.price);
  const description =
    input.description === null
      ? undefined
      : (input.description ?? existing.description);
  const expiryDate =
    input.expiryDate === null
      ? undefined
      : (input.expiryDate ?? existing.expiryDate);
  const locationAddress =
    input.locationAddress === null
      ? undefined
      : (input.locationAddress ?? existing.locationAddress);
  const maxStock =
    input.maxStock === null ? undefined : (input.maxStock ?? existing.maxStock);

  const result: Omit<InventoryItem, "id"> = {
    name: input.name ?? existing.name,
    nameLower: (input.name ?? existing.name).toLowerCase(), // Update search index
    category: input.category ?? existing.category,
    currentStock: updatedCurrentStock,
    minStock: updatedMinStock,
    unit: input.unit ?? existing.unit,
    supplier: input.supplier ?? existing.supplier,
    lastRestocked: input.lastRestocked ?? existing.lastRestocked,
    status,
    locationId: input.locationId ?? existing.locationId,
    locationName: input.locationName ?? existing.locationName,
    ...(existing.createdAt && { createdAt: existing.createdAt }),
    ...(existing.displayId && { displayId: existing.displayId }),
    ...(price !== undefined && { price }),
    ...(description !== undefined && { description }),
    ...(expiryDate !== undefined && { expiryDate }),
    ...(locationAddress !== undefined && { locationAddress }),
    ...(maxStock !== undefined && { maxStock }),
  };

  return result;
};

const recalculateInventoryStats = async (
  locationId?: string
): Promise<InventoryStats> => {
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

  // Invalidate caches after successful creation
  await invalidateInventoryCaches(input.locationId);

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

  // Invalidate caches after successful update
  await invalidateInventoryCaches(updatedItem.locationId);

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
  let deletedLocationId = "";

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const data = snapshot.data() as Omit<InventoryItem, "id">;
    deletedItemName = data.name;
    deletedLocationId = data.locationId;

    tx.delete(docRef);

    const stats = await recalculateInventoryStats();
    tx.set(inventoryStatsDocRef(), stats, { merge: true });
  });

  // Invalidate caches after successful deletion
  await invalidateInventoryCaches(deletedLocationId);

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

    if (existing.maxStock && newCurrentStock > existing.maxStock) {
      throw new Error("EXCEEDS_MAX_STOCK");
    }

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

  // Invalidate caches after successful restock
  await invalidateInventoryCaches(restockedItem.locationId);

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

  // Invalidate caches after successful consume
  await invalidateInventoryCaches(consumedItem.locationId);

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

  let query: FirebaseFirestore.Query = inventoryActivityCollectionRef();

  if (itemId) {
    query = query.where("itemId", "==", itemId);
  }

  query = query.orderBy("performedAt", "desc").limit(limit);

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<InventoryActivity, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });
};

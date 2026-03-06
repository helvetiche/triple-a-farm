import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import type {
  SalesTransaction,
  SalesStats,
  RevenueTrend,
} from "@/app/admin/sales/types";
import { logAuditEvent } from "@/lib/audit";
import { invalidatePattern } from "@/lib/redis";

type SalesAction = "read" | "create" | "update" | "delete" | "readStats";

const SALES_COLLECTION = "sales";

// Helper to invalidate all sales-related caches
const invalidateSalesCaches = async () => {
  try {
    await invalidatePattern("sales:*");
  } catch (error) {
    console.error("Failed to invalidate sales caches:", error);
  }
};

const assertSalesPermission = (
  user: SessionUser | null,
  action: SalesAction
) => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const roles = user.roles;

  const canRead = hasRequiredRole(roles, ["admin", "staff"]);
  const canWrite = hasRequiredRole(roles, ["admin", "staff"]);

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
      if (!canWrite) {
        throw new Error("FORBIDDEN");
      }
      return;
    default:
      throw new Error("FORBIDDEN");
  }
};

const salesCollectionRef = () => adminDb.collection(SALES_COLLECTION);

export interface CreateSalesTransactionInput {
  roosterId: string;
  breed: string;
  customerName: string;
  customerContact: string;
  amount: number;
  paymentMethod: "cash" | "gcash" | "bank_transfer" | "paypal";
  notes?: string;
  commission?: number;
  agentName?: string;
}

export interface UpdateSalesTransactionInput {
  notes?: string;
}

export interface GetSalesTransactionsPaginatedOptions {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: string;
}

export interface PaginatedSalesResult {
  transactions: SalesTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getSalesTransactions = async (
  user: SessionUser | null
): Promise<SalesTransaction[]> => {
  assertSalesPermission(user, "read");

  const snapshot = await salesCollectionRef().orderBy("date", "desc").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<SalesTransaction, "id">;

    // Format transactionId if it doesn't exist
    const transactionId =
      data.transactionId || formatSalesTransactionId(doc.id, data.date);

    return {
      id: doc.id,
      ...data,
      transactionId,
    };
  });
};

export const getSalesTransactionsPaginated = async (
  user: SessionUser | null,
  options: GetSalesTransactionsPaginatedOptions = {}
): Promise<PaginatedSalesResult> => {
  assertSalesPermission(user, "read");

  const {
    page = 1,
    limit = 10,
    search,
    paymentMethod,
  } = options;

  // Build base query
  let query: FirebaseFirestore.Query = salesCollectionRef();

  // Apply filters
  if (paymentMethod && paymentMethod !== "all") {
    query = query.where("paymentMethod", "==", paymentMethod);
  }

  // Order by date for consistent pagination
  query = query.orderBy("date", "desc");

  // If search is provided, use prefix matching with limited fetch
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    
    // Fetch limited results for search
    const searchQuery = query.limit(limit * 3);
    const snapshot = await searchQuery.get();
    
    // Client-side filtering for search
    const filteredDocs = snapshot.docs.filter((doc) => {
      const data = doc.data();
      const transactionId = data.transactionId || formatSalesTransactionId(doc.id, data.date);
      return (
        data.customerName?.toLowerCase().includes(searchLower) ||
        data.breed?.toLowerCase().includes(searchLower) ||
        transactionId?.toLowerCase().includes(searchLower) ||
        data.customerContact?.toLowerCase().includes(searchLower)
      );
    });

    const filteredTotal = filteredDocs.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    const transactions: SalesTransaction[] = paginatedDocs.map((doc) => {
      const data = doc.data() as Omit<SalesTransaction, "id">;
      const transactionId = data.transactionId || formatSalesTransactionId(doc.id, data.date);
      return {
        id: doc.id,
        ...data,
        transactionId,
      };
    });

    return {
      transactions,
      total: filteredTotal,
      page,
      limit,
      totalPages,
    };
  }

  // No search - use proper Firestore pagination
  const offset = (page - 1) * limit;
  
  const paginatedQuery = query.limit(limit).offset(offset);
  const snapshot = await paginatedQuery.get();

  const transactions: SalesTransaction[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<SalesTransaction, "id">;
    const transactionId = data.transactionId || formatSalesTransactionId(doc.id, data.date);
    return {
      id: doc.id,
      ...data,
      transactionId,
    };
  });

  // Get total count
  let total = 0;
  try {
    const countQuery = query.count();
    const countSnapshot = await countQuery.get();
    total = countSnapshot.data().count;
  } catch (error) {
    console.warn("Count query failed, using estimation:", error);
    total = transactions.length < limit ? (page - 1) * limit + transactions.length : page * limit + 1;
  }
  
  const totalPages = Math.ceil(total / limit);

  return {
    transactions,
    total,
    page,
    limit,
    totalPages,
  };
};

export const getSalesTransactionById = async (
  user: SessionUser | null,
  id: string
): Promise<SalesTransaction | null> => {
  assertSalesPermission(user, "read");

  const doc = await salesCollectionRef().doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Omit<SalesTransaction, "id">;

  // Format transactionId if it doesn't exist
  const transactionId =
    data.transactionId || formatSalesTransactionId(doc.id, data.date);

  return {
    id: doc.id,
    ...data,
    transactionId,
  };
};

export const formatSalesTransactionId = (
  documentId: string,
  date: string
): string => {
  // Get first 4 characters of document ID (uppercase)
  const idPart = documentId.slice(0, 4).toUpperCase();

  // Extract month and day from date (YYYY-MM-DD format)
  const [, month, day] = date.split("-");
  const datePart = `${month}${day}`;

  return `#${idPart}-${datePart}`;
};

export const createSalesTransaction = async (
  user: SessionUser | null,
  input: CreateSalesTransactionInput
): Promise<SalesTransaction> => {
  assertSalesPermission(user, "create");

  // Create document reference first to get the ID
  const docRef = salesCollectionRef().doc();

  const date = new Date().toISOString().split("T")[0];

  // Generate formatted transaction ID using the document ID
  const transactionId = formatSalesTransactionId(docRef.id, date);

  const docData: Omit<SalesTransaction, "id"> = {
    transactionId: transactionId,
    date: date,
    roosterId: input.roosterId,
    breed: input.breed,
    customerName: input.customerName,
    customerContact: input.customerContact,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    commission: input.commission || input.amount * 0.1,
    agentName: input.agentName,
  };

  // Remove undefined values before saving to Firestore
  const removeUndefined = (
    obj: Record<string, unknown>
  ): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    );
  };

  const cleanedDoc = removeUndefined(docData as Record<string, unknown>);

  await docRef.set(cleanedDoc);

  // Invalidate caches
  await invalidateSalesCaches();

  const createdTransaction: SalesTransaction = {
    id: docRef.id,
    ...docData,
  };

  logAuditEvent(user, {
    action: "create",
    entity: "sales",
    entityId: createdTransaction.id,
    entityName: createdTransaction.transactionId,
    description: `Created sales transaction: ${createdTransaction.transactionId} for ${createdTransaction.customerName}`,
    details: {
      metadata: {
        breed: createdTransaction.breed,
        amount: createdTransaction.amount,
        paymentMethod: createdTransaction.paymentMethod,
        customerName: createdTransaction.customerName,
      },
    },
  });

  return createdTransaction;
};

export const updateSalesTransaction = async (
  user: SessionUser | null,
  id: string,
  input: UpdateSalesTransactionInput
): Promise<SalesTransaction> => {
  assertSalesPermission(user, "update");

  const docRef = salesCollectionRef().doc(id);

  let updated: SalesTransaction | null = null;

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(docRef);

    if (!snapshot.exists) {
      throw new Error("NOT_FOUND");
    }

    const existing = {
      id: snapshot.id,
      ...(snapshot.data() as Omit<SalesTransaction, "id">),
    } as SalesTransaction;

    const updatedDoc: Omit<SalesTransaction, "id"> = {
      ...existing,
      ...input,
    };

    // Remove undefined values before saving to Firestore
    const removeUndefined = (
      obj: Record<string, unknown>
    ): Record<string, unknown> => {
      return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v !== undefined)
      );
    };

    const cleanedDoc = removeUndefined(updatedDoc as Record<string, unknown>);

    tx.set(docRef, cleanedDoc, { merge: true });

    updated = {
      id: snapshot.id,
      ...updatedDoc,
    };
  });

  if (!updated) {
    throw new Error("UNKNOWN_ERROR");
  }

  // Invalidate caches
  await invalidateSalesCaches();

  const updatedTransaction = updated as SalesTransaction;

  logAuditEvent(user, {
    action: "update",
    entity: "sales",
    entityId: updatedTransaction.id,
    entityName: updatedTransaction.transactionId,
    description: `Updated sales transaction: ${updatedTransaction.transactionId}`,
    details: {
      metadata: {
        breed: updatedTransaction.breed,
        amount: updatedTransaction.amount,
        customerName: updatedTransaction.customerName,
      },
    },
  });

  return updatedTransaction;
};

export const deleteSalesTransaction = async (
  user: SessionUser | null,
  id: string
): Promise<void> => {
  assertSalesPermission(user, "delete");

  const docRef = salesCollectionRef().doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("NOT_FOUND");
  }

  const deletedTransaction = {
    id: doc.id,
    ...(doc.data() as Omit<SalesTransaction, "id">),
  } as SalesTransaction;

  await docRef.delete();

  // Invalidate caches
  await invalidateSalesCaches();

  logAuditEvent(user, {
    action: "delete",
    entity: "sales",
    entityId: deletedTransaction.id,
    entityName: deletedTransaction.transactionId,
    description: `Deleted sales transaction: ${deletedTransaction.transactionId}`,
    details: {
      metadata: {
        breed: deletedTransaction.breed,
        amount: deletedTransaction.amount,
        customerName: deletedTransaction.customerName,
      },
    },
  });
};

export const getSalesStats = async (
  user: SessionUser | null
): Promise<SalesStats> => {
  assertSalesPermission(user, "readStats");

  const transactions = await getSalesTransactions(user);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = transactions.length;

  const averageSaleAmount =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Calculate monthly growth (simplified - compare current month to previous month)
  const now = new Date();
  const currentMonth = transactions.filter((t) => {
    const saleDate = new Date(t.date);
    return (
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });

  const lastMonth = transactions.filter((t) => {
    const saleDate = new Date(t.date);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return (
      saleDate.getMonth() === lastMonthDate.getMonth() &&
      saleDate.getFullYear() === lastMonthDate.getFullYear()
    );
  });

  const currentMonthRevenue = currentMonth.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const lastMonthRevenue = lastMonth.reduce((sum, t) => sum + t.amount, 0);

  const monthlyGrowth =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Find top breed
  const breedCounts = transactions.reduce(
    (acc, t) => {
      acc[t.breed] = (acc[t.breed] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topBreed =
    Object.entries(breedCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

  return {
    totalRevenue,
    totalTransactions,
    pendingTransactions: 0,
    averageSaleAmount,
    monthlyGrowth,
    topBreed,
  };
};

export const getRevenueTrend = async (
  user: SessionUser | null,
  days: number = 30
): Promise<RevenueTrend[]> => {
  assertSalesPermission(user, "readStats");

  const transactions = await getSalesTransactions(user);
  const trends: RevenueTrend[] = [];

  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const dayTransactions = transactions.filter((t) => t.date === dateStr);
    const revenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

    trends.push({
      date: dateStr,
      revenue,
      transactions: dayTransactions.length,
    });
  }

  return trends;
};

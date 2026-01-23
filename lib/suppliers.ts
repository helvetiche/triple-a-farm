import { adminDb } from "./firebase";
import type { Supplier, SupplierStats } from "./supplier-types";

const SUPPLIERS_COLLECTION = "suppliers";

export async function getAllSuppliers(): Promise<Supplier[]> {
  const suppliersRef = adminDb.collection(SUPPLIERS_COLLECTION);
  const snapshot = await suppliersRef.orderBy("name", "asc").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      itemsSupplied: data.itemsSupplied || 0,
      totalOrders: data.totalOrders || 0,
      notes: data.notes,
      createdAt:
        data.createdAt?._seconds
          ? new Date(data.createdAt._seconds * 1000).toISOString()
          : data.createdAt,
      updatedAt:
        data.updatedAt?._seconds
          ? new Date(data.updatedAt._seconds * 1000).toISOString()
          : data.updatedAt,
    } as Supplier;
  });
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const docRef = adminDb.collection(SUPPLIERS_COLLECTION).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    name: data.name,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email,
    address: data.address,
    itemsSupplied: data.itemsSupplied || 0,
    totalOrders: data.totalOrders || 0,
    notes: data.notes,
    createdAt:
      data.createdAt?._seconds
        ? new Date(data.createdAt._seconds * 1000).toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt?._seconds
        ? new Date(data.updatedAt._seconds * 1000).toISOString()
        : data.updatedAt,
  } as Supplier;
}

export interface CreateSupplierInput {
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export async function createSupplier(
  input: CreateSupplierInput
): Promise<Supplier> {
  const now = new Date().toISOString();
  const suppliersRef = adminDb.collection(SUPPLIERS_COLLECTION);

  const docRef = await suppliersRef.add({
    name: input.name,
    contactPerson: input.contactPerson || null,
    phone: input.phone,
    email: input.email || null,
    address: input.address || null,
    itemsSupplied: 0,
    totalOrders: 0,
    notes: input.notes || null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    name: input.name,
    contactPerson: input.contactPerson,
    phone: input.phone,
    email: input.email,
    address: input.address,
    itemsSupplied: 0,
    totalOrders: 0,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

export interface UpdateSupplierInput {
  name?: string;
  contactPerson?: string | null;
  phone?: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export async function updateSupplier(
  id: string,
  input: UpdateSupplierInput
): Promise<Supplier> {
  const docRef = adminDb.collection(SUPPLIERS_COLLECTION).doc(id);
  const existing = await getSupplierById(id);

  if (!existing) {
    throw new Error("Supplier not found");
  }

  const now = new Date().toISOString();

  await docRef.update({
    name: input.name ?? existing.name,
    contactPerson: input.contactPerson ?? existing.contactPerson,
    phone: input.phone ?? existing.phone,
    email: input.email ?? existing.email,
    address: input.address ?? existing.address,
    notes: input.notes ?? existing.notes,
    updatedAt: now,
  });

  return {
    ...existing,
    name: input.name ?? existing.name,
    contactPerson: input.contactPerson ?? existing.contactPerson,
    phone: input.phone ?? existing.phone,
    email: input.email ?? existing.email,
    address: input.address ?? existing.address,
    notes: input.notes ?? existing.notes,
    updatedAt: now,
  };
}

export async function deleteSupplier(id: string): Promise<void> {
  const docRef = adminDb.collection(SUPPLIERS_COLLECTION).doc(id);
  await docRef.delete();
}

export async function getSupplierStats(): Promise<SupplierStats> {
  const suppliersRef = adminDb.collection(SUPPLIERS_COLLECTION);
  const snapshot = await suppliersRef.get();

  let totalItemsSupplied = 0;
  let activeSuppliers = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const itemsSupplied = data.itemsSupplied || 0;
    totalItemsSupplied += itemsSupplied;
    if (itemsSupplied > 0) {
      activeSuppliers++;
    }
  });

  return {
    totalSuppliers: snapshot.size,
    activeSuppliers,
    totalItemsSupplied,
  };
}

// Helper function to update supplier counts when inventory changes
export async function updateSupplierCounts(supplierName: string): Promise<void> {
  const suppliersRef = adminDb.collection(SUPPLIERS_COLLECTION);
  const snapshot = await suppliersRef.where("name", "==", supplierName).get();

  if (snapshot.empty) {
    return;
  }

  const supplierDoc = snapshot.docs[0];
  const supplierId = supplierDoc.id;

  // Count inventory items from this supplier
  const inventoryRef = adminDb.collection("inventory");
  const inventorySnapshot = await inventoryRef
    .where("supplier", "==", supplierName)
    .get();
  const itemsSupplied = inventorySnapshot.size;

  // Count restock activities from this supplier
  const activitiesRef = adminDb.collection("inventoryActivities");
  const activitiesSnapshot = await activitiesRef
    .where("type", "==", "restock")
    .where("reason", "==", "Supplier Delivery")
    .get();

  // Filter activities by supplier name in the reason or notes
  let totalOrders = 0;
  activitiesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (
      data.reason?.includes(supplierName) ||
      data.notes?.includes(supplierName)
    ) {
      totalOrders++;
    }
  });

  // Update supplier document
  const supplierDocRef = adminDb.collection(SUPPLIERS_COLLECTION).doc(supplierId);
  await supplierDocRef.update({
    itemsSupplied,
    totalOrders,
    updatedAt: new Date().toISOString(),
  });
}

import { adminDb } from "@/lib/firebase";
import type { SessionUser } from "@/lib/auth";
import { hasRequiredRole } from "@/lib/roles";
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogStats,
  AuditAction,
  AuditEntity,
  AuditSeverity,
} from "@/lib/audit-types";
import { getActionSeverity } from "@/lib/audit-types";

const AUDIT_COLLECTION = "auditLogs";

type AuditPermissionAction = "read" | "create";

const assertAuditPermission = (
  user: SessionUser | null,
  action: AuditPermissionAction
) => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const roles = user.roles;

  switch (action) {
    case "read":
      if (!hasRequiredRole(roles, "admin")) {
        throw new Error("FORBIDDEN");
      }
      return;
    case "create":
      if (!hasRequiredRole(roles, ["admin", "staff"])) {
        throw new Error("FORBIDDEN");
      }
      return;
    default:
      throw new Error("FORBIDDEN");
  }
};

const auditCollectionRef = () => adminDb.collection(AUDIT_COLLECTION);

export interface CreateAuditLogInput {
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  description: string;
  details?: AuditLogEntry["details"];
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (
  user: SessionUser | null,
  input: CreateAuditLogInput
): Promise<AuditLogEntry> => {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const docRef = auditCollectionRef().doc();
  const timestamp = new Date().toISOString();

  const auditEntry: Omit<AuditLogEntry, "id"> = {
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    entityName: input.entityName,
    userId: user.uid,
    userEmail: user.email || "",
    userName: user.email?.split("@")[0],
    userRole: user.roles?.[0],
    description: input.description,
    details: input.details,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    severity: input.severity || getActionSeverity(input.action),
    timestamp,
  };

  const cleanEntry = Object.fromEntries(
    Object.entries(auditEntry).filter(([, v]) => v !== undefined)
  );

  await docRef.set(cleanEntry);

  return {
    id: docRef.id,
    ...auditEntry,
  };
};

export const logAuditEvent = async (
  user: SessionUser | null,
  input: CreateAuditLogInput
): Promise<void> => {
  try {
    await createAuditLog(user, input);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

export interface GetAuditLogsOptions {
  filters?: AuditLogFilters;
  limit?: number;
  offset?: number;
}

export const getAuditLogs = async (
  user: SessionUser | null,
  options?: GetAuditLogsOptions
): Promise<{ logs: AuditLogEntry[]; total: number }> => {
  assertAuditPermission(user, "read");

  const { filters, limit = 50, offset = 0 } = options || {};

  let query: FirebaseFirestore.Query = auditCollectionRef().orderBy(
    "timestamp",
    "desc"
  );

  if (filters?.startDate) {
    query = query.where("timestamp", ">=", filters.startDate);
  }

  if (filters?.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setDate(endDate.getDate() + 1);
    query = query.where("timestamp", "<", endDate.toISOString());
  }

  if (filters?.userId) {
    query = query.where("userId", "==", filters.userId);
  }

  if (filters?.action) {
    const actions = Array.isArray(filters.action)
      ? filters.action
      : [filters.action];
    if (actions.length === 1) {
      query = query.where("action", "==", actions[0]);
    }
  }

  if (filters?.entity) {
    const entities = Array.isArray(filters.entity)
      ? filters.entity
      : [filters.entity];
    if (entities.length === 1) {
      query = query.where("entity", "==", entities[0]);
    }
  }

  if (filters?.severity) {
    const severities = Array.isArray(filters.severity)
      ? filters.severity
      : [filters.severity];
    if (severities.length === 1) {
      query = query.where("severity", "==", severities[0]);
    }
  }

  const snapshot = await query.get();

  let logs = snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<AuditLogEntry, "id">;
    return {
      id: doc.id,
      ...data,
    };
  });

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    logs = logs.filter(
      (log) =>
        log.description.toLowerCase().includes(searchLower) ||
        log.entityName?.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.userName?.toLowerCase().includes(searchLower)
    );
  }

  const total = logs.length;

  const paginatedLogs = logs.slice(offset, offset + limit);

  return { logs: paginatedLogs, total };
};

export const getAuditLogById = async (
  user: SessionUser | null,
  id: string
): Promise<AuditLogEntry | null> => {
  assertAuditPermission(user, "read");

  const doc = await auditCollectionRef().doc(id).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Omit<AuditLogEntry, "id">;

  return {
    id: doc.id,
    ...data,
  };
};

export const getAuditStats = async (
  user: SessionUser | null
): Promise<AuditLogStats> => {
  assertAuditPermission(user, "read");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const snapshot = await auditCollectionRef()
    .where("timestamp", ">=", thirtyDaysAgo.toISOString())
    .get();

  const logs = snapshot.docs.map(
    (doc) => doc.data() as Omit<AuditLogEntry, "id">
  );

  const byAction: Record<string, number> = {};
  const byEntity: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const userActivity: Record<
    string,
    { email: string; name?: string; count: number; lastActivity: string }
  > = {};

  for (const log of logs) {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
    byEntity[log.entity] = (byEntity[log.entity] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

    if (!userActivity[log.userId]) {
      userActivity[log.userId] = {
        email: log.userEmail,
        name: log.userName,
        count: 0,
        lastActivity: log.timestamp,
      };
    }
    userActivity[log.userId].count += 1;
    if (log.timestamp > userActivity[log.userId].lastActivity) {
      userActivity[log.userId].lastActivity = log.timestamp;
    }
  }

  const recentUsers = Object.entries(userActivity)
    .map(([userId, data]) => ({
      userId,
      userEmail: data.email,
      userName: data.name,
      actionCount: data.count,
      lastActivity: data.lastActivity,
    }))
    .sort((a, b) => b.actionCount - a.actionCount)
    .slice(0, 10);

  return {
    totalLogs: logs.length,
    byAction: byAction as Record<AuditAction, number>,
    byEntity: byEntity as Record<AuditEntity, number>,
    bySeverity: bySeverity as Record<AuditSeverity, number>,
    recentUsers,
  };
};

export const buildAuditDescription = (
  action: AuditAction,
  entity: AuditEntity,
  entityName?: string
): string => {
  const entityLabel = entityName || entity;

  switch (action) {
    case "create":
      return `Created ${entity}: ${entityLabel}`;
    case "update":
      return `Updated ${entity}: ${entityLabel}`;
    case "delete":
      return `Deleted ${entity}: ${entityLabel}`;
    case "view":
      return `Viewed ${entity}: ${entityLabel}`;
    case "restock":
      return `Restocked inventory: ${entityLabel}`;
    case "consume":
      return `Consumed inventory: ${entityLabel}`;
    case "login":
      return `User logged in`;
    case "logout":
      return `User logged out`;
    case "export":
      return `Exported ${entity} data`;
    case "import":
      return `Imported ${entity} data`;
    case "settings_change":
      return `Changed ${entity} settings`;
    case "permission_change":
      return `Changed permissions for: ${entityLabel}`;
    default:
      return `Performed action on ${entity}: ${entityLabel}`;
  }
};

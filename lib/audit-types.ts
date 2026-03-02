export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "login"
  | "logout"
  | "restock"
  | "consume"
  | "export"
  | "import"
  | "settings_change"
  | "permission_change";

export type AuditEntity =
  | "inventory"
  | "sales"
  | "rooster"
  | "user"
  | "supplier"
  | "location"
  | "breed"
  | "settings"
  | "system";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  entityName?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userRole?: string;
  description: string;
  details?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    changes?: Array<{
      field: string;
      oldValue: unknown;
      newValue: unknown;
    }>;
    metadata?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  timestamp: string;
}

export interface AuditLogFilters {
  action?: AuditAction | AuditAction[];
  entity?: AuditEntity | AuditEntity[];
  userId?: string;
  severity?: AuditSeverity | AuditSeverity[];
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogStats {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  byEntity: Record<AuditEntity, number>;
  bySeverity: Record<AuditSeverity, number>;
  recentUsers: Array<{
    userId: string;
    userEmail: string;
    userName?: string;
    actionCount: number;
    lastActivity: string;
  }>;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  view: "Viewed",
  login: "Logged In",
  logout: "Logged Out",
  restock: "Restocked",
  consume: "Consumed",
  export: "Exported",
  import: "Imported",
  settings_change: "Settings Changed",
  permission_change: "Permission Changed",
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  inventory: "Inventory",
  sales: "Sales",
  rooster: "Rooster",
  user: "User",
  supplier: "Supplier",
  location: "Location",
  breed: "Breed",
  settings: "Settings",
  system: "System",
};

export const AUDIT_SEVERITY_CONFIG: Record<
  AuditSeverity,
  { label: string; color: string; bgColor: string }
> = {
  info: {
    label: "Normal",
    color: "text-[#4a6741]",
    bgColor: "bg-[#e8f0e5]",
  },
  warning: {
    label: "Warning",
    color: "text-[#4a6741]",
    bgColor: "bg-[#e8f0e5]",
  },
  critical: {
    label: "Critical",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export const getActionSeverity = (action: AuditAction): AuditSeverity => {
  switch (action) {
    case "delete":
    case "permission_change":
      return "critical";
    case "update":
    case "settings_change":
      return "warning";
    default:
      return "info";
  }
};

"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { PageHeader } from "@/components/dashboard";
import {
  Activity,
  Search,
  User,
  Clock,
  FileText,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Package,
  ShoppingCart,
  Users,
  MapPin,
  Settings,
  Server,
} from "lucide-react";

import type {
  AuditLogEntry,
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditLogStats,
} from "@/lib/audit-types";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  AUDIT_SEVERITY_CONFIG,
} from "@/lib/audit-types";

import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 15;

const getEntityIcon = (entity: AuditEntity) => {
  switch (entity) {
    case "inventory":
      return Package;
    case "sales":
      return ShoppingCart;
    case "rooster":
      return Activity;
    case "user":
      return Users;
    case "supplier":
      return User;
    case "location":
      return MapPin;
    case "settings":
      return Settings;
    case "system":
      return Server;
    default:
      return FileText;
  }
};

const getActionColor = (action: AuditAction) => {
  switch (action) {
    case "delete":
    case "consume":
    case "permission_change":
    case "settings_change":
      return "bg-red-100 text-red-700";
    default:
      return "bg-[#e8f0e5] text-[#4a6741]";
  }
};

const getSeverityIcon = (severity: AuditSeverity) => {
  if (severity === "critical") {
    return AlertTriangle;
  }
  return Activity;
};

export default function AuditTrailPage() {
  useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchValue, setSearchValue] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      params.set("limit", ITEMS_PER_PAGE.toString());
      params.set("offset", ((currentPage - 1) * ITEMS_PER_PAGE).toString());

      if (searchValue) params.set("search", searchValue);
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter !== "all") params.set("entity", entityFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (startDate)
        params.set("startDate", startDate.toISOString().split("T")[0]);
      if (endDate) params.set("endDate", endDate.toISOString().split("T")[0]);

      const response = await fetch(`/api/audit?${params.toString()}`);
      const json = await response.json();

      if (response.ok && json?.success) {
        setLogs(json.data.logs);
        setTotal(json.data.total);
      } else {
        toast.error("Failed to load audit logs");
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    searchValue,
    actionFilter,
    entityFilter,
    severityFilter,
    startDate,
    endDate,
  ]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/audit/stats");
      const json = await response.json();

      if (response.ok && json?.success) {
        setStats(json.data);
      }
    } catch (error) {
      console.error("Error fetching audit stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
    toast.success("Audit logs refreshed");
  };

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setActionFilter("all");
    setEntityFilter("all");
    setSeverityFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <PageHeader
            title="Audit Trail"
            description="Track and monitor all system activities"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </PageHeader>

          {/* Stats Cards */}
          {stats ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-[#4a6741]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Activities
                  </CardTitle>
                  <Activity className="h-4 w-4 text-[#4a6741]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1f3f2c]">
                    {stats.totalLogs}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Critical Events
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.bySeverity?.critical || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#4a6741]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-[#4a6741]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1f3f2c]">
                    {stats.recentUsers?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With recent activity
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 w-full"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <Select
                value={actionFilter}
                onValueChange={(value) => {
                  setActionFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[130px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={entityFilter}
                onValueChange={(value) => {
                  setEntityFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[130px]">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {Object.entries(AUDIT_ENTITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[120px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="info">Normal</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 w-full sm:w-auto"
              >
                Reset
              </Button>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <DatePicker
                  label=""
                  value={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setCurrentPage(1);
                  }}
                  placeholder="From date"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <DatePicker
                  label=""
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setCurrentPage(1);
                  }}
                  placeholder="To date"
                />
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    Showing {logs.length} of {total} activities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No activities found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchValue ||
                    actionFilter !== "all" ||
                    entityFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Activities will appear here once they occur"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="space-y-3 md:hidden">
                    {logs.map((log) => {
                      const { date, time } = formatTimestamp(log.timestamp);
                      const EntityIcon = getEntityIcon(log.entity);
                      const severityConfig =
                        AUDIT_SEVERITY_CONFIG[log.severity];

                      return (
                        <div
                          key={log.id}
                          className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors"
                          onClick={() => handleViewDetails(log)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleViewDetails(log);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${log.description}`}
                        >
                          {/* Header with icon and badges */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f0e5] shrink-0">
                                <EntityIcon className="h-4 w-4 text-[#4a6741]" />
                              </div>
                              <Badge
                                variant="secondary"
                                className={getActionColor(log.action)}
                              >
                                {AUDIT_ACTION_LABELS[log.action]}
                              </Badge>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`${severityConfig.bgColor} ${severityConfig.color} shrink-0`}
                            >
                              {severityConfig.label}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="font-medium text-sm mb-1 line-clamp-2">
                            {log.description}
                          </p>
                          {log.entityName && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {AUDIT_ENTITY_LABELS[log.entity]}:{" "}
                              {log.entityName}
                            </p>
                          )}

                          {/* Footer with user and time */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3" />
                              <span>
                                {log.userName || log.userEmail.split("@")[0]}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {date}, {time}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Timestamp</TableHead>
                          <TableHead>Activity</TableHead>
                          <TableHead className="hidden lg:table-cell">
                            User
                          </TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead className="hidden xl:table-cell">
                            Severity
                          </TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => {
                          const { date, time } = formatTimestamp(log.timestamp);
                          const EntityIcon = getEntityIcon(log.entity);
                          const SeverityIcon = getSeverityIcon(log.severity);
                          const severityConfig =
                            AUDIT_SEVERITY_CONFIG[log.severity];

                          return (
                            <TableRow
                              key={log.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleViewDetails(log)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground hidden lg:block" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {date}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {time}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0e5] shrink-0">
                                    <EntityIcon className="h-4 w-4 text-[#4a6741]" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm truncate max-w-[200px] lg:max-w-[300px]">
                                      {log.description}
                                    </div>
                                    {log.entityName && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {AUDIT_ENTITY_LABELS[log.entity]}:{" "}
                                        {log.entityName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {log.userName ||
                                        log.userEmail.split("@")[0]}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {log.userRole || "User"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={getActionColor(log.action)}
                                >
                                  {AUDIT_ACTION_LABELS[log.action]}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden xl:table-cell">
                                <Badge
                                  variant="secondary"
                                  className={`${severityConfig.bgColor} ${severityConfig.color}`}
                                >
                                  <SeverityIcon className="h-3 w-3 mr-1" />
                                  {severityConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={total}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Activity Details
                </DialogTitle>
                <DialogDescription>
                  Full details of this audit log entry
                </DialogDescription>
              </DialogHeader>

              {selectedLog && (
                <ScrollArea className="max-h-[calc(90vh-120px)] sm:max-h-[60vh]">
                  <div className="space-y-4 sm:space-y-6 pr-4">
                    {/* Header Info */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg break-words">
                          {selectedLog.description}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(selectedLog.timestamp).date} at{" "}
                          {formatTimestamp(selectedLog.timestamp).time}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 w-fit ${
                          AUDIT_SEVERITY_CONFIG[selectedLog.severity].bgColor
                        } ${AUDIT_SEVERITY_CONFIG[selectedLog.severity].color}`}
                      >
                        {AUDIT_SEVERITY_CONFIG[selectedLog.severity].label}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Action</p>
                        <Badge
                          variant="secondary"
                          className={getActionColor(selectedLog.action)}
                        >
                          {AUDIT_ACTION_LABELS[selectedLog.action]}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Entity</p>
                        <p className="font-medium">
                          {AUDIT_ENTITY_LABELS[selectedLog.entity]}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">User</p>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                            <User className="h-3 w-3 text-primary" />
                          </div>
                          <span className="font-medium text-sm break-all">
                            {selectedLog.userName || selectedLog.userEmail}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium capitalize">
                          {selectedLog.userRole || "User"}
                        </p>
                      </div>

                      {selectedLog.entityId && (
                        <div className="space-y-1 col-span-1 sm:col-span-2">
                          <p className="text-sm text-muted-foreground">
                            Entity ID
                          </p>
                          <code className="text-xs bg-muted px-2 py-1 rounded break-all block">
                            {selectedLog.entityId}
                          </code>
                        </div>
                      )}

                      {selectedLog.entityName && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Entity Name
                          </p>
                          <p className="font-medium break-words">
                            {selectedLog.entityName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Changes */}
                    {selectedLog.details?.changes &&
                      selectedLog.details.changes.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Changes Made</h4>
                          {/* Mobile: Stack view */}
                          <div className="space-y-3 sm:hidden">
                            {selectedLog.details.changes.map(
                              (change, index) => (
                                <div
                                  key={index}
                                  className="border rounded-lg p-3 space-y-2"
                                >
                                  <p className="font-medium text-sm">
                                    {change.field}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Old
                                      </p>
                                      <p className="text-red-600 break-words">
                                        {String(change.oldValue ?? "-")}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        New
                                      </p>
                                      <p className="text-green-600 break-words">
                                        {String(change.newValue ?? "-")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                          {/* Desktop: Table view */}
                          <div className="hidden sm:block rounded-lg border overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Field</TableHead>
                                  <TableHead>Old Value</TableHead>
                                  <TableHead>New Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedLog.details.changes.map(
                                  (change, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">
                                        {change.field}
                                      </TableCell>
                                      <TableCell className="text-red-600 break-words max-w-[150px]">
                                        {String(change.oldValue ?? "-")}
                                      </TableCell>
                                      <TableCell className="text-green-600 break-words max-w-[150px]">
                                        {String(change.newValue ?? "-")}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                    {/* Technical Info */}
                    {(selectedLog.ipAddress || selectedLog.userAgent) && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Technical Details
                        </h4>
                        {selectedLog.ipAddress && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">IP: </span>
                            {selectedLog.ipAddress}
                          </div>
                        )}
                        {selectedLog.userAgent && (
                          <div className="text-xs break-all">
                            <span className="text-muted-foreground">
                              User Agent:{" "}
                            </span>
                            {selectedLog.userAgent}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

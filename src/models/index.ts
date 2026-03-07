export enum AssetStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  MAINTENANCE = "MAINTENANCE",
  RETIRED = "RETIRED",
}

export enum Role {
  SUPERADMIN = "SUPERADMIN",
  ORG_MANAGER = "ORG_MANAGER",
  ASSET_MANAGER = "ASSET_MANAGER",
  VIEWER = "VIEWER",
}

export enum OrgStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
}

export enum BackendChoice {
  JS = "JS",
  DOTNET = "DOTNET",
}

export const BACKEND_CONFIG: Record<
  BackendChoice,
  { label: string; baseUrl: string }
> = {
  [BackendChoice.JS]: {
    label: "NexusCoreJS (Node API)",
    baseUrl: "https://nexus-coreapi-production.up.railway.app/api/v1",
  },
  [BackendChoice.DOTNET]: {
    label: "NexusCoreDotNet (.NET API)",
    baseUrl: "https://nexuscoredotnet-production.up.railway.app/api/v1",
  },
};

export interface AuthUserOrg {
  id: string;
  status: OrgStatus;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
  organizationId: string;
  organization: AuthUserOrg;
}

export interface Asset {
  id: string;
  name: string;
  sku: string;
  description?: string;
  status: AssetStatus;
  assignedTo?: string;
  organizationId: string;
  createdAt: string;
  updatedAt?: string;
}

// Nested meta object returned by JS backend: {"data":[...],"meta":{"total":8,"page":1,"perPage":20}}
export interface PaginatedMeta {
  total?: number;
  page?: number;
  perPage?: number;
}

// Handles both backends:
//   JS:   { data, meta: { total, page, perPage } }
//   .NET: { data, total, page, perPage }
export interface PaginatedAssets {
  data: Asset[];
  // .NET flat fields
  total?: number;
  page?: number;
  perPage?: number;
  // JS nested meta
  meta?: PaginatedMeta;
}

export function resolvedTotal(p: PaginatedAssets | PaginatedAuditLogs): number {
  return p.meta?.total ?? p.total ?? 0;
}

export function resolvedPage(p: PaginatedAssets): number {
  return p.meta?.page ?? p.page ?? 1;
}

export interface CreateAssetRequest {
  name: string;
  sku: string;
  description?: string;
  status: AssetStatus;
  assignedTo?: string;
}

export type UpdateAssetRequest = CreateAssetRequest;

export interface CsvImportResult {
  created: number;
  skipped: number;
  limitReached: boolean;
  errors: string[];
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
}

export interface InviteResponse {
  inviteLink?: string;
}

export interface StatusBreakdownItem {
  status: AssetStatus;
  count: number;
}

// Unified model used by the UI
export interface ReportsData {
  totalAssets: number;
  utilizationRate: number;
  byStatus: StatusBreakdownItem[];
}

// .NET backend response from GET /reports:
// { totalAssets, utilizationRate, assetsByStatus: [{status, count}], ... }
export interface DotNetReportsResponse {
  totalAssets: number;
  utilizationRate: number;
  assetsByStatus: StatusBreakdownItem[];
}

// JS backend response from GET /reports/stats:
// { totalAssets, utilizationRate, byStatus: { AVAILABLE: n, IN_USE: n, ... }, totalUsers }
export interface JsReportsResponse {
  totalAssets: number;
  utilizationRate: number;
  byStatus: Record<string, number>;
}

export function dotNetToReportsData(r: DotNetReportsResponse): ReportsData {
  return {
    totalAssets: r.totalAssets,
    utilizationRate: r.utilizationRate,
    byStatus: r.assetsByStatus,
  };
}

export function jsToReportsData(r: JsReportsResponse): ReportsData {
  return {
    totalAssets: r.totalAssets,
    utilizationRate: r.utilizationRate,
    byStatus: Object.entries(r.byStatus).reduce<StatusBreakdownItem[]>(
      (acc, [key, count]) => {
        if (key in AssetStatus) {
          acc.push({ status: key as AssetStatus, count });
        }
        return acc;
      },
      [],
    ),
  };
}

// Handles both backends (same dual-shape as PaginatedAssets)
export interface PaginatedAuditLogs {
  data: AuditLog[];
  // .NET flat fields
  total?: number;
  page?: number;
  perPage?: number;
  // JS nested meta
  meta?: PaginatedMeta;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

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

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  organizationId: string;
  orgStatus: OrgStatus;
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

export interface PaginatedAssets {
  data: Asset[];
  total: number;
  page: number;
  perPage: number;
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

export interface ReportsData {
  totalAssets: number;
  utilizationRate: number;
  byStatus: StatusBreakdownItem[];
}

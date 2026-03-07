import axios, { AxiosInstance } from "axios";
import auth from "@react-native-firebase/auth";
import { getBackendChoice, getBaseUrl } from "../store/backend";
import {
  AuthUser,
  Asset,
  PaginatedAssets,
  CreateAssetRequest,
  UpdateAssetRequest,
  CsvImportResult,
  TeamMember,
  InviteResponse,
  ReportsData,
  DotNetReportsResponse,
  JsReportsResponse,
  dotNetToReportsData,
  jsToReportsData,
  Role,
  BackendChoice,
} from "../models";

let _client: AxiosInstance | null = null;

export async function getApiClient(): Promise<AxiosInstance> {
  if (!_client) {
    const choice = await getBackendChoice();
    const baseURL = getBaseUrl(choice);
    _client = axios.create({ baseURL });

    _client.interceptors.request.use(async (config) => {
      const user = auth().currentUser;
      if (user) {
        const token = await user.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }
  return _client;
}

export function resetApiClient(): void {
  _client = null;
}

// Auth
export async function getMe(): Promise<AuthUser> {
  const client = await getApiClient();
  const res = await client.get<AuthUser>("/auth/me");
  return res.data;
}

export async function register(payload: {
  firebaseToken: string;
  orgName: string;
  name: string;
  email: string;
}): Promise<AuthUser> {
  const client = await getApiClient();
  const res = await client.post<AuthUser>("/auth/register", payload);
  return res.data;
}

// Assets
export async function getAssets(
  page = 1,
  search?: string,
): Promise<PaginatedAssets> {
  const client = await getApiClient();
  const res = await client.get<PaginatedAssets>("/assets", {
    params: { page, ...(search ? { search } : {}) },
  });
  return res.data;
}

export async function createAsset(data: CreateAssetRequest): Promise<Asset> {
  const client = await getApiClient();
  const res = await client.post<Asset>("/assets", data);
  return res.data;
}

export async function updateAsset(
  id: string,
  data: UpdateAssetRequest,
): Promise<Asset> {
  const client = await getApiClient();
  const res = await client.put<Asset>(`/assets/${id}`, data);
  return res.data;
}

export async function deleteAsset(id: string): Promise<void> {
  const client = await getApiClient();
  await client.delete(`/assets/${id}`);
}

export async function importCsv(formData: FormData): Promise<CsvImportResult> {
  const client = await getApiClient();
  const res = await client.post<CsvImportResult>("/assets/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getSampleCsvUrl(): Promise<string> {
  const choice = await getBackendChoice();
  const baseUrl = getBaseUrl(choice);
  return `${baseUrl}/assets/sample-csv`;
}

// Team
export async function getTeam(): Promise<TeamMember[]> {
  const client = await getApiClient();
  const res = await client.get<TeamMember[]>("/users");
  return res.data;
}

export async function inviteMember(
  email: string,
  role: Role,
): Promise<InviteResponse> {
  const client = await getApiClient();
  const res = await client.post<InviteResponse>("/users/invite", {
    email,
    role,
  });
  return res.data;
}

export async function removeMember(id: string): Promise<void> {
  const client = await getApiClient();
  await client.delete(`/users/${id}`);
}

export async function updateMemberRole(
  id: string,
  role: string,
): Promise<TeamMember> {
  const client = await getApiClient();
  const res = await client.patch<TeamMember>(`/users/${id}/role`, { role });
  return res.data;
}

// Reports
// .NET backend: GET /reports
async function getDotNetReports(
  client: AxiosInstance,
): Promise<DotNetReportsResponse> {
  const res = await client.get<DotNetReportsResponse>("/reports");
  return res.data;
}

// JS backend: GET /reports/stats
async function getJsReports(client: AxiosInstance): Promise<JsReportsResponse> {
  const res = await client.get<JsReportsResponse>("/reports/stats");
  return res.data;
}

export async function getReports(): Promise<ReportsData> {
  const choice = await getBackendChoice();
  const client = await getApiClient();
  if (choice === BackendChoice.JS) {
    const raw = await getJsReports(client);
    console.log("[Reports] JS raw response", JSON.stringify(raw));
    return jsToReportsData(raw);
  } else {
    const raw = await getDotNetReports(client);
    console.log("[Reports] .NET raw response", JSON.stringify(raw));
    return dotNetToReportsData(raw);
  }
}

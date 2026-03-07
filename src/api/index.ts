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

export async function inviteMember(email: string): Promise<InviteResponse> {
  const client = await getApiClient();
  const res = await client.post<InviteResponse>("/users/invite", { email });
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
export async function getReports(): Promise<ReportsData> {
  const client = await getApiClient();
  const res = await client.get<ReportsData>("/reports");
  return res.data;
}

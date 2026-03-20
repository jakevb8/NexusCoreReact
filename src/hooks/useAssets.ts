import { useState, useCallback } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getAssets, deleteAsset, importCsv, getMe } from "../api";
import { generateSampleCsv } from "../utils/csv";
import { Asset, CsvImportResult, Role, resolvedTotal } from "../models";

export interface AssetsState {
  assets: Asset[];
  total: number;
  page: number;
  search: string;
  isLoading: boolean;
  error: string | null;
  isManager: boolean;
  importResult: CsvImportResult | null;
  successMessage: string | null;
  deleteTarget: Asset | null;
  menuVisible: boolean;
}

export interface AssetsActions {
  load: (p: number, s: string) => Promise<void>;
  handleSearch: (text: string) => void;
  handleDelete: (asset: Asset) => Promise<void>;
  handleImportCsv: () => Promise<void>;
  handleDownloadSample: () => Promise<void>;
  setPage: (p: number) => void;
  setDeleteTarget: (asset: Asset | null) => void;
  setMenuVisible: (visible: boolean) => void;
  setImportResult: (result: CsvImportResult | null) => void;
  setSuccessMessage: (msg: string | null) => void;
  setError: (msg: string | null) => void;
}

export function useAssets(): AssetsState & AssetsActions {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const load = useCallback(async (p: number, s: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [result, me] = await Promise.all([
        getAssets(p, s || undefined),
        getMe(),
      ]);
      setAssets(result.data);
      setTotal(resolvedTotal(result));
      setIsManager(me.role === Role.ORG_MANAGER || me.role === Role.SUPERADMIN);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
    load(1, text);
  };

  const handleDelete = async (asset: Asset) => {
    try {
      await deleteAsset(asset.id);
      setSuccessMessage(`"${asset.name}" deleted`);
      load(page, search);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Delete failed");
    }
  };

  const handleImportCsv = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name ?? "import.csv",
        type: "text/csv",
      } as any);
      const importRes = await importCsv(formData);
      setImportResult(importRes);
      load(1, search);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Import failed");
    }
  };

  const handleDownloadSample = async () => {
    setMenuVisible(false);
    try {
      const csv = generateSampleCsv();
      const fileUri = FileSystem.documentDirectory + "nexuscore_sample.csv";
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, { mimeType: "text/csv" });
    } catch {
      setError("Failed to generate sample CSV");
    }
  };

  return {
    assets,
    total,
    page,
    search,
    isLoading,
    error,
    isManager,
    importResult,
    successMessage,
    deleteTarget,
    menuVisible,
    load,
    handleSearch,
    handleDelete,
    handleImportCsv,
    handleDownloadSample,
    setPage,
    setDeleteTarget,
    setMenuVisible,
    setImportResult,
    setSuccessMessage,
    setError,
  };
}

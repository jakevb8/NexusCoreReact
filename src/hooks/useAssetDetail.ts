import { useState, useCallback } from "react";
import { getAsset, createAsset, updateAsset } from "../api";
import { Asset, AssetStatus, CreateAssetRequest } from "../models";

export interface AssetDetailState {
  name: string;
  sku: string;
  description: string;
  assignedTo: string;
  status: AssetStatus;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface AssetDetailActions {
  loadAsset: (id: string) => Promise<void>;
  setName: (v: string) => void;
  setSku: (v: string) => void;
  setDescription: (v: string) => void;
  setAssignedTo: (v: string) => void;
  setStatus: (v: AssetStatus) => void;
  save: (assetId: string, isNew: boolean) => Promise<boolean>;
}

export function useAssetDetail(): AssetDetailState & AssetDetailActions {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<AssetStatus>(AssetStatus.AVAILABLE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAsset = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const asset: Asset = await getAsset(id);
      setName(asset.name);
      setSku(asset.sku);
      setDescription(asset.description ?? "");
      setAssignedTo(asset.assignedTo ?? "");
      setStatus(asset.status);
    } catch (err: any) {
      setError("Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const save = async (assetId: string, isNew: boolean): Promise<boolean> => {
    if (!name.trim() || !sku.trim()) return false;
    setIsSaving(true);
    setError(null);
    try {
      const payload: CreateAssetRequest = {
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
        status,
      };
      if (isNew) {
        await createAsset(payload);
      } else {
        await updateAsset(assetId, payload);
      }
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Save failed");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    name,
    sku,
    description,
    assignedTo,
    status,
    isLoading,
    isSaving,
    error,
    loadAsset,
    setName,
    setSku,
    setDescription,
    setAssignedTo,
    setStatus,
    save,
  };
}

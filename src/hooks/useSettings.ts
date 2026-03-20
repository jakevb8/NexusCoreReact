import { useState, useCallback } from "react";
import auth from "@react-native-firebase/auth";
import { getMe, deleteAccount } from "../api";
import { getBackendChoice, setBackendChoice } from "../store/backend";
import { resetApiClient } from "../api";
import { AuthUser, BackendChoice } from "../models";

export interface SettingsState {
  me: AuthUser | null;
  isLoading: boolean;
  selectedBackend: BackendChoice;
  error: string | null;
  showDeleteConfirm: boolean;
  isDeletingAccount: boolean;
}

export interface SettingsActions {
  load: () => Promise<void>;
  handleSelectBackend: (choice: BackendChoice) => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleDeleteAccount: () => Promise<boolean>;
  setShowDeleteConfirm: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export function useSettings(): SettingsState & SettingsActions {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBackend, setSelectedBackend] = useState<BackendChoice>(BackendChoice.JS);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [meData, choice] = await Promise.all([getMe(), getBackendChoice()]);
      setMe(meData);
      setSelectedBackend(choice);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectBackend = async (choice: BackendChoice) => {
    setSelectedBackend(choice);
    await setBackendChoice(choice);
    resetApiClient();
  };

  const handleSignOut = async () => {
    resetApiClient();
    await auth().signOut();
  };

  const handleDeleteAccount = async (): Promise<boolean> => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      resetApiClient();
      await auth().signOut();
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete account. Please try again.");
      setShowDeleteConfirm(false);
      return false;
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return {
    me,
    isLoading,
    selectedBackend,
    error,
    showDeleteConfirm,
    isDeletingAccount,
    load,
    handleSelectBackend,
    handleSignOut,
    handleDeleteAccount,
    setShowDeleteConfirm,
    setError,
  };
}

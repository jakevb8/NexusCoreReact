import AsyncStorage from "@react-native-async-storage/async-storage";
import { BackendChoice, BACKEND_CONFIG } from "../models";

const BACKEND_KEY = "selected_backend";

export async function getBackendChoice(): Promise<BackendChoice> {
  try {
    const stored = await AsyncStorage.getItem(BACKEND_KEY);
    if (stored === BackendChoice.DOTNET) return BackendChoice.DOTNET;
    return BackendChoice.JS;
  } catch {
    return BackendChoice.JS;
  }
}

export async function setBackendChoice(choice: BackendChoice): Promise<void> {
  await AsyncStorage.setItem(BACKEND_KEY, choice);
}

export function getBaseUrl(choice: BackendChoice): string {
  return BACKEND_CONFIG[choice].baseUrl;
}

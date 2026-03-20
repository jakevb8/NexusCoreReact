import { useState, useCallback } from "react";
import { getReports } from "../api";
import { ReportsData } from "../models";

export interface ReportsState {
  data: ReportsData | null;
  isLoading: boolean;
  error: string | null;
}

export interface ReportsActions {
  load: () => Promise<void>;
}

export function useReports(): ReportsState & ReportsActions {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReports();
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, load };
}

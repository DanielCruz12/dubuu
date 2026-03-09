"use client";

import { useState, useEffect, useCallback } from "react";
import type { PanelSummary } from "@/types/panel";
import { urlWithLocale } from "@/redux/url-with-locale";

const API_URL = "/backend/api/v1/panel/summary";

export function usePanelSummary(userId: string | undefined, token: string | null) {
  const [data, setData] = useState<PanelSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = urlWithLocale(`${API_URL}/${userId}`);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as PanelSummary;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to fetch panel summary"));
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
}

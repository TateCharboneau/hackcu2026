"use client";
import { useState, useCallback, useEffect } from "react";
import type {
  AnalyzeResponse,
  SimulateResponse,
  AnalysisDocument,
} from "@/types/trade";

/** Hook to make post requests to api routes*/

function usePost<TBody, TResponse>(url: string) {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    async (body: TBody): Promise<TResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!res.ok) {
          const message = json?.error ?? `HTTP ${res.status}`;
          setError(message);
          return null;
        }

        setData(json);
        return json as TResponse;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [url],
  );

  return { trigger, data, isLoading, error };
}

/** Parse + flag raw text or a video URL. */
export function useAnalyze() {
  return usePost<
    { text?: string; url?: string },
    AnalyzeResponse
  >("/api/analyze");
}

/** Run a Monte Carlo simulation on a previously-analyzed document. */

export function useSimulate() {
  return usePost<
    { id: string; numSims?: number },
    SimulateResponse
  >("/api/simulate");
}

/** Fetch the list of past analyses. Call `refresh()` to re-fetch. */
export function useHistory(limit = 50) {
  const [items, setItems] = useState<AnalysisDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?limit=${limit}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? `HTTP ${res.status}`);
        return;
      }
      setItems(json.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, isLoading, error, refresh };
}

/**
 * Fetch a single analysis by id.
 * Returns `item: null` (with no error) when the document doesn't exist or
 * belongs to a different user — the server intentionally gives a 404 in both
 * cases to avoid leaking ownership information.
 */
export function useAnalysis(id: string | null) {
  const [item, setItem] = useState<AnalysisDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/history/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (res.status === 404) {
          // Not found or not owned — return null without setting an error
          setItem(null);
        } else if (!res.ok) {
          setError(json?.error ?? `HTTP ${res.status}`);
        } else {
          setItem(json.item ?? null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Network error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, isLoading, error };
}

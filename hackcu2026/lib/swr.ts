"use client";
import { useState, useCallback } from "react";
import type { AnalyzeResponse, SimulateResponse, ParsedTrade } from "@/types/trade";

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

/** Run a Monte Carlo simulation on a parsed trade. */

export function useSimulate() {
  return usePost<
    { parsedTrade: ParsedTrade; numSims?: number },
    SimulateResponse
  >("/api/simulate");
}

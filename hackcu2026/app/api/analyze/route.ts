/**
 * POST /api/analyze
 *
 * Accepts: { text: string }
 * Returns: AnalyzeResponse
 *
 * Pipeline:
 *   1. Parse free-text → structured ParsedTrade (LLM)
 *   2. Detect red flags (deterministic)
 *   3. Generate explanation (LLM)
 *   4. Backfill currentPrice from market data
 */

import { NextRequest, NextResponse } from "next/server";
import { parseTrade, explainTrade } from "@/lib/parser";
import { detectFlags } from "@/lib/flags";
import { getCurrentPrice } from "@/lib/marketData";
import type { AnalyzeResponse } from "@/types/trade";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText: string = body?.text?.trim();

    if (!rawText) {
      return NextResponse.json(
        { error: "Missing 'text' field in request body." },
        { status: 400 },
      );
    }

    // 1. LLM parse
    const parsedTrade = await parseTrade(rawText);

    // 2. Deterministic red-flag scan
    const flags = detectFlags(rawText);

    // 3. Backfill real current price
    try {
      parsedTrade.currentPrice = await getCurrentPrice(parsedTrade.ticker);
    } catch {
      // Non-fatal — simulation will use synthetic data
      console.warn(
        `[analyze] Could not fetch price for ${parsedTrade.ticker}`,
      );
    }

    // 4. Generate explanation (runs in parallel-safe fashion)
    const explanation = await explainTrade(rawText, parsedTrade);

    const response: AnalyzeResponse = {
      rawText,
      parsedTrade,
      flags,
      explanation,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[analyze] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

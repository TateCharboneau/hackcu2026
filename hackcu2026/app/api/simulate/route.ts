/**
 * POST /api/simulate
 *
 * Accepts: { parsedTrade: ParsedTrade, numSims?: number }
 * Returns: SimulateResponse
 *
 * Runs the Monte Carlo bootstrap simulation and returns
 * summary stats, ending values, and sample paths.
 */

import { NextRequest, NextResponse } from "next/server";
import { runSimulation } from "@/lib/simulation";
import type { ParsedTrade, SimulateResponse } from "@/types/trade";

const MAX_SIMS = 10_000;
const DEFAULT_SIMS = 2000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedTrade: ParsedTrade | undefined = body?.parsedTrade;
    const numSims: number = Math.min(
      body?.numSims ?? DEFAULT_SIMS,
      MAX_SIMS,
    );

    if (!parsedTrade || !parsedTrade.ticker || !parsedTrade.strategyType) {
      return NextResponse.json(
        { error: "Missing or invalid 'parsedTrade' in request body." },
        { status: 400 },
      );
    }

    const simulation = await runSimulation(parsedTrade, numSims);

    const response: SimulateResponse = { simulation };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[simulate] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

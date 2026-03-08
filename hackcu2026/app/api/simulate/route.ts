/**
 * POST /api/simulate
 *
 * Accepts: { id: string }   — the Analysis document ID from /api/analyze
 * Returns: SimulateResponse  ({ id })
 *
 * Loads the parsedTrade from the DB, runs the Monte Carlo simulation,
 * saves the result back into the same document, and returns the ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Analysis from "@/models/Analysis";
import { runSimulation } from "@/lib/simulation";
import type { SimulateResponse } from "@/types/trade";
import mongoose from "mongoose";

const MAX_SIMS = 10_000;
const DEFAULT_SIMS = 2000;

export async function POST(req: NextRequest) {
  try {
    /* ── Auth ──────────────────────────────────────────────── */
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const id: string | undefined = body?.id;
    const numSims: number = Math.min(body?.numSims ?? DEFAULT_SIMS, MAX_SIMS);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Missing or invalid 'id' in request body." },
        { status: 400 },
      );
    }

    /* ── Load analysis from DB (ownership check) ──────────── */
    await connectDB();
    const doc = await Analysis.findOne({ _id: id, email });

    if (!doc) {
      return NextResponse.json(
        { error: "Analysis not found." },
        { status: 404 },
      );
    }

    const parsedTrade = doc.parsedTrade;
    if (!parsedTrade?.ticker || !parsedTrade?.strategyType) {
      return NextResponse.json(
        { error: "Analysis document has an incomplete parsedTrade." },
        { status: 400 },
      );
    }

    /* ── Run simulation ───────────────────────────────────── */
    const simulation = await runSimulation(parsedTrade, numSims);

    /* ── Persist simulation result back to the same doc ───── */
    doc.simulationResult = simulation;
    await doc.save();

    const response: SimulateResponse = { id: doc._id.toString() };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[simulate] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

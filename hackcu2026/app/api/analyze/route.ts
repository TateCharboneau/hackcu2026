/**
 * POST /api/analyze
 *
 * Accepts (one of):
 *   { text: string }           — plain text input
 *   { url: string }            — video URL (YouTube Shorts, TikTok, Instagram Reel)
 *   multipart/form-data        — direct audio file upload (field name: "audio")
 *
 * Returns: AnalyzeResponse  ({ id, isFinancial, rawText, parsedTrade?, flags, explanation })
 *
 * Pipeline:
 *   0. Resolve rawText from text | url | audio upload
 *   1. Parse free-text → structured ParsedTrade (LLM)  — returns null if not financial
 *   2. Detect red flags (deterministic)
 *   3. Resolve ticker if needed
 *   4. Backfill currentPrice from market data
 *   5. Generate explanation (LLM)
 *   6. Save to MongoDB and return the document ID
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import Analysis from "@/models/Analysis";
import { parseTrade, explainTrade } from "@/lib/parser";
import { detectFlags } from "@/lib/flags";
import { getCurrentPrice, resolveTickerFromName } from "@/lib/marketData";
import { transcribeFromUrl, transcribeBuffer } from "@/lib/transcribe";
import type { AnalyzeResponse } from "@/types/trade";

export async function POST(req: NextRequest) {
  try {
    /* ── Auth ─────────────────────────────────────────────── */
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    /* ── Resolve rawText ──────────────────────────────────── */
    let rawText = "";
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const audioFile = form.get("audio");

      if (!audioFile || typeof audioFile === "string") {
        return NextResponse.json(
          { error: "Expected an 'audio' file in the form data." },
          { status: 400 },
        );
      }

      const arrayBuffer = await (audioFile as File).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      rawText = await transcribeBuffer(buffer, (audioFile as File).name);
    } else {
      const body = await req.json();

      if (body?.url) {
        rawText = await transcribeFromUrl(body.url as string);
      } else if (body?.text) {
        rawText = (body.text as string).trim();
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: "Provide one of: 'text' (string), 'url' (video link), or an 'audio' file upload." },
        { status: 400 },
      );
    }

    /* ── 1. LLM parse (returns null if not financial) ───── */
    const parsedTrade = await parseTrade(rawText);

    if (!parsedTrade) {
      // Input is not financial advice — return early, nothing saved
      const response: AnalyzeResponse = {
        isFinancial: false,
        rawText,
        flags: [],
        explanation:
          "The input doesn't appear to contain financial advice or a trade recommendation. Try pasting a stock tip, newsletter excerpt, or investing video URL.",
      };
      return NextResponse.json(response);
    }

    /* ── 2. Ticker resolution ─────────────────────────────── */
    if (parsedTrade.ticker === "UNKNOWN" && parsedTrade.companyName) {
      const resolved = await resolveTickerFromName(parsedTrade.companyName);
      if (resolved) {
        console.log(
          `[analyze] Resolved "${parsedTrade.companyName}" → ${resolved} via Yahoo search`,
        );
        parsedTrade.ticker = resolved;
        parsedTrade.assumptions.push(
          `Ticker ${resolved} resolved from company name "${parsedTrade.companyName}" via market data search`,
        );
      } else {
        parsedTrade.ticker = "SPY";
        parsedTrade.assumptions.push(
          `Could not resolve ticker for "${parsedTrade.companyName}" — defaulted to SPY`,
        );
      }
    }

    /* ── 3. Deterministic red-flag scan ───────────────────── */
    const flags = detectFlags(rawText);

    /* ── 4. Backfill current price ────────────────────────── */
    try {
      parsedTrade.currentPrice = await getCurrentPrice(parsedTrade.ticker);
    } catch {
      console.warn(`[analyze] Could not fetch price for ${parsedTrade.ticker}`);
    }

    /* ── 5. Generate explanation ──────────────────────────── */
    const explanation = await explainTrade(rawText, parsedTrade);

    /* ── 6. Persist to MongoDB ────────────────────────────── */
    await connectDB();
    const doc = await Analysis.create({
      email,
      rawText,
      parsedTrade,
      flags,
      explanation,
      // simulationResult intentionally omitted — filled by /api/simulate
    });

    const response: AnalyzeResponse = {
      isFinancial: true,
      id: doc._id.toString(),
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

/* ── Shared types for the entire pipeline ── */

export type AssetType = "stock" | "option";

export type StrategyType =
  | "long_stock"
  | "short_stock"
  | "long_call"
  | "long_put";

export type Direction = "bullish" | "bearish";

/** Structured representation of a trade extracted from free text. */
export interface ParsedTrade {
  ticker: string;
  /** Raw company name as mentioned in the source text, before ticker resolution. */
  companyName?: string;
  assetType: AssetType;
  strategyType: StrategyType;
  direction: Direction;
  capital: number;
  horizonDays: number;
  strikePrice?: number;
  currentPrice?: number;
  premiumPerContract?: number;
  contracts?: number;
  confidencePhrases: string[];
  assumptions: string[];
}

/** A single red-flag detected in the input text. */
export interface Flag {
  phrase: string;
  severity: "low" | "medium" | "high";
  reason: string;
}

/** Summary statistics from the Monte Carlo simulation. */
export interface SimulationSummary {
  probProfit: number;
  meanEndingValue: number;
  medianEndingValue: number;
  p5: number;
  p25: number;
  p75: number;
  p95: number;
  maxLoss: number;
  maxGain: number;
}

/** Full simulation result returned to the frontend. */
export interface SimulationResult {
  summary: SimulationSummary;
  /** Final portfolio value for every simulation run. */
  endingValues: number[];
  /** A handful of representative price paths for charting. */
  samplePaths: number[][];
}

/** Shape of the /api/analyze response. */
export interface AnalyzeResponse {
  rawText: string;
  parsedTrade: ParsedTrade;
  flags: Flag[];
  explanation: string;
}

/** Shape of the /api/simulate request body. */
export interface SimulateRequest {
  parsedTrade: ParsedTrade;
}

/** Shape of the /api/simulate response. */
export interface SimulateResponse {
  simulation: SimulationResult;
}

/** Full analysis document stored in MongoDB. */
export interface AnalysisDocument {
  rawText: string;
  parsedTrade: ParsedTrade;
  flags: Flag[];
  simulationResult?: SimulationResult;
  createdAt: Date;
}

/**
 * Monte Carlo simulation engine.
 *
 * Uses historical-bootstrap: randomly sample real daily returns
 * (with replacement) to build synthetic price paths, then compute
 * the payoff for the chosen strategy.
 *
 * Everything runs in plain TypeScript — no Python needed.
 */

import type {
  ParsedTrade,
  SimulationResult,
  SimulationSummary,
} from "@/types/trade";
import {
  computeDailyReturns,
  getCurrentPrice,
  getHistoricalPrices,
} from "./marketData";

/* ── Config ─────────────────────────────────────────────── */
const DEFAULT_NUM_SIMS = 2000;
const NUM_SAMPLE_PATHS = 15; // paths to send to the chart

/* ── Public entry point ─────────────────────────────────── */

export async function runSimulation(
  trade: ParsedTrade,
  numSims: number = DEFAULT_NUM_SIMS,
): Promise<SimulationResult> {
  // 1. Get market data
  const bars = await getHistoricalPrices(trade.ticker);
  const dailyReturns = computeDailyReturns(bars);

  if (dailyReturns.length < 20) {
    throw new Error("Not enough historical data to simulate.");
  }

  // Ensure currentPrice is populated
  const currentPrice =
    trade.currentPrice ?? (await getCurrentPrice(trade.ticker));

  // 2. Build price paths via bootstrap
  const { paths, terminalPrices } = bootstrapPricePaths(
    dailyReturns,
    currentPrice,
    trade.horizonDays,
    numSims,
  );

  // 3. Compute payoff for each path
  const endingValues = terminalPrices.map((terminalPrice) =>
    computePayoff(trade, currentPrice, terminalPrice),
  );

  // 4. Compute summary statistics
  const summary = computeSummary(endingValues, trade.capital);

  // 5. Pick a handful of sample paths converted to portfolio value
  const samplePaths = pickSamplePaths(
    paths,
    trade,
    currentPrice,
    NUM_SAMPLE_PATHS,
  );

  return { summary, endingValues, samplePaths };
}

/* ── Bootstrap ──────────────────────────────────────────── */

function bootstrapPricePaths(
  dailyReturns: number[],
  startPrice: number,
  horizonDays: number,
  numSims: number,
): { paths: number[][]; terminalPrices: number[] } {
  const paths: number[][] = [];
  const terminalPrices: number[] = [];

  for (let s = 0; s < numSims; s++) {
    const path: number[] = [startPrice];
    let price = startPrice;

    for (let d = 0; d < horizonDays; d++) {
      const idx = Math.floor(Math.random() * dailyReturns.length);
      const r = dailyReturns[idx];
      price *= Math.exp(r); // convert log return back to price move
      path.push(Math.round(price * 100) / 100);
    }

    paths.push(path);
    terminalPrices.push(price);
  }

  return { paths, terminalPrices };
}

/* ── Payoff calculation per strategy ────────────────────── */

function computePayoff(
  trade: ParsedTrade,
  entryPrice: number,
  terminalPrice: number,
): number {
  const capital = trade.capital;

  switch (trade.strategyType) {
    /* ── Long stock ─────────────────────────────────────── */
    case "long_stock": {
      const shares = capital / entryPrice;
      return Math.round(shares * terminalPrice * 100) / 100;
    }

    /* ── Short stock ────────────────────────────────────── */
    case "short_stock": {
      const shares = capital / entryPrice;
      const pnl = shares * (entryPrice - terminalPrice);
      // Can't lose more than, say, 3x capital in our sim
      const endingValue = Math.max(capital + pnl, -2 * capital);
      return Math.round(endingValue * 100) / 100;
    }

    /* ── Long call ──────────────────────────────────────── */
    case "long_call": {
      const strike = trade.strikePrice ?? entryPrice; // ATM default
      // Rough premium: ~5% of underlying for ATM 30-day call
      const premium =
        trade.premiumPerContract ?? Math.round(entryPrice * 0.05 * 100) / 100;
      const costPerContract = premium * 100;
      const contracts =
        trade.contracts ?? Math.max(1, Math.floor(capital / costPerContract));

      const payoffPerContract =
        Math.max(terminalPrice - strike, 0) * 100 - costPerContract;
      const totalPayoff = contracts * payoffPerContract;
      // You can't lose more than what you paid
      const endingValue = Math.max(capital + totalPayoff, 0);
      return Math.round(endingValue * 100) / 100;
    }

    /* ── Long put ───────────────────────────────────────── */
    case "long_put": {
      const strike = trade.strikePrice ?? entryPrice;
      const premium =
        trade.premiumPerContract ?? Math.round(entryPrice * 0.05 * 100) / 100;
      const costPerContract = premium * 100;
      const contracts =
        trade.contracts ?? Math.max(1, Math.floor(capital / costPerContract));

      const payoffPerContract =
        Math.max(strike - terminalPrice, 0) * 100 - costPerContract;
      const totalPayoff = contracts * payoffPerContract;
      const endingValue = Math.max(capital + totalPayoff, 0);
      return Math.round(endingValue * 100) / 100;
    }

    default:
      return capital; // fallback: no change
  }
}

/* ── Summary statistics ─────────────────────────────────── */

function computeSummary(
  endingValues: number[],
  capital: number,
): SimulationSummary {
  const sorted = [...endingValues].sort((a, b) => a - b);
  const n = sorted.length;

  const percentile = (p: number) => {
    const idx = Math.floor((p / 100) * n);
    return sorted[Math.min(idx, n - 1)];
  };

  const mean = endingValues.reduce((s, v) => s + v, 0) / n;
  const profitable = endingValues.filter((v) => v > capital).length;

  return {
    probProfit: Math.round((profitable / n) * 10000) / 10000,
    meanEndingValue: Math.round(mean * 100) / 100,
    medianEndingValue: percentile(50),
    p5: percentile(5),
    p25: percentile(25),
    p75: percentile(75),
    p95: percentile(95),
    maxLoss: Math.round((capital - sorted[0]) * 100) / 100,
    maxGain: Math.round((sorted[n - 1] - capital) * 100) / 100,
  };
}

/* ── Sample paths ───────────────────────────────────────── */

/**
 * Pick evenly-spaced paths from the sorted results so the chart
 * shows the full range of outcomes, not just random noise.
 */
function pickSamplePaths(
  allPaths: number[][],
  trade: ParsedTrade,
  entryPrice: number,
  count: number,
): number[][] {
  // Rank paths by terminal value
  const indexed = allPaths.map((path, i) => ({
    path,
    terminal: path[path.length - 1],
    i,
  }));
  indexed.sort((a, b) => a.terminal - b.terminal);

  const step = Math.max(1, Math.floor(indexed.length / count));
  const picked: number[][] = [];

  for (let k = 0; k < count && k * step < indexed.length; k++) {
    const pricePath = indexed[k * step].path;

    // Convert price path → portfolio-value path
    const valuePath = pricePath.map((price) =>
      computePayoff(trade, entryPrice, price),
    );
    picked.push(valuePath);
  }

  return picked;
}

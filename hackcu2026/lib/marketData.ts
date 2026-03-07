/**
 * Market data helpers.
 *
 * Uses the free Yahoo Finance v8 chart endpoint (no API key needed).
 * Results are cached in-memory for the lifetime of the server process so
 * we don't hammer the API during demo / judging.
 */

export interface HistoricalBar {
  date: string; // ISO date string
  close: number;
}

/* ── In-memory cache ────────────────────────────────────── */
const priceCache = new Map<string, { ts: number; bars: HistoricalBar[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/* ── Public API ─────────────────────────────────────────── */

/**
 * Fetch ~1 year of daily closing prices for `ticker`.
 * Falls back to a synthetic price series if the fetch fails (demo-safe).
 */
export async function getHistoricalPrices(
  ticker: string,
): Promise<HistoricalBar[]> {
  const key = ticker.toUpperCase();

  // Check cache
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.bars;
  }

  try {
    const bars = await fetchYahooChart(key);
    priceCache.set(key, { ts: Date.now(), bars });
    return bars;
  } catch (err) {
    console.warn(
      `[marketData] Failed to fetch ${key}, using synthetic data:`,
      err,
    );
    const bars = generateSyntheticBars(key);
    priceCache.set(key, { ts: Date.now(), bars });
    return bars;
  }
}

/**
 * Get the latest closing price for a ticker.
 */
export async function getCurrentPrice(ticker: string): Promise<number> {
  const bars = await getHistoricalPrices(ticker);
  return bars[bars.length - 1].close;
}

/**
 * Compute array of daily log-returns from a bar series.
 */
export function computeDailyReturns(bars: HistoricalBar[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    returns.push(Math.log(bars[i].close / bars[i - 1].close));
  }
  return returns;
}

/* ── Yahoo Finance chart endpoint ───────────────────────── */

async function fetchYahooChart(ticker: string): Promise<HistoricalBar[]> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}` +
    `?range=1y&interval=1d&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo returned ${res.status}`);
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];

  if (!result) throw new Error("No chart result");

  const timestamps: number[] = result.timestamp;
  const closes: number[] =
    result.indicators?.quote?.[0]?.close ?? [];

  const bars: HistoricalBar[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      bars.push({
        date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10),
        close: closes[i],
      });
    }
  }

  if (bars.length < 30) {
    throw new Error(`Only got ${bars.length} bars — not enough data`);
  }

  return bars;
}

/* ── Synthetic fallback (demo-safe) ─────────────────────── */

function generateSyntheticBars(ticker: string): HistoricalBar[] {
  // Deterministic-ish seed from ticker name
  let seed = 0;
  for (const ch of ticker) seed += ch.charCodeAt(0);
  const rng = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return seed / 2147483647;
  };

  const bars: HistoricalBar[] = [];
  let price = 100 + rng() * 400; // start between 100-500

  const today = new Date();
  for (let i = 252; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Random walk with slight upward drift
    const dailyReturn = (rng() - 0.48) * 0.03;
    price *= 1 + dailyReturn;
    price = Math.max(price, 1); // floor at $1
    bars.push({
      date: d.toISOString().slice(0, 10),
      close: Math.round(price * 100) / 100,
    });
  }

  return bars;
}

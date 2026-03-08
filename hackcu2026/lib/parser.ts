/**
 * LLM-powered trade parser.
 *
 * Sends the raw user text to an LLM and gets back a structured ParsedTrade.
 * Currently uses OpenAI's chat completions API (gpt-4o-mini for speed/cost).
 *
 * Set OPENAI_API_KEY in your .env.local file.
 */

import type { ParsedTrade } from "@/types/trade";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are a financial trade parser. The user will give you a piece of investing advice or a trade idea in casual language.

IMPORTANT: If the text does NOT contain any financial advice, trade idea, stock pick, or investment recommendation, return ONLY this JSON:
{"notFinancial": true}

Otherwise, extract structured trade information and return ONLY valid JSON matching this exact schema — no markdown, no explanation, no wrapping:

{
  "ticker": string,            // uppercase ticker symbol, e.g. "TSLA" — use your best guess; if unsure use "UNKNOWN"
  "companyName": string,       // the raw company/asset name as mentioned in the text, e.g. "Tesla"
  "assetType": "stock" | "option",
  "strategyType": "long_stock" | "short_stock" | "long_call" | "long_put",
  "direction": "bullish" | "bearish",
  "capital": number,           // dollar amount being risked
  "horizonDays": number,       // investment horizon in days (default 30 if not stated)
  "strikePrice": number | null,
  "currentPrice": null,        // always null — will be filled from market data
  "premiumPerContract": null,  // always null — will be estimated
  "contracts": null,           // always null — will be calculated
  "confidencePhrases": string[],  // exact phrases from the input that express certainty/hype
  "assumptions": string[]      // list of assumptions you made to fill in missing info
}

Rules:
- If the user mentions "options", "calls", or bullish language → long_call
- If the user mentions "puts" or bearish language → long_put
- If the user says "short" → short_stock (unless puts are mentioned → long_put)
- If no derivatives are mentioned → long_stock
- If no dollar amount is stated, assume $1000
- If no timeframe is stated, assume 30 days
- Always populate "companyName" with the raw name of the company/asset mentioned (e.g. "Tesla", "Nvidia", "Bitcoin")
- For "ticker": convert well-known company names to their NYSE/NASDAQ symbol (e.g. "Tesla" → "TSLA", "Apple" → "AAPL", "Nvidia" → "NVDA", "Google" → "GOOGL", "Amazon" → "AMZN", "Microsoft" → "MSFT", "Meta" → "META"). If you are not confident about the ticker, set ticker to "UNKNOWN" — do NOT guess or use SPY as a fallback.
- Extract ANY hype/confidence phrases verbatim into confidencePhrases
- List every assumption you made in the assumptions array
- Return ONLY the JSON object, nothing else`;

export async function parseTrade(rawText: string): Promise<ParsedTrade | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[parser] No OPENAI_API_KEY found — returning mock parse");
    return mockParse(rawText);
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: rawText },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[parser] OpenAI error:", res.status, body);
    throw new Error(`LLM request failed (${res.status})`);
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content ?? "";

  // Strip possible markdown code fences
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    // LLM signals the input isn't financial advice
    if (parsed.notFinancial) return null;
    return sanitizeParsedTrade(parsed as Partial<ParsedTrade>);
  } catch {
    console.error("[parser] Failed to parse LLM JSON:", cleaned);
    throw new Error("LLM returned invalid JSON");
  }
}

/**
 * Generate a short, plain-English explanation of the trade + any assumptions.
 */
export async function explainTrade(
  rawText: string,
  trade: ParsedTrade,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return `We interpreted your input as a ${trade.strategyType.replace(/_/g, " ")} on ${trade.ticker} with $${trade.capital} over ${trade.horizonDays} days.`;
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are a concise financial educator. Given the original advice text and the parsed trade JSON, write 2-3 sentences explaining what the trade actually is, what assumptions were made, and what the user should know. Be direct and slightly cautionary. Do not use markdown.",
        },
        {
          role: "user",
          content: `Original text: "${rawText}"\n\nParsed trade: ${JSON.stringify(trade)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    return `We interpreted this as a ${trade.strategyType.replace(/_/g, " ")} on ${trade.ticker} with $${trade.capital}.`;
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

/* ── Helpers ────────────────────────────────────────────── */

function sanitizeParsedTrade(raw: Partial<ParsedTrade>): ParsedTrade {
  return {
    ticker: (raw.ticker ?? "UNKNOWN").toUpperCase(),
    companyName: raw.companyName ?? undefined,
    assetType: raw.assetType ?? "stock",
    strategyType: raw.strategyType ?? "long_stock",
    direction: raw.direction ?? "bullish",
    capital: raw.capital ?? 1000,
    horizonDays: raw.horizonDays ?? 30,
    strikePrice: raw.strikePrice ?? undefined,
    currentPrice: raw.currentPrice ?? undefined,
    premiumPerContract: raw.premiumPerContract ?? undefined,
    contracts: raw.contracts ?? undefined,
    confidencePhrases: raw.confidencePhrases ?? [],
    assumptions: raw.assumptions ?? [],
  };
}

/* ── Mock parser (no API key) ───────────────────────────── */

function mockParse(text: string): ParsedTrade {
  const lower = text.toLowerCase();

  // Try to find a ticker
  const tickerMatch = text.match(
    /\b([A-Z]{1,5})\b/,
  );
  const ticker = tickerMatch?.[1] ?? "SPY";

  // Try to find a dollar amount
  const amountMatch = text.match(/\$?([\d,]+)k?\b/i);
  let capital = 1000;
  if (amountMatch) {
    capital = parseFloat(amountMatch[1].replace(/,/g, ""));
    if (lower.includes("k") && capital < 1000) capital *= 1000;
  }

  // Detect strategy
  let strategyType: ParsedTrade["strategyType"] = "long_stock";
  let assetType: ParsedTrade["assetType"] = "stock";
  let direction: ParsedTrade["direction"] = "bullish";

  if (lower.includes("put") || lower.includes("puts")) {
    strategyType = "long_put";
    assetType = "option";
    direction = "bearish";
  } else if (
    lower.includes("call") ||
    lower.includes("calls") ||
    lower.includes("option")
  ) {
    strategyType = "long_call";
    assetType = "option";
    direction = "bullish";
  } else if (lower.includes("short")) {
    strategyType = "short_stock";
    direction = "bearish";
  }

  // Extract hype phrases
  const hypePatterns = [
    /guaranteed\s+\w+/gi,
    /no\s+risk/gi,
    /can'?t\s+lose/gi,
    /all\s+in/gi,
    /to\s+the\s+moon/gi,
    /free\s+money/gi,
    /yolo/gi,
    /trust\s+me/gi,
  ];
  const confidencePhrases: string[] = [];
  for (const p of hypePatterns) {
    const m = text.match(p);
    if (m) confidencePhrases.push(...m);
  }

  return {
    ticker,
    assetType,
    strategyType,
    direction,
    capital,
    horizonDays: 30,
    confidencePhrases,
    assumptions: [
      "Horizon defaulted to 30 days",
      assetType === "option" ? "Strike assumed at-the-money" : "",
      assetType === "option"
        ? "Premium estimated at ~5% of underlying price"
        : "",
      `Capital interpreted as $${capital}`,
    ].filter(Boolean),
  };
}

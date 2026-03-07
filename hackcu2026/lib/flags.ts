import type { Flag } from "@/types/trade";

/**
 * Deterministic red-flag detector.
 * Scans the raw user input for hype / scam / overconfidence language.
 */

interface FlagRule {
  pattern: RegExp;
  severity: Flag["severity"];
  reason: string;
}

const RULES: FlagRule[] = [
  {
    pattern: /guaranteed\s+(win|profit|return|money|gains?)/i,
    severity: "high",
    reason: "No investment outcome is guaranteed. This is a common phrase in scams.",
  },
  {
    pattern: /no\s+risk/i,
    severity: "high",
    reason: "Every investment carries risk. Claims of zero risk are a red flag.",
  },
  {
    pattern: /can'?t\s+lose/i,
    severity: "high",
    reason: "Any trade can lose money. This phrase signals dangerous overconfidence.",
  },
  {
    pattern: /insider\s+(tip|info|knowledge)/i,
    severity: "high",
    reason: "Trading on insider information is illegal and claims of it are a red flag.",
  },
  {
    pattern: /\ball\s*in\b/i,
    severity: "high",
    reason:
      "Putting all capital into a single position is extreme concentration risk.",
  },
  {
    pattern: /max(imum)?\s+leverage/i,
    severity: "high",
    reason: "Maximum leverage amplifies losses as much as gains.",
  },
  {
    pattern: /penny\s+stock/i,
    severity: "medium",
    reason:
      "Penny stocks are highly volatile and often targets of pump-and-dump schemes.",
  },
  {
    pattern: /once\s+in\s+a\s+lifetime/i,
    severity: "medium",
    reason:
      "Urgency-based language is a common manipulation tactic.",
  },
  {
    pattern: /100%\s+(sure|certain|guaranteed)/i,
    severity: "high",
    reason: "Nothing in investing is 100% certain.",
  },
  {
    pattern: /short\s+the\s+market/i,
    severity: "medium",
    reason:
      "Shorting the entire market is a high-risk directional bet with unlimited downside.",
  },
  {
    pattern: /free\s+money/i,
    severity: "high",
    reason: "There is no such thing as free money in financial markets.",
  },
  {
    pattern: /yolo/i,
    severity: "medium",
    reason: "YOLO trades are by definition reckless and unplanned.",
  },
  {
    pattern: /to\s+the\s+moon/i,
    severity: "low",
    reason:
      'Hype language like "to the moon" suggests speculation rather than analysis.',
  },
  {
    pattern: /can'?t\s+go\s+(wrong|tits\s+up)/i,
    severity: "high",
    reason: "Any trade can go wrong. Overconfidence is a risk factor.",
  },
  {
    pattern: /double\s+your\s+money/i,
    severity: "medium",
    reason:
      "Promises of doubling money quickly are a hallmark of scams.",
  },
  {
    pattern: /trust\s+me/i,
    severity: "medium",
    reason: "\"Trust me\" is persuasion, not analysis.",
  },
];

/**
 * Run all deterministic flag rules against the raw user text.
 * Returns de-duplicated flags ordered by severity (high → low).
 */
export function detectFlags(text: string): Flag[] {
  const found: Flag[] = [];

  for (const rule of RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      found.push({
        phrase: match[0],
        severity: rule.severity,
        reason: rule.reason,
      });
    }
  }

  const order: Record<Flag["severity"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  found.sort((a, b) => order[a.severity] - order[b.severity]);
  return found;
}

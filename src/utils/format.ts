// ─────────────────────────────────────────────────────────────
// Number & currency formatting helpers
// ─────────────────────────────────────────────────────────────

/**
 * Format a number as currency.
 * @param value      The numeric value (can be negative).
 * @param options    Optional flags.
 * @returns          e.g. "$1,234.56", "-$12.00", "+$99.00"
 */
export function formatCurrency(
  value: number,
  options: { showSign?: boolean; compact?: boolean } = {},
): string {
  const { showSign = false, compact = false } = options;

  const abs = Math.abs(value);

  if (compact && abs >= 1000) {
    // 1.2K, 3.4M
    const units = [
      { v: 1_000_000_000, s: "B" },
      { v: 1_000_000, s: "M" },
      { v: 1_000, s: "K" },
    ];
    for (const u of units) {
      if (abs >= u.v) {
        const short = (abs / u.v).toFixed(abs / u.v >= 10 ? 0 : 1);
        return `${value < 0 ? "-" : showSign ? "+" : ""}$${short}${u.s}`;
      }
    }
  }

  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = value < 0 ? "-" : showSign && value > 0 ? "+" : "";
  return `${sign}$${formatted}`;
}

/**
 * Format a number with thousand separators, no currency symbol.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Safely parse a user-typed amount string like "12.5" or "1,200.00".
 * Returns NaN on invalid input.
 */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned);
}

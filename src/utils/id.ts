// ─────────────────────────────────────────────────────────────
// Unique ID generator — no external dependency needed
// ─────────────────────────────────────────────────────────────

/**
 * Generate a reasonably unique ID.
 * Combines timestamp + random base-36 chunks.
 *
 * Example: "lkz2x9k1-8f3a2b"
 */
export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand1 = Math.random().toString(36).slice(2, 8);
  const rand2 = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand1}${rand2}`;
}

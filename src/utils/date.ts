// ─────────────────────────────────────────────────────────────
// Date helpers for grouping & formatting transactions
// (month names and AM/PM follow the active app language)
// ─────────────────────────────────────────────────────────────

import { getCurrentLanguage, tr } from "@utils/i18n";

const MONTHS_SHORT = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  am: [
    "ጃንዩ",
    "ፌብሩ",
    "ማርች",
    "ኤፕሪ",
    "ሜይ",
    "ጁን",
    "ጁላይ",
    "ኦገስ",
    "ሴፕቴ",
    "ኦክቶ",
    "ኖቬም",
    "ዲሴም",
  ],
};

const MONTHS_LONG = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  am: [
    "ጃንዋሪ",
    "ፌብሩዋሪ",
    "ማርች",
    "ኤፕሪል",
    "ሜይ",
    "ጁን",
    "ጁላይ",
    "ኦገስት",
    "ሴፕቴምበር",
    "ኦክቶበር",
    "ኖቬምበር",
    "ዲሴምበር",
  ],
};

const shortMonths = () => MONTHS_SHORT[getCurrentLanguage()];
const longMonths = () => MONTHS_LONG[getCurrentLanguage()];

/** Return "YYYY-MM" key for a given date */
export function toMonthKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** "Jan 15, 2025" */
export function formatDateLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${shortMonths()[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Jan 15" */
export function formatDayLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${shortMonths()[d.getMonth()]} ${d.getDate()}`;
}

/** "January 2025" */
export function formatMonthLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${longMonths()[d.getMonth()]} ${d.getFullYear()}`;
}

/** "3:45 PM" (English) / "3:45 ከሰዓት" (Amharic) from an ISO string */
export function formatTimeLabel(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${h12}:${mm} ${tr(h >= 12 ? "time.pm" : "time.am")}`;
}

/** "Jan" for a given YYYY-MM key */
export function monthKeyToShortLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return shortMonths()[m - 1];
}

/** True if both dates fall in the same calendar month */
export function isSameMonth(a: Date | string, b: Date | string): boolean {
  return toMonthKey(a) === toMonthKey(b);
}

/** True if both dates fall in the same calendar day */
export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** Start (first millisecond) of the current month */
export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Start (first millisecond) of today */
export function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Return the last N month keys (oldest → newest), including current */
export function lastNMonthKeys(n: number, from: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    keys.push(toMonthKey(d));
  }
  return keys;
}

/** Convert a `YYYY-MM-DD` string into a local `Date` without timezone drift */
export function dateFromYMD(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "YYYY-MM-DD" for the date picker input */
export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Dagens datum som YYYY-MM-DD i lokal tidszon. */
export function todayDateInputValue(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Konverterar YYYY-MM-DD till timestamptz (middag lokal ≈ lagras som UTC).
 * Ogiltigt datum → null.
 */
export function dateInputToCompletedAt(value: string | null | undefined): string | null {
  const v = (value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  return `${v}T12:00:00`;
}

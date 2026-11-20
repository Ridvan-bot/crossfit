/** Visningsnamn för WOD:er. `pass_number` i databasen styr ordning/historik. */

export function formatPassNumber(n: number): string {
  return String(n).padStart(3, "0");
}

export function defaultWodTitle(passNumber: number | null | undefined): string {
  if (passNumber == null || Number.isNaN(Number(passNumber))) return "WOD";
  return `WOD #${formatPassNumber(Number(passNumber))}`;
}

/** Generiska titlar som "Pass #020" / "WOD #020" räknas inte som smeknamn. */
const DEFAULT_TITLE_RE = /^(?:pass|wod)(?:\s*#?\s*\d+)?$/i;

export function wodNickname(
  title: string | null | undefined,
  passNumber?: number | null
): string | null {
  const t = title?.trim() ?? "";
  if (!t) return null;
  if (DEFAULT_TITLE_RE.test(t)) return null;
  if (passNumber != null && t === defaultWodTitle(passNumber)) return null;
  return t;
}

export function wodDisplayName(
  title: string | null | undefined,
  passNumber: number | null | undefined
): string {
  return wodNickname(title, passNumber) ?? defaultWodTitle(passNumber);
}

export function wodNumberLabel(
  passNumber: number | null | undefined
): string | null {
  if (passNumber == null || Number.isNaN(Number(passNumber))) return null;
  return defaultWodTitle(passNumber);
}

/** Sparad titel: smeknamn om det finns, annars WOD #NNN. */
export function resolveWodTitle(
  title: string | null | undefined,
  passNumber: number | null | undefined
): string {
  return wodNickname(title, passNumber) ?? defaultWodTitle(passNumber);
}

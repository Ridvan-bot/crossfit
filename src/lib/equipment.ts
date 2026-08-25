/** Katalog för valbar utrustning vid WOD-skapande. */
export const EQUIPMENT_CATALOG = [
  "Skivstång",
  "Vikter till stången",
  "Tom stång",
  "Kettlebell 20 kg",
  "Dumbbell 15 kg",
  "AbMat",
  "Hopprep",
  "Pull-up bar",
  "Ringar",
  "Box",
  "Wall-ball",
  "Roddmaskin",
  "BikeErg",
  "SkiErg",
  "Medicinboll",
  "Gummiband",
  "Ingen hopprep",
] as const;

export type EquipmentItem = (typeof EQUIPMENT_CATALOG)[number] | string;

const SEPARATOR = " · ";

export function formatEquipmentNotes(items: string[]): string {
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .join(SEPARATOR);
}

export function parseEquipmentNotes(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\s*[·|,;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function filterEquipmentCatalog(query: string, selected: string[]): string[] {
  const q = query.trim().toLowerCase();
  const selectedLower = new Set(selected.map((s) => s.toLowerCase()));
  return EQUIPMENT_CATALOG.filter((item) => {
    if (selectedLower.has(item.toLowerCase())) return false;
    if (!q) return true;
    return item.toLowerCase().includes(q);
  });
}

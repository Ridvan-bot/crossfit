/**
 * Katalog för valbar utrustning (profil).
 * Blandning av svenska namn och vedertagna CrossFit-termer.
 */
export const EQUIPMENT_CATALOG = [
  // Stång & vikter
  "Skivstång",
  "Teknikstång",
  "Tom stång",
  "Olympisk herrstång (20 kg)",
  "Olympisk damstång (15 kg)",
  "Vikter till stången",
  "Bumper plates",
  "Change plates (små vikter)",
  "Viktväst",
  "Chain / kedjor",
  "Resistance bands (stång)",

  // Hantlar & KB
  "Dumbbell 10 kg",
  "Dumbbell 12,5 kg",
  "Dumbbell 15 kg",
  "Dumbbell 17,5 kg",
  "Dumbbell 20 kg",
  "Dumbbell 22,5 kg",
  "Dumbbell 25 kg",
  "Par dumbbells",
  "Kettlebell 12 kg",
  "Kettlebell 16 kg",
  "Kettlebell 20 kg",
  "Kettlebell 24 kg",
  "Kettlebell 28 kg",
  "Kettlebell 32 kg",
  "Par kettlebells",

  // Gymnastik / rig
  "Pull-up bar",
  "Pull-up rig",
  "Ringar",
  "Ring straps",
  "Parallettes",
  "Pegboard",
  "Rope climb (rep)",
  "Climbing rope",

  // Box / plyo / jumps
  "Box",
  "Jerk blocks",
  "Plyo box (ställbar)",

  // Bollar
  "Wall-ball",
  "Wall-ball 6 kg",
  "Wall-ball 9 kg",
  "Medicinboll",
  "Medicinboll 4 kg",
  "Medicinboll 6 kg",
  "Medicinboll 9 kg",
  "Slam ball",
  "Soft medicine ball",

  // Monostructural
  "Hopprep",
  "Speed rope",
  "Roddmaskin",
  "Concept2 RowErg",
  "BikeErg",
  "SkiErg",
  "Assault Bike / AirBike",
  "Echo Bike",
  "Löpband",
  "Utomhuslöpning",
  "C2 Bike",

  // Core / GHD / matta
  "AbMat",
  "GHD",
  "Yogamatta",
  "Träningsmatta",

  // Carry / odd object
  "Farmer handles",
  "Yoke",
  "Sandbag",
  "D-ball",
  "Axle bar",
  "Log",
  "Sled / släde",
  "Prowler",
  "Tire / däck",
  "Atlas stone",

  // Tillbehör
  "Gummiband",
  "Mini bands",
  "Mobility bands",
  "Foam roller",
  "Lacrosseboll",
  "PVC-pipe (teknik)",
  "Chalk",
  "Magnesium",
  "Hand wraps / grips",
  "Knee sleeves",
  "Wrist wraps",
  "Bälte / lifting belt",
  "Timer / klocka",
  "Spegel",

  // Övrigt / begränsningar
  "Ingen hopprep",
  "Ingen rig",
  "Ingen rodd",
  "Hemmagym",
  "Boxgym",
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

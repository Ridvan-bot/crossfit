export type VoiceLift = {
  name: string;
  weight_kg: number | null;
};

export type ParsedSessionLog = {
  score_text: string | null;
  rpe_1_10: number | null;
  feeling_1_5: number | null;
  lifts: VoiceLift[];
  transcript: string;
};

const ONES: [string, number][] = [
  ["noll", 0],
  ["ett", 1],
  ["en", 1],
  ["tva", 2],
  ["två", 2],
  ["tre", 3],
  ["fyra", 4],
  ["fem", 5],
  ["sex", 6],
  ["sju", 7],
  ["atta", 8],
  ["åtta", 8],
  ["nio", 9],
  ["tio", 10],
  ["elva", 11],
  ["tolv", 12],
  ["tretton", 13],
  ["fjorton", 14],
  ["femton", 15],
  ["sexton", 16],
  ["sjutton", 17],
  ["arton", 18],
  ["nitton", 19],
];

const TENS: [string, number][] = [
  ["tjugo", 20],
  ["trettio", 30],
  ["fyrtio", 40],
  ["femtio", 50],
  ["sextio", 60],
  ["sjuttio", 70],
  ["attio", 80],
  ["åttio", 80],
  ["nittio", 90],
];

const MOVEMENT_ALIASES: Record<string, string[]> = {
  "Front Squat": ["frontboj", "front boj", "front squatt"],
  "Back Squat": ["knaboj", "knäböj"],
  "Deadlift": ["marklyft", "dead lift"],
  "Hang Power Clean": ["hpc"],
  "Hang Power Snatch": ["hps"],
  "Shoulder Press": ["militarpress", "militärpress", "axelpress"],
  "Push-up": ["pushup", "push up", "armhavning", "armhävning", "armhavningar"],
  "Kettlebell Swing": ["kb swing", "kettlebell sving"],
  "Walking Lunge": ["utfall", "walking lunges"],
  "Overhead Squat": ["oh squat", "ohs"],
  "Thruster": ["thrusters"],
};

export function hasParsedSessionLog(parsed: ParsedSessionLog): boolean {
  return Boolean(
    parsed.score_text ||
      parsed.rpe_1_10 != null ||
      parsed.feeling_1_5 != null ||
      parsed.lifts.length > 0
  );
}

export function formatSessionLogSummary(parsed: ParsedSessionLog): string {
  const parts: string[] = [];
  if (parsed.score_text) parts.push(parsed.score_text);
  if (parsed.rpe_1_10 != null) parts.push(`RPE ${parsed.rpe_1_10}`);
  if (parsed.feeling_1_5 != null) parts.push(`känsla ${parsed.feeling_1_5}`);
  for (const lift of parsed.lifts) {
    parts.push(
      lift.weight_kg != null ? `${lift.name} ${lift.weight_kg} kg` : lift.name
    );
  }
  return parts.join(" · ");
}

export function parseSessionUtterance(
  transcript: string,
  knownMovements: readonly string[]
): ParsedSessionLog {
  const original = transcript.trim();
  let text = expandSwedishNumbers(normalizeSpeech(original));

  const rpeMatch = text.match(
    /\b(?:r\s*p\s*e|arpe|anstrangning)\s*(?:pa\s*)?(\d{1,2})\b/
  );
  let rpe_1_10: number | null = null;
  if (rpeMatch) {
    const n = Number(rpeMatch[1]);
    if (n >= 1 && n <= 10) rpe_1_10 = n;
    text = text.replace(rpeMatch[0], " ");
  }

  const feelingMatch = text.match(/\b(?:kansla|feeling)\s*(?:pa\s*)?(\d)\b/);
  let feeling_1_5: number | null = null;
  if (feelingMatch) {
    const n = Number(feelingMatch[1]);
    if (n >= 1 && n <= 5) feeling_1_5 = n;
    text = text.replace(feelingMatch[0], " ");
  }

  const { lifts, rest } = extractLifts(text, knownMovements);
  const score_text = extractScore(rest);

  return {
    score_text,
    rpe_1_10,
    feeling_1_5,
    lifts,
    transcript: original,
  };
}

function normalizeSpeech(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[–—]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandSwedishNumbers(text: string): string {
  const compounds: [string, number][] = [];
  for (const [tensWord, tensValue] of TENS) {
    for (const [oneWord, oneValue] of ONES) {
      if (oneValue >= 1 && oneValue <= 9) {
        compounds.push([`${tensWord}${oneWord}`, tensValue + oneValue]);
      }
    }
  }
  const all: [string, number][] = [
    ...compounds,
    ...TENS,
    ...ONES,
    ["hundra", 100],
  ];
  all.sort((a, b) => b[0].length - a[0].length);
  let out = ` ${text} `;
  for (const [word, n] of all) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "g"), ` ${n} `);
  }
  return out.replace(/\s+/g, " ").trim();
}

type Candidate = { name: string; pattern: string };

function extractLifts(
  text: string,
  knownMovements: readonly string[]
): { lifts: VoiceLift[]; rest: string } {
  const candidates = buildCandidates(knownMovements);
  let rest = ` ${text} `;
  const lifts: VoiceLift[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const pattern = escapeRegExp(candidate.pattern);
    const after = new RegExp(
      `(?:^| )(${pattern})(?: pa)? (\\d+(?:[.,]\\d+)?)(?: kg| kilo| kilon)?(?= |$)`
    );
    const before = new RegExp(
      `(?:^| )(\\d+(?:[.,]\\d+)?)(?: kg| kilo| kilon)?(?: pa)? (${pattern})(?= |$)`
    );

    let match = rest.match(after);
    let weightGroup = 2;
    if (!match) {
      match = rest.match(before);
      weightGroup = 1;
    }
    if (!match) continue;

    const key = candidate.name.toLowerCase();
    if (seen.has(key)) {
      rest = rest.replace(match[0], " ");
      continue;
    }
    seen.add(key);
    lifts.push({
      name: candidate.name,
      weight_kg: parseWeight(match[weightGroup]),
    });
    rest = rest.replace(match[0], " ");
  }

  return { lifts, rest: rest.replace(/\s+/g, " ").trim() };
}

function buildCandidates(knownMovements: readonly string[]): Candidate[] {
  const byName = new Map<string, Candidate>();
  for (const name of knownMovements) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    addCandidate(byName, trimmed, trimmed);
    const aliases = MOVEMENT_ALIASES[trimmed] ?? [];
    for (const alias of aliases) addCandidate(byName, trimmed, alias);
  }
  for (const [name, aliases] of Object.entries(MOVEMENT_ALIASES)) {
    if (byName.has(name.toLowerCase())) continue;
    addCandidate(byName, name, name);
    for (const alias of aliases) addCandidate(byName, name, alias);
  }
  return [...byName.values()].sort(
    (a, b) => b.pattern.length - a.pattern.length || a.name.localeCompare(b.name)
  );
}

function addCandidate(
  byName: Map<string, Candidate>,
  name: string,
  rawPattern: string
) {
  const pattern = normalizeSpeech(rawPattern);
  if (!pattern) return;
  const key = `${name.toLowerCase()}|${pattern}`;
  if (byName.has(key)) return;
  byName.set(key, { name, pattern });
}

function extractScore(rest: string): string | null {
  const cleaned = rest.replace(/\s+/g, " ").trim();
  if (!cleaned) return null;

  const time = cleaned.match(/\b(\d{1,2}) (\d{2})\b/);
  const minutes = cleaned.match(/\b(\d{1,3}) min(?:uter)?\b/);
  const rounds = cleaned.match(
    /\b(\d{1,3})(?: hela)? (?:varv|rounds?|rundor|ronder)\b/
  );

  if (rounds) return `${rounds[1]} varv`;
  if (time) return `${time[1]}:${time[2]}`;
  if (minutes) return `${minutes[1]} min`;
  return null;
}

function parseWeight(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

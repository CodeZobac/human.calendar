/**
 * Human Cycles — Dreamspell Module
 *
 * The modern Dreamspell count (José & Lloydine Argüelles, 1990), which pairs
 * with the 13-Moon year. This is DISTINCT from the traditional Maya Tzolk'in
 * implemented in `tzolkin.ts`:
 *
 *   Traditional (tzolkin.ts) : GMT 584283 correlation, counts every day,
 *                              never skips February 29.
 *   Dreamspell  (this file)  : anchored to 26 July 1987 = Kin 34, and skips
 *                              every 29 February as "0.0 Hunab Ku" — a day
 *                              outside the count that does not advance the Kin.
 *
 * The two counts legitimately disagree on any given Gregorian date. Both are
 * kept so the app can show the traditional count and the Dreamspell count
 * without pretending either is the other.
 *
 * Validated against three independent checkpoints:
 *   26 Jul 1987 → Kin  34  White Galactic Wizard  (the anchor itself)
 *   28 Feb 2020 → Kin 231, 29 Feb 2020 → 0.0 Hunab Ku, 1 Mar 2020 → Kin 232
 *   26 Jul 2026 → Kin 229  Red Galactic Moon      (published Galactic New Year)
 */

/** Solar seals in Dreamspell order, seal 1 through 20. */
export const SOLAR_SEALS = [
  "Dragon", "Wind", "Night", "Seed", "Serpent",
  "Worldbridger", "Hand", "Star", "Moon", "Dog",
  "Monkey", "Human", "Skywalker", "Wizard", "Eagle",
  "Warrior", "Earth", "Mirror", "Storm", "Sun",
] as const;

/** Galactic tones, tone 1 through 13. */
export const GALACTIC_TONES = [
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone",
  "Rhythmic", "Resonant", "Galactic", "Solar", "Planetary",
  "Spectral", "Crystal", "Cosmic",
] as const;

/** The four colour families, cycling Red → White → Blue → Yellow by seal. */
export const SEAL_COLORS = ["Red", "White", "Blue", "Yellow"] as const;

/** The five castles of the 260-day round, 52 kin each. */
export const CASTLES = [
  { name: "Red Eastern Castle of Turning", theme: "Birth" },
  { name: "White Northern Castle of Crossing", theme: "Refinement" },
  { name: "Blue Western Castle of Burning", theme: "Transformation" },
  { name: "Yellow Southern Castle of Giving", theme: "Ripening" },
  { name: "Green Central Castle of Enchantment", theme: "Matrix" },
] as const;

export type SolarSeal = (typeof SOLAR_SEALS)[number];
export type GalacticTone = (typeof GALACTIC_TONES)[number];
export type SealColor = (typeof SEAL_COLORS)[number];

/** The four Oracle positions that surround a kin, plus the kin itself. */
export interface OracleSet {
  /** The kin itself — the destiny / analog position holder. */
  analog: number;
  /** Guide: same tone, seal derived from the tone's guide-power rule. */
  guide: number;
  /** Antipode: the challenge, seal + 10. */
  antipode: number;
  /** Occult: the hidden power, tone 14 − tone and seal 21 − seal. */
  occult: number;
}

export interface DreamspellReading {
  /** Gregorian date normalized to UTC, ISO `YYYY-MM-DD`. */
  gregorianDate: string;
  /**
   * Kin 1–260, or `null` on 29 February — the 0.0 Hunab Ku day, which sits
   * outside the count entirely.
   */
  kin: number | null;
  /** True only on 29 February. */
  isHunabKu: boolean;
  /** Galactic tone number 1–13, or null on Hunab Ku. */
  tone: number | null;
  /** Galactic tone name, or null on Hunab Ku. */
  toneName: GalacticTone | null;
  /** Solar seal number 1–20, or null on Hunab Ku. */
  seal: number | null;
  /** Solar seal name, or null on Hunab Ku. */
  sealName: SolarSeal | null;
  /** Colour family of the seal, or null on Hunab Ku. */
  color: SealColor | null;
  /** Full galactic signature, e.g. "Red Galactic Moon", or "0.0 Hunab Ku". */
  signature: string;
  /** Wavespell 1–20 (each 13 kin), or null on Hunab Ku. */
  wavespell: number | null;
  /** Castle index 0–4, or null on Hunab Ku. */
  castle: number | null;
  /** The Oracle set, or null on Hunab Ku. */
  oracle: OracleSet | null;
}

/** Anchor: 26 July 1987 is Kin 34, White Galactic Wizard. */
export const DREAMSPELL_ANCHOR_UTC = Date.UTC(1987, 6, 26);
export const DREAMSPELL_ANCHOR_KIN = 34;

const MS_PER_DAY = 86_400_000;

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/** Whole UTC days for a date, discarding any time-of-day component. */
function toUtcDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY,
  );
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Count 29 February days strictly after the anchor and up to and including
 * `dayNumber`. Each one is a 0.0 Hunab Ku that did not advance the Kin count,
 * so the running total is subtracted from the elapsed-day figure.
 *
 * Negative spans (dates before the 1987 anchor) return a negative count, so
 * the same subtraction works in both directions.
 */
export function hunabKuDaysBetween(anchorDayNumber: number, dayNumber: number): number {
  const lo = Math.min(anchorDayNumber, dayNumber);
  const hi = Math.max(anchorDayNumber, dayNumber);
  const startYear = new Date(lo * MS_PER_DAY).getUTCFullYear();
  const endYear = new Date(hi * MS_PER_DAY).getUTCFullYear();

  let count = 0;
  for (let year = startYear; year <= endYear; year += 1) {
    if (!isLeapYear(year)) continue;
    const feb29 = Math.floor(Date.UTC(year, 1, 29) / MS_PER_DAY);
    if (feb29 > lo && feb29 <= hi) count += 1;
  }

  return dayNumber >= anchorDayNumber ? count : -count;
}

/** The Kin number for a date, or null on 29 February (0.0 Hunab Ku). */
export function getKin(date: Date): number | null {
  if (date.getUTCMonth() === 1 && date.getUTCDate() === 29) return null;

  const dayNumber = toUtcDayNumber(date);
  const anchorDayNumber = Math.floor(DREAMSPELL_ANCHOR_UTC / MS_PER_DAY);
  const elapsed = dayNumber - anchorDayNumber;
  const skipped = hunabKuDaysBetween(anchorDayNumber, dayNumber);

  return modulo(DREAMSPELL_ANCHOR_KIN - 1 + elapsed - skipped, 260) + 1;
}

/** Tone number 1–13 for a kin. */
export const toneOf = (kin: number): number => modulo(kin - 1, 13) + 1;

/** Seal number 1–20 for a kin. */
export const sealOf = (kin: number): number => modulo(kin - 1, 20) + 1;

/** Colour family of a seal: seals cycle Red, White, Blue, Yellow. */
export const colorOf = (seal: number): SealColor => SEAL_COLORS[modulo(seal - 1, 4)];

/** Compose a kin number back into its full signature name. */
export function signatureOf(kin: number): string {
  const seal = sealOf(kin);
  return `${colorOf(seal)} ${GALACTIC_TONES[toneOf(kin) - 1]} ${SOLAR_SEALS[seal - 1]}`;
}

/** Build a kin number from a tone (1–13) and seal (1–20) pair. */
export function kinFromToneAndSeal(tone: number, seal: number): number {
  const t = modulo(tone - 1, 13);
  const s = modulo(seal - 1, 20);
  // Solve kin ≡ t+1 (mod 13) and kin ≡ s+1 (mod 20) by direct search over the
  // 20 candidates sharing the seal — 13 and 20 are coprime, so exactly one hits.
  for (let k = 0; k < 13; k += 1) {
    const kin = s + 1 + k * 20;
    if (modulo(kin - 1, 13) === t) return kin;
  }
  /* c8 ignore next */
  throw new Error(`No kin for tone ${tone} seal ${seal}`);
}

/**
 * The guide seal depends on the tone's position in the 13-tone cycle. Guide
 * offsets repeat every five tones: +0, +12, +4, +16, +8 seals.
 */
const GUIDE_SEAL_OFFSET = [0, 12, 4, 16, 8];

/** Derive the four Oracle positions surrounding a kin. */
export function getOracle(kin: number): OracleSet {
  const tone = toneOf(kin);
  const seal = sealOf(kin);

  const guideSeal = modulo(seal - 1 + GUIDE_SEAL_OFFSET[modulo(tone - 1, 5)], 20) + 1;
  const antipodeSeal = modulo(seal - 1 + 10, 20) + 1;
  const occultSeal = modulo(20 - seal, 20) + 1;
  const occultTone = 14 - tone;

  return {
    analog: kin,
    guide: kinFromToneAndSeal(tone, guideSeal),
    antipode: kinFromToneAndSeal(tone, antipodeSeal),
    occult: kinFromToneAndSeal(occultTone, occultSeal),
  };
}

/** Read a Gregorian date in the Dreamspell count. */
export function getDreamspellReading(date: Date): DreamspellReading {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("getDreamspellReading requires a valid Date");
  }

  const gregorianDate = [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

  const kin = getKin(date);

  if (kin === null) {
    return {
      gregorianDate,
      kin: null,
      isHunabKu: true,
      tone: null,
      toneName: null,
      seal: null,
      sealName: null,
      color: null,
      signature: "0.0 Hunab Ku",
      wavespell: null,
      castle: null,
      oracle: null,
    };
  }

  const tone = toneOf(kin);
  const seal = sealOf(kin);

  return {
    gregorianDate,
    kin,
    isHunabKu: false,
    tone,
    toneName: GALACTIC_TONES[tone - 1],
    seal,
    sealName: SOLAR_SEALS[seal - 1],
    color: colorOf(seal),
    signature: signatureOf(kin),
    wavespell: Math.floor((kin - 1) / 13) + 1,
    castle: Math.floor((kin - 1) / 52),
    oracle: getOracle(kin),
  };
}

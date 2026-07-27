/**
 * Human Cycles — 13-Moon Module
 *
 * The 13-Moon / 28-day year (13:28), the solar-lunar half of the Dreamspell
 * system. Unlike the bespoke 9-month "nonary" year in `solarYear.ts`, this is
 * the perfectly regular 13 × 28 structure:
 *
 *   Year start : 26 July
 *   Structure  : 13 moons × 28 days = 364 days
 *   Day 365    : 25 July — the Day Out of Time, belonging to no moon
 *   Leap day   : 29 February is 0.0 Hunab Ku (see `dreamspell.ts`); it sits
 *                outside the Kin count but still occupies a calendar slot,
 *                so the 13:28 grid stays fixed to Gregorian dates.
 *
 * Every moon has 28 days and exactly four 7-day weeks, so the day-of-moon maps
 * cleanly onto a heptad (week) position — the property that makes the 13-Moon
 * year "perpetual": the same date always falls on the same weekday-in-moon.
 */

/** The thirteen moons in order, with their totem animal and keyword. */
export const MOONS = [
  { name: "Magnetic Bat", tone: "Magnetic", keyword: "Purpose" },
  { name: "Lunar Scorpion", tone: "Lunar", keyword: "Challenge" },
  { name: "Electric Deer", tone: "Electric", keyword: "Service" },
  { name: "Self-Existing Owl", tone: "Self-Existing", keyword: "Form" },
  { name: "Overtone Peacock", tone: "Overtone", keyword: "Radiance" },
  { name: "Rhythmic Lizard", tone: "Rhythmic", keyword: "Equality" },
  { name: "Resonant Monkey", tone: "Resonant", keyword: "Attunement" },
  { name: "Galactic Hawk", tone: "Galactic", keyword: "Integrity" },
  { name: "Solar Jaguar", tone: "Solar", keyword: "Intention" },
  { name: "Planetary Dog", tone: "Planetary", keyword: "Manifestation" },
  { name: "Spectral Serpent", tone: "Spectral", keyword: "Liberation" },
  { name: "Crystal Rabbit", tone: "Crystal", keyword: "Cooperation" },
  { name: "Cosmic Turtle", tone: "Cosmic", keyword: "Presence" },
] as const;

/** The four 7-day heptads (weeks) inside every moon. */
export const HEPTADS = [
  { name: "White Heptad", action: "Knowledge" },
  { name: "Red Heptad", action: "Transformation" },
  { name: "Blue Heptad", action: "Realization" },
  { name: "Yellow Heptad", action: "Manifestation" },
] as const;

export interface ThirteenMoonReading {
  /** Gregorian date normalized to UTC, ISO `YYYY-MM-DD`. */
  gregorianDate: string;
  /** Moon 1–13, or null on the Day Out of Time. */
  moon: number | null;
  /** Moon name, e.g. "Magnetic Bat", or null on the Day Out of Time. */
  moonName: string | null;
  /** Day within the moon, 1–28, or null on the Day Out of Time. */
  day: number | null;
  /** True only on 25 July. */
  isDayOutOfTime: boolean;
  /** Day of the 365-day year, 1–365 (the Day Out of Time is 365). */
  dayOfYear: number;
  /** Heptad (week) index within the moon, 0–3, or null outside a moon. */
  heptad: number | null;
  /** Day within the heptad, 1–7, or null outside a moon. */
  heptadDay: number | null;
  /**
   * The Gregorian year in which this 13-Moon year began. A date in, say,
   * March 2027 belongs to the year that started 26 July 2026.
   */
  yearStart: number;
}

const MS_PER_DAY = 86_400_000;

/** Whole UTC days for a date, discarding any time-of-day component. */
function toUtcDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY,
  );
}

/**
 * The Gregorian year whose 26 July began the 13-Moon year containing `date`.
 * Dates on or after 26 July belong to that year's cycle; earlier dates belong
 * to the previous year's.
 */
export function thirteenMoonYearStart(date: Date): number {
  const year = date.getUTCFullYear();
  const july26 = Math.floor(Date.UTC(year, 6, 26) / MS_PER_DAY);
  return toUtcDayNumber(date) >= july26 ? year : year - 1;
}

/** Read a Gregorian date in the 13-Moon year. */
export function getThirteenMoonReading(date: Date): ThirteenMoonReading {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("getThirteenMoonReading requires a valid Date");
  }

  const gregorianDate = [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

  const yearStart = thirteenMoonYearStart(date);
  const startDayNumber = Math.floor(Date.UTC(yearStart, 6, 26) / MS_PER_DAY);
  const dayNumber = toUtcDayNumber(date);

  // Elapsed days since 26 July. A leap February inside the span pushes later
  // dates one slot further, which is why 0.0 Hunab Ku is excluded from the
  // count here — it is a calendar slot but not a 13:28 day.
  let elapsed = dayNumber - startDayNumber;

  const isLeapFebruaryInSpan =
    (yearStart + 1) % 4 === 0 && ((yearStart + 1) % 100 !== 0 || (yearStart + 1) % 400 === 0);
  if (isLeapFebruaryInSpan) {
    const feb29 = Math.floor(Date.UTC(yearStart + 1, 1, 29) / MS_PER_DAY);
    if (dayNumber > feb29) elapsed -= 1;
    if (dayNumber === feb29) {
      // 0.0 Hunab Ku: outside the 13:28 grid, like the Day Out of Time.
      return {
        gregorianDate,
        moon: null,
        moonName: null,
        day: null,
        isDayOutOfTime: false,
        dayOfYear: feb29 - startDayNumber + 1,
        heptad: null,
        heptadDay: null,
        yearStart,
      };
    }
  }

  const isDayOutOfTime = date.getUTCMonth() === 6 && date.getUTCDate() === 25;

  if (isDayOutOfTime) {
    return {
      gregorianDate,
      moon: null,
      moonName: null,
      day: null,
      isDayOutOfTime: true,
      dayOfYear: 365,
      heptad: null,
      heptadDay: null,
      yearStart,
    };
  }

  const moon = Math.floor(elapsed / 28) + 1;
  const day = (elapsed % 28) + 1;

  return {
    gregorianDate,
    moon,
    moonName: MOONS[moon - 1].name,
    day,
    isDayOutOfTime: false,
    dayOfYear: elapsed + 1,
    heptad: Math.floor((day - 1) / 7),
    heptadDay: ((day - 1) % 7) + 1,
    yearStart,
  };
}

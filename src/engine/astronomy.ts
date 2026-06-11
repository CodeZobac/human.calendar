/**
 * Human Cycles — Astronomy Module
 *
 * Fixed astronomical constants, epochs, and elapsed-time math.
 * All derived values flow from DAY_CYCLE (9) and the two astronomical anchors.
 *
 * Two parallel systems live here:
 *   Legacy 9-position system (CycleReading) — original concept model
 *   Nonary calendar system  (Reading)       — full breath/reversal model
 */

// ─── Base Constants ────────────────────────────────────────────────────────────

/** The self-cycle count for Earth's rotation. */
export const DAY_CYCLE = 9;

/** The solar count for Earth's full orbit through the seasons. */
export const YEAR_CYCLE = 9;

/** Tropical year in days — one full seasonal orbit. */
export const SOLAR_YEAR_DAYS = 365.24219;

/** Moon's synodic period in days — new moon to new moon. */
export const SYNODIC_MONTH_DAYS = 29.53059;

// ─── Derived Constants (Legacy 9-position system) ─────────────────────────────

/** One Earth month = solar year / 9. ~40.58 days. */
export const EARTH_MONTH_DAYS = SOLAR_YEAR_DAYS / YEAR_CYCLE;

/** One lunar phase unit = synodic month / 9. ~3.28 days. */
export const LUNAR_PHASE_UNIT_DAYS = SYNODIC_MONTH_DAYS / DAY_CYCLE;

/** Rest days at the end of each Earth month, after 4 clean 9-day blocks. */
export const EARTH_REST_DAYS = EARTH_MONTH_DAYS - 4 * DAY_CYCLE;

/** How many synodic months fit inside one Earth month. */
export const SYNODIC_PER_EARTH_MONTH = EARTH_MONTH_DAYS / SYNODIC_MONTH_DAYS;

// ─── Nonary Calendar Constants ─────────────────────────────────────────────────

/**
 * Calendar year = 9 months × 40 rounded days.
 * The 5.24219 remainder becomes two reversal pauses.
 */
export const CALENDAR_YEAR = 360;

/**
 * Year reversal pause = (solar year − calendar year) / 2.
 * There are two of these: mid-year and year-end.
 */
export const YEAR_REVERSAL = (SOLAR_YEAR_DAYS - CALENDAR_YEAR) / 2; // ≈ 2.621095 days

/** Rounded calendar month length. */
export const EARTH_MONTH_ROUNDED = 40;

/**
 * Month breath-pause duration (each Earth month has two of these).
 * Grow-in (20) + pause (0.29) + Grow-out (20) + pause (0.29) = 40.58 days.
 */
export const MONTH_PAUSE = 0.29;

/** Total Earth month including both pauses. */
export const TOTAL_MONTH = EARTH_MONTH_ROUNDED + 2 * MONTH_PAUSE; // 40.58 days

/** Half synodic month — New Moon to Full Moon (or Full Moon to New Moon). */
export const HALF_SYNODIC = SYNODIC_MONTH_DAYS / 2; // ≈ 14.765295 days

/** Minutes in a conventional 24-hour day. */
export const NONARY_DAY_MINUTES = 1440;

/** Minutes per nonary hour = 1440 / 9 = 160 conventional minutes. */
export const NONARY_HOUR_MINUTES = NONARY_DAY_MINUTES / DAY_CYCLE; // 160

// ─── Epochs ────────────────────────────────────────────────────────────────────

/**
 * Year epoch — Winter Solstice 2026.
 * December 21, 2026 at 9:49 PM CET (= 20:49 UTC).
 *
 * Year structure:
 *   Day   0   → Winter Solstice 2026          (month 1, growth, breath-in starts)
 *   Day 180   → mid-year reversal              (≈ Summer Solstice ≡ peak of breath-in)
 *   Day 182.6 → breath-out starts
 *   Day 360   → year-end reversal opens
 *   Day 365.2 → Winter Solstice 2027          (next epoch, year resets)
 *
 * Dates before this epoch wrap automatically into the previous solar cycle.
 */
export const EPOCH = new Date("2026-12-21T20:49:00Z");

/**
 * Moon epoch — the New Moon that precedes the confirmed Full Moon of May 1, 2026.
 *
 * Anchor: Full Moon on Friday May 1, 2026 at 19:23 CEST (= 17:23 UTC).
 * New Moon = Full Moon − (SYNODIC_MONTH / 2) = 2026-04-16T23:01:00Z
 *
 * This gives exact results for the current synodic cycle:
 *   April 30 (today)  → synodic day ≈13.5  — breath-in, approaching peak
 *   May 1 at 17:23 UTC → synodic day = 14.765 — Full Moon peak
 */
export const MOON_EPOCH = new Date("2026-04-16T23:01:00Z");

/** Milliseconds in one day. */
const MS_PER_DAY = 86_400_000;

// ─── Functions ─────────────────────────────────────────────────────────────────

/**
 * Compute fractional elapsed days from the year epoch to the given date.
 * Returns a positive number for dates after the epoch.
 * Works across year boundaries using DST-safe UTC math.
 */
export function elapsedDays(date: Date): number {
  return (date.getTime() - EPOCH.getTime()) / MS_PER_DAY;
}

/**
 * Compute fractional elapsed days from the Moon epoch to the given date.
 * Used by moonClock.ts to derive synodic position.
 */
export function elapsedDaysSinceMoonEpoch(date: Date): number {
  return (date.getTime() - MOON_EPOCH.getTime()) / MS_PER_DAY;
}

/**
 * Compute elapsed minutes between two Date objects.
 * Used by dayClock.ts to derive the position within the 9-hour day.
 */
export function elapsedMinutes(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 60_000;
}

/**
 * Return the UTC dawn Date for a given date.
 * Defaults to 06:00 UTC as a proxy for local astronomical dawn.
 * Pass a custom dawnHourUTC (0–23) to override for a specific locale.
 */
export function getDawnForDate(date: Date, dawnHourUTC = 6): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      dawnHourUTC,
      0,
      0,
      0,
    ),
  );
}

/**
 * Which solar year we're in (1-based).
 * Year 1 = Winter Solstice 2026 – Winter Solstice 2027.
 */
export function getYearNumber(date: Date): number {
  return Math.floor(elapsedDays(date) / SOLAR_YEAR_DAYS) + 1;
}

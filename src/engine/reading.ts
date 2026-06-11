/**
 * Human Cycles — Reading Module
 *
 * Combines all four nonary clocks into a single `Reading` object for any
 * Gregorian datetime.  Each clock uses its own independent epoch:
 *
 *   Solar year  → Winter Solstice 2026 (EPOCH)
 *   Earth month → derived from solar year elapsed days
 *   Moon clock  → Apr 16, 2026 23:01 UTC (MOON_EPOCH, confirmed New Moon)
 *   Day clock   → astronomical sunrise for the date and location
 *                 (pass via options.dawnDate; falls back to 06:00 UTC)
 */

import {
  elapsedDays,
  elapsedDaysSinceMoonEpoch,
  elapsedMinutes,
  getDawnForDate,
} from "./astronomy";
import { getDayClock } from "./dayClock";
import { getSolarYear } from "./solarYear";
import { getEarthMonth } from "./earthMonth";
import { getMoonClock } from "./moonClock";
import type { Reading } from "./types";

export interface ReadingOptions {
  /**
   * The exact astronomical sunrise Date for this date and location.
   * Obtained from the geo service (services/geo.ts).
   * When provided, this is used as Hour 1 of the day clock.
   * When omitted, falls back to 06:00 UTC via dawnHourUTC.
   */
  dawnDate?: Date;

  /**
   * Fallback UTC hour for dawn (0–23) when dawnDate is not available.
   * Defaults to 6 (06:00 UTC).
   */
  dawnHourUTC?: number;
}

/**
 * Build a full nonary Reading for any JavaScript Date.
 *
 * @param date    - The moment to read (can be past, present, or future).
 * @param options - Supply dawnDate from the geo service for a live clock.
 */
export function getReading(date: Date, options: ReadingOptions = {}): Reading {
  const { dawnDate, dawnHourUTC = 6 } = options;

  // ── Elapsed time anchors ──────────────────────────────────────────────────
  const yearElapsed = elapsedDays(date);
  const moonElapsed = elapsedDaysSinceMoonEpoch(date);

  // The dawn anchor: real sunrise takes priority over the fixed-hour fallback.
  const dawn = dawnDate ?? getDawnForDate(date, dawnHourUTC);
  const minutesFromDawn = elapsedMinutes(dawn, date);

  // ── Solar year (computed first so Earth Month can share its day position) ──
  const solarYear = getSolarYear(yearElapsed);

  // ── Earth month local day position ────────────────────────────────────────
  // Use the same day-in-month as the Solar Year so both clocks stay in sync.
  // solarYear.dayInMonth is 1-indexed; getEarthMonth expects a 0-indexed value
  // that it will normalise and then return as localDay = d + 1.
  const monthLocalDay = solarYear.dayInMonth - 1;

  // ── Compose reading ───────────────────────────────────────────────────────
  return {
    gregorianIso: date.toISOString(),
    elapsedDaysFromYearEpoch: yearElapsed,
    elapsedMinutesFromDayEpoch: minutesFromDawn,
    dayClock: getDayClock(minutesFromDawn),
    solarYear,
    earthMonth: getEarthMonth(monthLocalDay),
    moonClock: getMoonClock(moonElapsed),
  };
}

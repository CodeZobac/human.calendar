/**
 * Human Cycles — Solar Year Module
 *
 * 9-month year structure anchored to February 1:
 *
 *   Breath-in    : days 0   – 180        (months 1–4 mid)
 *   Mid reversal : days 180 – 182.621    (2.621 days)
 *   Breath-out   : days 182.621 – 362.621 (months 4 mid – 9 end)
 *   Year-end rev : days 362.621 – 365.242 (2.621 days)
 *
 * Meta-seasons:
 *   Growth  = months 1–3
 *   Peak    = months 4–6
 *   Decline = months 7–9
 *
 * The Summer Solstice sits at the peak of breath-in (~180 days from Feb 1
 * lands near late July), and the Winter Solstice at the peak of breath-out.
 */

import {
  SOLAR_YEAR_DAYS,
  CALENDAR_YEAR,
  YEAR_REVERSAL,
  EARTH_MONTH_ROUNDED,
} from "./astronomy";
import type { SolarYearReading, BreathPhase, NonaryMetaSeason } from "./types";

const BREATH_HALF = CALENDAR_YEAR / 2; // 180 days

/**
 * Derive the solar year position from elapsed days since the year epoch.
 *
 * @param elapsedDays - Fractional days since Feb 1 epoch (can be negative or
 *   extend past one year; wraps automatically).
 */
export function getSolarYear(elapsedDays: number): SolarYearReading {
  // Normalise into [0, SOLAR_YEAR_DAYS).
  // Using raw-mod pattern to avoid IEEE 754 precision loss that occurs in
  // the ((x % y) + y) % y form when x is close to a year boundary.
  const raw = elapsedDays % SOLAR_YEAR_DAYS;
  const d = raw < 0 ? raw + SOLAR_YEAR_DAYS : raw;

  // ── Breath phase ────────────────────────────────────────────────────────
  let breathPhase: BreathPhase;
  if (d < BREATH_HALF) {
    breathPhase = "breath-in";
  } else if (d < BREATH_HALF + YEAR_REVERSAL) {
    breathPhase = "reversal";
  } else if (d < BREATH_HALF + YEAR_REVERSAL + BREATH_HALF) {
    breathPhase = "breath-out";
  } else {
    breathPhase = "reversal"; // year-end reversal
  }

  // ── Month and day-in-month ───────────────────────────────────────────────
  // Clamp to the 360-day calendar zone so reversal days don't push month > 9.
  const calendarPosition = Math.min(d, CALENDAR_YEAR - 0.0001);
  const monthIndex = Math.floor(calendarPosition / EARTH_MONTH_ROUNDED);
  const month = Math.min(monthIndex + 1, 9);
  const dayInMonth = (calendarPosition % EARTH_MONTH_ROUNDED) + 1;

  // ── Meta-season ──────────────────────────────────────────────────────────
  const metaSeason: NonaryMetaSeason =
    month <= 3 ? "growth" : month <= 6 ? "peak" : "decline";

  return { month, metaSeason, breathPhase, dayInMonth };
}

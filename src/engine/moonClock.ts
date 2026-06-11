/**
 * Human Cycles — Moon Clock Module
 *
 * The Moon is modeled as an independent synodic clock entirely separate from
 * the Earth month.  Their phases drift ~11 days per Earth month and must NOT
 * be forced into alignment.
 *
 * Synodic structure:
 *   New Moon  → Full Moon : 14.765 days (breath-in / waxing)
 *   Full Moon → New Moon  : 14.765 days (breath-out / waning)
 *
 * Peak windows (±0.5 days around each peak):
 *   Full Moon : centered on day 14.765295
 *   New Moon  : centered on day 0 / 29.53059
 */

import { SYNODIC_MONTH_DAYS, HALF_SYNODIC } from './astronomy';
import type { MoonClockReading, LunarSegment, LunarPeak } from './types';

/** Half-width of a peak detection window in days. */
const PEAK_WINDOW = 0.5;

/**
 * Derive the Moon clock reading from elapsed days since a known New Moon.
 *
 * @param elapsedDaysSinceNewMoon - Fractional days since the Moon epoch.
 *   Can be negative (pre-epoch) or very large; wraps automatically.
 */
export function getMoonClock(elapsedDaysSinceNewMoon: number): MoonClockReading {
  // Normalise into [0, SYNODIC_MONTH_DAYS).
  const d =
    ((elapsedDaysSinceNewMoon % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) %
    SYNODIC_MONTH_DAYS;

  // ── Breath direction ─────────────────────────────────────────────────────
  const segment: LunarSegment = d < HALF_SYNODIC ? 'breath-in' : 'breath-out';

  // ── Peak detection ───────────────────────────────────────────────────────
  let phasePeak: LunarPeak = null;

  // Full Moon window: centered at HALF_SYNODIC (≈ 14.765 days).
  if (Math.abs(d - HALF_SYNODIC) < PEAK_WINDOW) {
    phasePeak = 'full-moon';
  }

  // New Moon window: centered at 0 / SYNODIC_MONTH_DAYS boundary.
  if (d < PEAK_WINDOW || d > SYNODIC_MONTH_DAYS - PEAK_WINDOW) {
    phasePeak = 'new-moon';
  }

  return { synodicDay: d, segment, phasePeak };
}

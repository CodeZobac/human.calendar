/**
 * Human Cycles — Earth Month Module
 *
 * The Earth month is a rounded 40-day breath cycle with two 0.29-day
 * reversal pauses:
 *
 *   Grow-in  : days 0.00 – 20.00         (expansion)
 *   Pause 1  : days 20.00 – 20.29        (top-of-cycle reversal)
 *   Grow-out : days 20.29 – 40.29        (contraction)
 *   Pause 2  : days 40.29 – 40.58        (bottom-of-cycle reversal)
 *
 * Total = 40.58 days — exactly the astronomical Earth month (365.242 / 9).
 *
 * IMPORTANT: This is Earth-based, not Moon-based.  The 0.29-day pauses here
 * are independent of the Moon's synodic peaks and drift relative to them by
 * ~11 days per Earth month.
 */

import { TOTAL_MONTH, MONTH_PAUSE } from './astronomy';
import type { EarthMonthReading, EarthMonthSegment } from './types';

const GROW_HALF = 20; // days

/**
 * Derive the Earth month breath phase from elapsed time within the month.
 *
 * @param localDay - Fractional days since the start of the current cycle.
 *   This value wraps automatically, so raw elapsed days from any epoch work.
 */
export function getEarthMonth(localDay: number): EarthMonthReading {
  // Normalise into [0, TOTAL_MONTH).
  const d = ((localDay % TOTAL_MONTH) + TOTAL_MONTH) % TOTAL_MONTH;

  let segment: EarthMonthSegment;
  if (d < GROW_HALF) {
    segment = 'grow-in';
  } else if (d < GROW_HALF + MONTH_PAUSE) {
    segment = 'pause-1';
  } else if (d < GROW_HALF + MONTH_PAUSE + GROW_HALF) {
    segment = 'grow-out';
  } else {
    segment = 'pause-2';
  }

  return { model: '20-0.29-20-0.29', segment, localDay: d + 1 };
}

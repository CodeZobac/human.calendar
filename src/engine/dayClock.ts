/**
 * Human Cycles — Day Clock Module
 *
 * 9-hour day model anchored to dawn instead of midnight.
 *
 * Structure (in nonary hours):
 *   Dawn  : 0.0 – 0.5   (80 conventional minutes)
 *   Day   : 0.5 – 4.5   (10h 40m conventional)
 *   Dusk  : 4.5 – 5.0   (80 conventional minutes)
 *   Night : 5.0 – 9.0   (10h 40m conventional)
 *
 * One nonary hour = 1440 / 9 = 160 conventional minutes.
 *
 * The nonary h:m:s clock runs base-9:
 *   hour   = floor(totalNonaryHours) + 1          (1–9)
 *   minute = floor(fraction × 9)    + 1           (1–9)
 *   second = floor((fraction×9 % 1) × 9) + 1      (1–9)
 */

import { NONARY_HOUR_MINUTES, NONARY_DAY_MINUTES } from './astronomy';
import type { DayClockReading, DaySegment } from './types';

/**
 * Compute the nonary day clock from minutes elapsed since dawn.
 *
 * @param minutesSinceDawn - Positive = after dawn, negative = pre-dawn (wraps).
 *   Use `elapsedMinutes(dawn, now)` from astronomy.ts to obtain this value.
 * @returns Full DayClockReading for that moment.
 */
export function getDayClock(minutesSinceDawn: number): DayClockReading {
  // Wrap into [0, 1440) to handle pre-dawn and post-midnight values.
  const normalized =
    ((minutesSinceDawn % NONARY_DAY_MINUTES) + NONARY_DAY_MINUTES) %
    NONARY_DAY_MINUTES;

  const totalNonaryHours = normalized / NONARY_HOUR_MINUTES;

  // Base-9 time components (all 1-indexed).
  const hour = Math.floor(totalNonaryHours) + 1;
  const fraction = totalNonaryHours % 1;
  const minute = Math.floor(fraction * 9) + 1;
  const second = Math.floor(((fraction * 9) % 1) * 9) + 1;

  // Segment boundaries in nonary hours.
  let segment: DaySegment;
  if (totalNonaryHours < 0.5) segment = 'dawn';
  else if (totalNonaryHours < 4.5) segment = 'day';
  else if (totalNonaryHours < 5.0) segment = 'dusk';
  else segment = 'night';

  return { hour, minute, second, segment, totalNonaryHours };
}

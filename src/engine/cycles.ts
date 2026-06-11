/**
 * Human Cycles — Cycles Module
 *
 * Pure functions that take a Date and return cycle positions.
 * Every value is derived from elapsed days since the Winter Solstice epoch.
 */

import type { CyclePosition, CycleReading } from "./types";
import {
  DAY_CYCLE,
  YEAR_CYCLE,
  SOLAR_YEAR_DAYS,
  SYNODIC_MONTH_DAYS,
  EARTH_MONTH_DAYS,
  LUNAR_PHASE_UNIT_DAYS,
  elapsedDays,
} from "./astronomy";
import { getBand, getMetaSeason } from "./meaning";

/**
 * Position in the 9-day Earth rotation cycle.
 * elapsed % 9, where 0 maps to 9.
 *
 * Feb 1 (day 0) = position 9 (closing of prior cycle).
 * Feb 2 (day 1) = position 1.
 * April 29 (day 87) = position 6.
 */
export function getEarthDay(date: Date): CyclePosition {
  const days = Math.floor(elapsedDays(date));
  const mod = ((days % DAY_CYCLE) + DAY_CYCLE) % DAY_CYCLE; // safe modulo for negatives
  return (mod === 0 ? 9 : mod) as CyclePosition;
}

/**
 * Which of the 9 Earth months (each ~40.58 days) we're in.
 * Month 1 starts at the epoch, month 2 at day 40.58, etc.
 */
export function getEarthMonth(date: Date): CyclePosition {
  const days = elapsedDays(date);
  const monthIndex = Math.floor(days / EARTH_MONTH_DAYS) % YEAR_CYCLE;
  return (monthIndex + 1) as CyclePosition;
}

/**
 * Which year in a 9-year macro-cycle.
 * Year 1 = first solar year from epoch.
 */
export function getEarthYear(date: Date): CyclePosition {
  const days = elapsedDays(date);
  const yearIndex = Math.floor(days / SOLAR_YEAR_DAYS) % YEAR_CYCLE;
  return (yearIndex + 1) as CyclePosition;
}

/**
 * Position in the 9-phase lunar cycle within the synodic month.
 * Divides the 29.53-day synodic month into 9 equal phases (~3.28 days each).
 */
export function getMoonPhase(date: Date): CyclePosition {
  const days = elapsedDays(date);
  // Handle negative elapsed days (before epoch) with safe modulo
  const dayInSynodic =
    ((days % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const phaseIndex =
    Math.floor(dayInSynodic / LUNAR_PHASE_UNIT_DAYS) % DAY_CYCLE;
  return (phaseIndex + 1) as CyclePosition;
}

/**
 * Fractional day within the current 40.58-day Earth month (0-based).
 * For April 29 (day 87): 87 % 40.58246 = 5.84
 */
export function getDayInEarthMonth(date: Date): number {
  const days = elapsedDays(date);
  return ((days % EARTH_MONTH_DAYS) + EARTH_MONTH_DAYS) % EARTH_MONTH_DAYS;
}

/**
 * Aggregate all cycle positions into a single CycleReading for any given date.
 */
export function getCycleReading(date: Date): CycleReading {
  const elapsed = elapsedDays(date);
  const dayInMonth = getDayInEarthMonth(date);
  const earthMonth = getEarthMonth(date);
  const band = getBand(dayInMonth);
  const season = getMetaSeason(earthMonth);

  return {
    gregorianDate: date.toISOString().split("T")[0],
    elapsedDays: elapsed,
    earthDay: getEarthDay(date),
    earthMonth,
    earthYear: getEarthYear(date),
    moonPhase: getMoonPhase(date),
    dayInEarthMonth: dayInMonth,
    band,
    metaSeason: season.name,
    metaSeasonEmoji: season.emoji,
  };
}

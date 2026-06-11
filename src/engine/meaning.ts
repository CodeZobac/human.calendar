/**
 * Human Cycles — Meaning Module
 *
 * Symbolic interpretation layer. Maps numeric positions into
 * bands, meta-seasons, and human-readable descriptions.
 */

import type { Band, BandInfo, CyclePosition, MetaSeason, MetaSeasonInfo } from './types';

// ─── Band Definitions ──────────────────────────────────────────────────────────

export const BANDS: BandInfo[] = [
  {
    band: 'Beginning',
    startDay: 0,
    endDay: 9,
    meaning: 'Initiation — seeds planted, new energy arrives',
    lunarRelation: 'Early waxing after reset',
  },
  {
    band: 'Middle',
    startDay: 9,
    endDay: 18,
    meaning: 'Expansion — full momentum, energy at its peak',
    lunarRelation: 'Full moon sits near the center of this zone',
  },
  {
    band: 'End',
    startDay: 18,
    endDay: 27,
    meaning: 'Release — letting go, completing what was started',
    lunarRelation: 'Waning dominates here',
  },
  {
    band: 'Threshold',
    startDay: 27,
    endDay: 36,
    meaning: 'Death and rebirth — the void before renewal',
    lunarRelation: 'New moon reset falls early in this zone',
  },
  {
    band: 'Rest',
    startDay: 36,
    endDay: 40.58246,
    meaning: 'Integration — stillness outside the four clean blocks',
    lunarRelation: 'Leftover days outside the 4 clean 9-day blocks',
  },
];

/**
 * Determine which band a day-in-Earth-month falls into.
 */
export function getBand(dayInEarthMonth: number): Band {
  if (dayInEarthMonth < 9) return 'Beginning';
  if (dayInEarthMonth < 18) return 'Middle';
  if (dayInEarthMonth < 27) return 'End';
  if (dayInEarthMonth < 36) return 'Threshold';
  return 'Rest';
}

/**
 * Get the full metadata for a band.
 */
export function getBandInfo(band: Band): BandInfo {
  return BANDS.find(b => b.band === band)!;
}

/**
 * Get a human-readable description for a band.
 */
export function getBandDescription(band: Band): string {
  return getBandInfo(band).meaning;
}

// ─── Meta-Season Definitions ───────────────────────────────────────────────────

export const META_SEASONS: MetaSeasonInfo[] = [
  {
    name: 'Growth',
    emoji: '🌱',
    months: [1, 2, 3],
    nature: 'Roots → leaves → full canopy',
  },
  {
    name: 'Peak',
    emoji: '☀️',
    months: [4, 5, 6],
    nature: 'Full bloom → fruit → harvest',
  },
  {
    name: 'Decline',
    emoji: '🍂',
    months: [7, 8, 9],
    nature: 'Leaves falling → winter dormancy',
  },
];

/**
 * Determine the meta-season from the Earth month position.
 */
export function getMetaSeason(earthMonth: CyclePosition): { name: MetaSeason; emoji: string } {
  if (earthMonth <= 3) return { name: 'Growth', emoji: '🌱' };
  if (earthMonth <= 6) return { name: 'Peak', emoji: '☀️' };
  return { name: 'Decline', emoji: '🍂' };
}

/**
 * Get the full metadata for a meta-season.
 */
export function getMetaSeasonInfo(name: MetaSeason): MetaSeasonInfo {
  return META_SEASONS.find(s => s.name === name)!;
}

// ─── Moon Phase Labels ─────────────────────────────────────────────────────────

const MOON_PHASE_LABELS: Record<CyclePosition, string> = {
  1: 'New Moon — Darkness, seed of intent',
  2: 'Waxing Crescent — First light, emergence',
  3: 'First Quarter — Momentum building',
  4: 'Waxing Gibbous — Nearing fullness',
  5: 'Full Moon — Peak illumination',
  6: 'Waning Gibbous — Gratitude, sharing',
  7: 'Last Quarter — Release, turning inward',
  8: 'Waning Crescent — Surrender, rest',
  9: 'Dark Moon — Void before renewal',
};

const MOON_PHASE_SHORT: Record<CyclePosition, string> = {
  1: 'New Moon',
  2: 'Waxing Crescent',
  3: 'First Quarter',
  4: 'Waxing Gibbous',
  5: 'Full Moon',
  6: 'Waning Gibbous',
  7: 'Last Quarter',
  8: 'Waning Crescent',
  9: 'Dark Moon',
};

/**
 * Get a descriptive label for a moon phase position.
 */
export function getMoonPhaseLabel(phase: CyclePosition): string {
  return MOON_PHASE_LABELS[phase];
}

/**
 * Get the short name for a moon phase position.
 */
export function getMoonPhaseShortLabel(phase: CyclePosition): string {
  return MOON_PHASE_SHORT[phase];
}

// ─── Earth Day Labels ──────────────────────────────────────────────────────────

const EARTH_DAY_LABELS: Record<CyclePosition, string> = {
  1: 'Spark — The cycle opens',
  2: 'Root — Foundation sets',
  3: 'Push — First effort',
  4: 'Form — Structure appears',
  5: 'Center — Midpoint, balance',
  6: 'Flow — Momentum carries',
  7: 'Reach — Extending outward',
  8: 'Peak — Maximum expression',
  9: 'Close — Completion, release',
};

/**
 * Get a descriptive label for an Earth day position.
 */
export function getEarthDayLabel(day: CyclePosition): string {
  return EARTH_DAY_LABELS[day];
}

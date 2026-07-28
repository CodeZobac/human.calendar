/**
 * Human Cycles — View Model Module
 *
 * Formatted display strings and UI-ready labels for all four nonary clocks.
 * Keeps formatting logic out of components so it can be tested independently.
 *
 * Primary display format (from plan):
 *   Day   : "H7:M4:S5 — Night"
 *   Year  : "Month 3 / Growth / Breath-in"
 *   Month : "Grow-out — Day 12.4"
 *   Moon  : "Breath-in — synodic day 11.2"
 */

import type {
  DayClockReading,
  SolarYearReading,
  EarthMonthReading,
  MoonClockReading,
  Reading,
  NonaryMetaSeason,
  BreathPhase,
  EarthMonthSegment,
  LunarSegment,
  DaySegment,
} from "./types";
import { LUNAR_PHASE_UNIT_DAYS } from "./astronomy";

// ─── Segment labels ────────────────────────────────────────────────────────────

export const DAY_SEGMENT_LABELS: Record<DaySegment, string> = {
  dawn: "Dawn",
  day: "Day",
  dusk: "Dusk",
  night: "Night",
};

export const BREATH_PHASE_LABELS: Record<BreathPhase, string> = {
  "breath-in": "Breath-in",
  reversal: "Reversal",
  "breath-out": "Breath-out",
};

export const META_SEASON_LABELS: Record<NonaryMetaSeason, string> = {
  growth: "",
  peak: "",
  decline: "",
};

export const META_SEASON_EMOJIS: Record<NonaryMetaSeason, string> = {
  growth: "Growth",
  peak: "Peak",
  decline: "Decline",
};

export const EARTH_MONTH_SEGMENT_LABELS: Record<EarthMonthSegment, string> = {
  "grow-in": "Grow-in",
  "pause-1": "Pause",
  "grow-out": "Grow-out",
  "pause-2": "Pause",
};

export const LUNAR_SEGMENT_LABELS: Record<LunarSegment, string> = {
  "breath-in": "Breath-in",
  "breath-out": "Breath-out",
};

// ─── Meta-season colors ────────────────────────────────────────────────────────

export const META_SEASON_COLORS: Record<NonaryMetaSeason, string> = {
  growth: "var(--color-growth)",
  peak: "var(--color-peak)",
  decline: "var(--color-decline)",
};

// ─── Segment colors ────────────────────────────────────────────────────────────

export const DAY_SEGMENT_COLORS: Record<DaySegment, string> = {
  dawn: "var(--color-day-dawn)",
  day: "var(--color-day-light)",
  dusk: "var(--color-day-dusk)",
  night: "var(--color-day-night)",
};

export const LUNAR_SEGMENT_COLORS: Record<LunarSegment, string> = {
  "breath-in": "var(--color-cycle-in)",
  "breath-out": "var(--color-cycle-out)",
};

// ─── Primary format strings ────────────────────────────────────────────────────

/**
 * "H7:M4:S5 — Night"
 */
export function formatDayClock(r: DayClockReading): string {
  return `H${r.hour}:M${r.minute}:S${r.second} — ${DAY_SEGMENT_LABELS[r.segment]}`;
}

/**
 * "Month 3 / Growth / Breath-in"
 */
export function formatSolarYear(r: SolarYearReading): string {
  return `Month ${r.month} / ${META_SEASON_LABELS[r.metaSeason]} / ${BREATH_PHASE_LABELS[r.breathPhase]}`;
}

/**
 * "Grow-out — Day 12.4"
 */
export function formatEarthMonth(r: EarthMonthReading): string {
  const segLabel = EARTH_MONTH_SEGMENT_LABELS[r.segment];
  return `${segLabel} — Day ${r.localDay.toFixed(1)}`;
}

/**
 * "Breath-in — phase 4.2"
 * Uses the nonary 9-phase scale (0–9) instead of Gregorian synodic days.
 */
export function formatMoonClock(r: MoonClockReading): string {
  const segLabel = LUNAR_SEGMENT_LABELS[r.segment];
  const lunarPhase = r.synodicDay / LUNAR_PHASE_UNIT_DAYS;
  const peak =
    r.phasePeak === "full-moon"
      ? " ● Full Moon"
      : r.phasePeak === "new-moon"
        ? " ● New Moon"
        : "";
  return `${segLabel} — phase ${lunarPhase.toFixed(1)}${peak}`;
}

/**
 * All four primary display strings in one object for convenience.
 */
export function formatReading(r: Reading): {
  dayClock: string;
  solarYear: string;
  earthMonth: string;
  moonClock: string;
} {
  return {
    dayClock: formatDayClock(r.dayClock),
    solarYear: formatSolarYear(r.solarYear),
    earthMonth: formatEarthMonth(r.earthMonth),
    moonClock: formatMoonClock(r.moonClock),
  };
}

// ─── Conventional time equivalents ────────────────────────────────────────────

/**
 * Convert a fractional nonary hour to a "Xh Ym" conventional string.
 * e.g. 1.25 nonary hours = 200 conventional minutes = "3h 20m"
 */
export function nonaryHoursToConventional(nonaryHours: number): string {
  const totalMinutes = Math.round(nonaryHours * 160);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Lunar illumination fraction (0 = new moon darkness, 1 = full moon).
 * Based on a simple cosine model — sufficient for UI display.
 */
export function lunarIllumination(synodicDay: number): number {
  const { SYNODIC_MONTH_DAYS } = { SYNODIC_MONTH_DAYS: 29.53059 };
  return (1 - Math.cos((2 * Math.PI * synodicDay) / SYNODIC_MONTH_DAYS)) / 2;
}

/**
 * Named moon phase derived from illumination and waxing/waning direction.
 * "New Moon" → "Waxing Crescent" → "First Quarter" → "Waxing Gibbous" →
 * "Full Moon" → "Waning Gibbous" → "Last Quarter" → "Waning Crescent"
 */
export function moonPhaseName(r: MoonClockReading): string {
  const illum = lunarIllumination(r.synodicDay);
  const waxing = r.segment === "breath-in";
  if (illum < 0.03) return "New Moon";
  if (illum > 0.97) return "Full Moon";
  if (illum >= 0.47 && illum <= 0.53) return waxing ? "First Quarter" : "Last Quarter";
  if (illum < 0.47) return waxing ? "Waxing Crescent" : "Waning Crescent";
  return waxing ? "Waxing Gibbous" : "Waning Gibbous";
}

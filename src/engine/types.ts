/**
 * Human Cycles — Shared Types
 *
 * Core type definitions for the 9-based cyclical calendar system.
 */

/** A position within any 9-part cycle (1 through 9). */
export type CyclePosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** The five interpretive bands within each 40.58-day Earth month. */
export type Band = "Beginning" | "Middle" | "End" | "Threshold" | "Rest";

/** The three meta-seasons, each spanning 3 months. */
export type MetaSeason = "Growth" | "Peak" | "Decline";

/** Full reading for a given date across all cycle layers. */
export interface CycleReading {
  /** ISO date string of the Gregorian date */
  gregorianDate: string;
  /** Fractional elapsed days since epoch (Feb 1) */
  elapsedDays: number;
  /** Position in the 9-day Earth rotation cycle */
  earthDay: CyclePosition;
  /** Which of the 9 Earth months (40.58 days each) */
  earthMonth: CyclePosition;
  /** Which year in a 9-year macro-cycle */
  earthYear: CyclePosition;
  /** Position in the 9-phase lunar cycle within the synodic month */
  moonPhase: CyclePosition;
  /** Fractional day within the current 40.58-day Earth month (0-based) */
  dayInEarthMonth: number;
  /** Interpretive band derived from dayInEarthMonth */
  band: Band;
  /** Meta-season derived from earthMonth */
  metaSeason: MetaSeason;
  /** Emoji for the current meta-season */
  metaSeasonEmoji: string;
}

/** Metadata for a band: its span, meaning, and lunar relation. */
export interface BandInfo {
  band: Band;
  startDay: number;
  endDay: number;
  meaning: string;
  lunarRelation: string;
}

/** Metadata for a meta-season. */
export interface MetaSeasonInfo {
  name: MetaSeason;
  emoji: string;
  months: [CyclePosition, CyclePosition, CyclePosition];
  nature: string;
}

// ─── Nonary Calendar Types (new Reading system) ───────────────────────────────

/** Light/dark segment of the 9-hour nonary day. */
export type DaySegment = "dawn" | "day" | "dusk" | "night";

/** Breath phase within the solar year (two reversals per year). */
export type BreathPhase = "breath-in" | "reversal" | "breath-out";

/** The three meta-seasons of the nonary solar year. */
export type NonaryMetaSeason = "growth" | "peak" | "decline";

/** Segment of the 40.58-day Earth month breath cycle. */
export type EarthMonthSegment = "grow-in" | "pause-1" | "grow-out" | "pause-2";

/** Breath direction within the synodic moon cycle. */
export type LunarSegment = "breath-in" | "breath-out";

/** Notable lunar peak, or null if not within a peak window. */
export type LunarPeak = "full-moon" | "new-moon" | null;

/** Output of getDayClock: the 9-hour day position anchored to dawn. */
export interface DayClockReading {
  /** Nonary hour (1–9). */
  hour: number;
  /** Nonary minute within the hour (1–9). */
  minute: number;
  /** Nonary second within the minute (1–9). */
  second: number;
  /** Light/dark segment. */
  segment: DaySegment;
  /** Fractional nonary hours elapsed since dawn (0–9). */
  totalNonaryHours: number;
}

/** Output of getSolarYear: position within the 9-month solar year. */
export interface SolarYearReading {
  /** Current nonary month (1–9). */
  month: number;
  /** Meta-season grouping of three months. */
  metaSeason: NonaryMetaSeason;
  /** Breath phase of the year (two reversals: mid-year and year-end). */
  breathPhase: BreathPhase;
  /** Fractional day within the current 40-day rounded month (1.0–40.99…). */
  dayInMonth: number;
}

/** Output of getEarthMonth: position within the 40.58-day Earth month cycle. */
export interface EarthMonthReading {
  /** Fixed model descriptor. */
  model: "20-0.29-20-0.29";
  /** Which part of the breath cycle we are in. */
  segment: EarthMonthSegment;
  /** Fractional local day within the cycle (1.0–40.58…). */
  localDay: number;
}

/** Output of getMoonClock: position within the synodic lunar cycle. */
export interface MoonClockReading {
  /** Fractional day within the synodic month (0–29.53). */
  synodicDay: number;
  /** Breath direction. */
  segment: LunarSegment;
  /** Non-null only when within ±0.5 days of Full or New Moon. */
  phasePeak: LunarPeak;
}

/**
 * Combined reading for any Gregorian datetime across all four nonary clocks.
 * Build one with getReading(date) from reading.ts.
 */
export interface Reading {
  /** ISO-8601 datetime string of the input. */
  gregorianIso: string;
  /** Fractional days since the year epoch (Feb 1, 2026). */
  elapsedDaysFromYearEpoch: number;
  /** Minutes elapsed since dawn (default 06:00 UTC). */
  elapsedMinutesFromDayEpoch: number;
  /** The 9-hour day clock anchored to dawn. */
  dayClock: DayClockReading;
  /** The 9-month solar year, breath phases, and meta-seasons. */
  solarYear: SolarYearReading;
  /** The 40.58-day Earth month breath cycle. */
  earthMonth: EarthMonthReading;
  /** The synodic Moon clock (independent of Earth month). */
  moonClock: MoonClockReading;
}

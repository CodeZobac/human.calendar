import tzolkinDays from "../../tzolkin_days.json";

/** Permanent anchor for the continuous 260-day count. */
export const TZOLKIN_ANCHOR_DATE = "2026-07-27";
export const TZOLKIN_ANCHOR_POSITION = 146;

export const TZOLKIN_DAY_SIGNS = [
  "Imix", "Ik", "Ak'b'al", "K'an", "Chicchan",
  "Cimi", "Manik", "Lamat", "Muluc", "Oc",
  "Chuen", "Eb", "Ben", "Ix", "Men",
  "Cib", "Caban", "Etz'nab", "Cauac", "Ahau",
] as const;

export type TzolkinDaySign = (typeof TZOLKIN_DAY_SIGNS)[number];

export interface TzolkinDayMeaning {
  day_index: number;
  tone_index: number;
  tone_name: string;
  tone_keywords: string[];
  tone_description: string;
  sign_index: number;
  sign_name: string;
  sign_english_name: string;
  sign_keywords: string[];
  sign_description: string;
  combined_title: string;
  combined_meaning: string;
}

export const TZOLKIN_DAYS = tzolkinDays as TzolkinDayMeaning[];

export interface TzolkinReading {
  /** Gregorian date normalized to UTC. */
  gregorianDate: string;
  /** Integer Julian Day Number at UTC noon. */
  julianDayNumber: number;
  /** Repeating coefficient from 1 through 13. */
  coefficient: number;
  /** One of the twenty day signs in traditional order. */
  daySign: TzolkinDaySign;
  /** Zero-based index of the day sign. */
  daySignIndex: number;
  /** Position from 1 through 260 in the combined round. */
  position: number;
  /** Descriptive content mapped to this position in the 260-day dataset. */
  meaning: TzolkinDayMeaning;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/** Convert a Gregorian civil date to its integer Julian Day Number. */
export function gregorianToJdn(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return day
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045;
}

const TZOLKIN_ANCHOR_JDN = gregorianToJdn(new Date(`${TZOLKIN_ANCHOR_DATE}T12:00:00Z`));

/** Read a Gregorian date in the continuous, anchor-based 260-day count. */
export function getTzolkinReading(date: Date): TzolkinReading {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("getTzolkinReading requires a valid Date");
  }

  const julianDayNumber = gregorianToJdn(date);
  const elapsedDays = julianDayNumber - TZOLKIN_ANCHOR_JDN;
  const position = modulo(TZOLKIN_ANCHOR_POSITION - 1 + elapsedDays, 260) + 1;
  const daySignIndex = modulo(position - 1, 20);

  return {
    gregorianDate: [
      String(date.getUTCFullYear()).padStart(4, "0"),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    julianDayNumber,
    coefficient: modulo(position - 1, 13) + 1,
    daySign: TZOLKIN_DAY_SIGNS[daySignIndex],
    daySignIndex,
    position,
    meaning: TZOLKIN_DAYS[position - 1],
  };
}

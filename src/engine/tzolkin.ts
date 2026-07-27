/** The conventional Goodman–Martínez–Thompson correlation constant. */
export const GMT_CORRELATION = 584_283;

export const TZOLKIN_DAY_SIGNS = [
  "Imix’", "Ik’", "Ak’b’al", "K’an", "Chikchan",
  "Kimi", "Manik’", "Lamat", "Muluk", "Ok",
  "Chuwen", "Eb’", "B’en", "Ix", "Men",
  "K’ib’", "Kab’an", "Etz’nab’", "Kawak", "Ajaw",
] as const;

export type TzolkinDaySign = (typeof TZOLKIN_DAY_SIGNS)[number];

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

/** Read a Gregorian date in the traditional 260-day count using GMT 584283. */
export function getTzolkinReading(date: Date): TzolkinReading {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("getTzolkinReading requires a valid Date");
  }

  const julianDayNumber = gregorianToJdn(date);
  const elapsedDays = julianDayNumber - GMT_CORRELATION;
  const daySignIndex = modulo(elapsedDays + 19, 20);

  return {
    gregorianDate: [
      String(date.getUTCFullYear()).padStart(4, "0"),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-"),
    julianDayNumber,
    coefficient: modulo(elapsedDays + 3, 13) + 1,
    daySign: TZOLKIN_DAY_SIGNS[daySignIndex],
    daySignIndex,
    position: modulo(elapsedDays, 260) + 1,
  };
}

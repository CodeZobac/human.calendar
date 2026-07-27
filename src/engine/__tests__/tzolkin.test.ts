import { describe, expect, it } from "vitest";
import {
  TZOLKIN_ANCHOR_DATE,
  TZOLKIN_ANCHOR_POSITION,
  TZOLKIN_DAYS,
  getTzolkinReading,
  gregorianToJdn,
} from "../tzolkin";

const utc = (value: string) => new Date(`${value}T12:00:00Z`);

describe("Tzolk’in engine", () => {
  it("maps the permanent anchor to day 146, 3 Cimi", () => {
    expect(getTzolkinReading(utc(TZOLKIN_ANCHOR_DATE))).toMatchObject({
      coefficient: 3,
      daySign: "Cimi",
      daySignIndex: 5,
      position: TZOLKIN_ANCHOR_POSITION,
      meaning: {
        day_index: 146,
        tone_index: 3,
        tone_name: "Electric",
        sign_index: 6,
        sign_english_name: "White Worldbridger",
        combined_title: "Electric White Worldbridger",
      },
    });
  });

  it("maps all 260 meaning records to their number and sign cycles", () => {
    expect(TZOLKIN_DAYS).toHaveLength(260);

    TZOLKIN_DAYS.forEach((meaning, index) => {
      expect(meaning.day_index).toBe(index + 1);
      expect(meaning.tone_index).toBe((index % 13) + 1);
      expect(meaning.sign_index).toBe((index % 20) + 1);
      expect(meaning.tone_keywords.length).toBeGreaterThan(0);
      expect(meaning.sign_keywords.length).toBeGreaterThan(0);
      expect(meaning.tone_description).not.toBe("");
      expect(meaning.sign_description).not.toBe("");
      expect(meaning.combined_title).not.toBe("");
      expect(meaning.combined_meaning).not.toBe("");
    });
  });

  it("advances both component cycles on the following day", () => {
    expect(getTzolkinReading(utc("2026-07-28"))).toMatchObject({
      coefficient: 4,
      daySign: "Manik",
      position: 147,
    });
  });

  it("moves backward from the anchor without losing the cycle", () => {
    expect(getTzolkinReading(utc("2026-07-26"))).toMatchObject({
      coefficient: 2,
      daySign: "Chicchan",
      position: 145,
    });
  });

  it("repeats its component and complete cycles", () => {
    const anchor = utc(TZOLKIN_ANCHOR_DATE);
    const start = getTzolkinReading(anchor);
    const after13 = getTzolkinReading(utc("2026-08-09"));
    const after20 = getTzolkinReading(utc("2026-08-16"));
    const after260 = getTzolkinReading(utc("2027-04-13"));
    const before260 = getTzolkinReading(new Date(anchor.getTime() - 260 * 86_400_000));
    expect(after13.coefficient).toBe(start.coefficient);
    expect(after20.daySign).toBe(start.daySign);
    expect(after260).toMatchObject({
      coefficient: start.coefficient,
      daySign: start.daySign,
      position: start.position,
    });
    expect(before260).toMatchObject({
      coefficient: start.coefficient,
      daySign: start.daySign,
      position: start.position,
    });
  });

  it("maps day 1 to 1 Imix and wraps backward through day 260", () => {
    expect(getTzolkinReading(utc("2026-03-04"))).toMatchObject({
      coefficient: 1,
      daySign: "Imix",
      position: 1,
    });
    expect(getTzolkinReading(utc("2026-03-03"))).toMatchObject({
      coefficient: 13,
      daySign: "Ahau",
      position: 260,
    });
  });

  it("remains continuous across leap day and ignores time of day", () => {
    const leap = getTzolkinReading(utc("2024-02-29"));
    const next = getTzolkinReading(utc("2024-03-01"));
    expect(next.julianDayNumber - leap.julianDayNumber).toBe(1);
    expect(getTzolkinReading(new Date("2024-02-29T00:01:00Z"))).toEqual(leap);
  });

  it("converts Gregorian dates to stable Julian day numbers", () => {
    expect(gregorianToJdn(utc("2026-07-28")) - gregorianToJdn(utc("2026-07-27"))).toBe(1);
  });

  it("rejects invalid dates", () => {
    expect(() => getTzolkinReading(new Date(Number.NaN))).toThrow(RangeError);
  });
});

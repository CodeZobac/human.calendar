import { describe, expect, it } from "vitest";
import {
  TZOLKIN_DAYS,
  getTzolkinReading,
  gregorianToJdn,
} from "../tzolkin";

const utc = (value: string) => new Date(`${value}T12:00:00Z`);

describe("Tzolk’in engine", () => {
  it("matches the Dreamspell count published by tzolkin.io", () => {
    // tzolkin.io on 2026-11-17: Kin 83, Blue Overtone Night.
    expect(getTzolkinReading(utc("2026-11-17"))).toMatchObject({
      coefficient: 5,
      daySign: "Ak'b'al",
      daySignIndex: 2,
      position: 83,
      hunabKu: false,
      meaning: { day_index: 83, tone_index: 5, sign_index: 3, combined_title: "Noite Azul Harmónica" },
    });
    // The 13-Moon year beginning 2026-07-26 is Red Galactic Moon, Kin 229.
    expect(getTzolkinReading(utc("2026-07-26")).position).toBe(229);
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
    expect(getTzolkinReading(utc("2026-11-18"))).toMatchObject({ coefficient: 6, daySign: "K'an", position: 84 });
  });

  it("repeats after 260 days when no leap day intervenes", () => {
    const start = getTzolkinReading(utc("2026-11-17"));
    const after260 = getTzolkinReading(utc("2027-08-04"));
    expect(after260).toMatchObject({ coefficient: start.coefficient, daySign: start.daySign, position: start.position });
  });

  it("holds the Kin on 29 February and ignores time of day", () => {
    const feb28 = getTzolkinReading(utc("2028-02-28"));
    const leap = getTzolkinReading(utc("2028-02-29"));
    const mar1 = getTzolkinReading(utc("2028-03-01"));
    expect(feb28.hunabKu).toBe(false);
    expect(leap).toMatchObject({ hunabKu: true, position: feb28.position });
    expect(mar1.position).toBe((feb28.position % 260) + 1);
    expect(getTzolkinReading(new Date("2028-02-29T00:01:00Z"))).toEqual(leap);
  });

  it("converts Gregorian dates to stable Julian day numbers", () => {
    expect(gregorianToJdn(utc("2026-07-28")) - gregorianToJdn(utc("2026-07-27"))).toBe(1);
  });

  it("rejects invalid dates", () => {
    expect(() => getTzolkinReading(new Date(Number.NaN))).toThrow(RangeError);
  });
});

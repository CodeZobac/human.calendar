import { describe, expect, it } from "vitest";
import { MOONS, getThirteenMoonReading, thirteenMoonYearStart } from "../thirteenMoon";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("13-Moon year — validated position", () => {
  it("reads 27 July 2026 as Moon 1, Day 2", () => {
    const r = getThirteenMoonReading(utc("2026-07-27"));
    expect(r.moon).toBe(1);
    expect(r.day).toBe(2);
    expect(r.moonName).toBe("Magnetic Bat");
  });

  it("reads 26 July as Moon 1, Day 1 — the Galactic New Year", () => {
    const r = getThirteenMoonReading(utc("2026-07-26"));
    expect(r.moon).toBe(1);
    expect(r.day).toBe(1);
    expect(r.dayOfYear).toBe(1);
  });

  it("reads 25 July as the Day Out of Time, outside every moon", () => {
    const r = getThirteenMoonReading(utc("2026-07-25"));
    expect(r.isDayOutOfTime).toBe(true);
    expect(r.moon).toBeNull();
    expect(r.day).toBeNull();
    expect(r.dayOfYear).toBe(365);
  });
});

describe("13-Moon year — structure", () => {
  it("gives every moon exactly 28 days", () => {
    const counts = new Map<number, number>();
    let date = utc("2026-07-26");
    for (let i = 0; i < 364; i += 1) {
      const r = getThirteenMoonReading(date);
      if (r.moon !== null) counts.set(r.moon, (counts.get(r.moon) ?? 0) + 1);
      date = new Date(date.getTime() + 86_400_000);
    }
    expect(counts.size).toBe(13);
    for (const [, count] of counts) expect(count).toBe(28);
  });

  it("closes Moon 13 on day 28 and starts the next year the following day", () => {
    // 364 days after 26 Jul 2026 is 24 Jul 2027 — the last day of Moon 13.
    const last = getThirteenMoonReading(utc("2027-07-24"));
    expect(last.moon).toBe(13);
    expect(last.day).toBe(28);

    const dayOut = getThirteenMoonReading(utc("2027-07-25"));
    expect(dayOut.isDayOutOfTime).toBe(true);

    const newYear = getThirteenMoonReading(utc("2027-07-26"));
    expect(newYear.moon).toBe(1);
    expect(newYear.day).toBe(1);
    expect(newYear.yearStart).toBe(2027);
  });

  it("steps day-in-moon by one and rolls into the next moon at 28", () => {
    let date = utc("2026-08-21"); // inside Moon 1
    let previous = getThirteenMoonReading(date);
    for (let i = 0; i < 40; i += 1) {
      date = new Date(date.getTime() + 86_400_000);
      const r = getThirteenMoonReading(date);
      if (previous.day === 28) {
        expect(r.moon).toBe(previous.moon! + 1);
        expect(r.day).toBe(1);
      } else {
        expect(r.moon).toBe(previous.moon);
        expect(r.day).toBe(previous.day! + 1);
      }
      previous = r;
    }
  });

  it("maps day-in-moon onto four 7-day heptads", () => {
    const first = getThirteenMoonReading(utc("2026-07-26"));
    expect(first.heptad).toBe(0);
    expect(first.heptadDay).toBe(1);

    // Day 8 of a moon starts the second heptad.
    const day8 = getThirteenMoonReading(utc("2026-08-02"));
    expect(day8.day).toBe(8);
    expect(day8.heptad).toBe(1);
    expect(day8.heptadDay).toBe(1);

    // Day 28 closes the fourth heptad.
    const day28 = getThirteenMoonReading(utc("2026-08-22"));
    expect(day28.day).toBe(28);
    expect(day28.heptad).toBe(3);
    expect(day28.heptadDay).toBe(7);
  });

  it("names all thirteen moons", () => {
    expect(MOONS).toHaveLength(13);
    expect(MOONS[0].name).toBe("Magnetic Bat");
    expect(MOONS[12].name).toBe("Cosmic Turtle");
    expect(new Set(MOONS.map((m) => m.name)).size).toBe(13);
  });
});

describe("13-Moon year — boundaries and leap years", () => {
  it("attributes dates before 26 July to the previous cycle", () => {
    expect(thirteenMoonYearStart(utc("2026-07-25"))).toBe(2025);
    expect(thirteenMoonYearStart(utc("2026-07-26"))).toBe(2026);
    expect(thirteenMoonYearStart(utc("2027-03-01"))).toBe(2026);
    expect(thirteenMoonYearStart(utc("2027-01-01"))).toBe(2026);
  });

  it("holds the 13:28 grid steady across a leap February", () => {
    // The 2027 cycle contains 29 Feb 2028, which sits outside the grid.
    const before = getThirteenMoonReading(utc("2028-02-28"));
    const hunabKu = getThirteenMoonReading(utc("2028-02-29"));
    const after = getThirteenMoonReading(utc("2028-03-01"));

    expect(hunabKu.moon).toBeNull();
    expect(hunabKu.day).toBeNull();
    expect(hunabKu.isDayOutOfTime).toBe(false);

    // The day after the leap day continues where the day before left off.
    expect(after.moon).toBe(before.moon);
    expect(after.day).toBe(before.day! + 1);
  });

  it("still gives every moon 28 days in a leap cycle", () => {
    const counts = new Map<number, number>();
    let date = utc("2027-07-26");
    for (let i = 0; i < 365; i += 1) {
      const r = getThirteenMoonReading(date);
      if (r.moon !== null) counts.set(r.moon, (counts.get(r.moon) ?? 0) + 1);
      date = new Date(date.getTime() + 86_400_000);
    }
    expect(counts.size).toBe(13);
    for (const [, count] of counts) expect(count).toBe(28);
  });

  it("rejects an invalid Date", () => {
    expect(() => getThirteenMoonReading(new Date("nonsense"))).toThrow(RangeError);
  });

  it("reports the Gregorian date it read", () => {
    expect(getThirteenMoonReading(utc("2026-07-27")).gregorianDate).toBe("2026-07-27");
  });
});

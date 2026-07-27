import { describe, expect, it } from "vitest";
import {
  GMT_CORRELATION,
  getTzolkinReading,
  gregorianToJdn,
} from "../tzolkin";

const utc = (value: string) => new Date(`${value}T12:00:00Z`);

describe("Tzolk’in engine", () => {
  it("maps the Long Count epoch to 4 Ajaw", () => {
    const epoch = new Date(Date.UTC(-3113, 7, 11, 12));
    expect(gregorianToJdn(epoch)).toBe(GMT_CORRELATION);
    expect(getTzolkinReading(epoch)).toMatchObject({
      coefficient: 4,
      daySign: "Ajaw",
      position: 1,
    });
  });

  it("maps 2000-01-01 to 11 Ik’", () => {
    expect(getTzolkinReading(utc("2000-01-01"))).toMatchObject({
      coefficient: 11,
      daySign: "Ik’",
    });
  });

  it("advances both cycles on the following day", () => {
    expect(getTzolkinReading(utc("2000-01-02"))).toMatchObject({
      coefficient: 12,
      daySign: "Ak’b’al",
    });
  });

  it("repeats its component and complete cycles", () => {
    const start = getTzolkinReading(utc("2026-07-27"));
    const after13 = getTzolkinReading(utc("2026-08-09"));
    const after20 = getTzolkinReading(utc("2026-08-16"));
    const after260 = getTzolkinReading(utc("2027-04-13"));
    expect(after13.coefficient).toBe(start.coefficient);
    expect(after20.daySign).toBe(start.daySign);
    expect(after260).toMatchObject({
      coefficient: start.coefficient,
      daySign: start.daySign,
      position: start.position,
    });
  });

  it("remains continuous across leap day and ignores time of day", () => {
    const leap = getTzolkinReading(utc("2024-02-29"));
    const next = getTzolkinReading(utc("2024-03-01"));
    expect(next.julianDayNumber - leap.julianDayNumber).toBe(1);
    expect(getTzolkinReading(new Date("2024-02-29T00:01:00Z"))).toEqual(leap);
  });

  it("wraps cleanly before the correlation epoch", () => {
    const before = getTzolkinReading(new Date(Date.UTC(-3113, 7, 10, 12)));
    expect(before).toMatchObject({ coefficient: 3, daySign: "Kawak", position: 260 });
  });
});

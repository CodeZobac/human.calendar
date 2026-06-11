/**
 * Earth Month tests
 *
 * Validates the 20/0.29/20/0.29 segment boundaries from the plan,
 * wrap behaviour, localDay accuracy, and drift separation from the
 * Moon's 0.29-day pause windows.
 */

import { describe, it, expect } from "vitest";
import { getEarthMonth } from "../earthMonth";
import { getMoonClock } from "../moonClock";

const MONTH_PAUSE = 0.29;
const TOTAL_MONTH = 40 + 2 * MONTH_PAUSE; // 40.58

describe("getEarthMonth — segment boundaries (plan examples)", () => {
  it("day 19.99 → grow-in", () => {
    expect(getEarthMonth(19.99).segment).toBe("grow-in");
  });

  it("day 20.00 → pause-1 starts", () => {
    expect(getEarthMonth(20.0).segment).toBe("pause-1");
  });

  it("day 20.01 → pause-1", () => {
    expect(getEarthMonth(20.01).segment).toBe("pause-1");
  });

  it("day 20.28 → pause-1 (just inside)", () => {
    expect(getEarthMonth(20.28).segment).toBe("pause-1");
  });

  it("day 20.29 → grow-out starts", () => {
    expect(getEarthMonth(20.29).segment).toBe("grow-out");
  });

  it("day 30 → grow-out", () => {
    expect(getEarthMonth(30).segment).toBe("grow-out");
  });

  it("day 40.28 → grow-out (just before pause-2)", () => {
    expect(getEarthMonth(40.28).segment).toBe("grow-out");
  });

  it("day 40.29 → pause-2 starts", () => {
    expect(getEarthMonth(40.29).segment).toBe("pause-2");
  });

  it("day 40.57 → pause-2 (just inside)", () => {
    expect(getEarthMonth(40.57).segment).toBe("pause-2");
  });
});

describe("getEarthMonth — wrap at 40.58 days", () => {
  it("day 40.58 wraps back to grow-in", () => {
    expect(getEarthMonth(40.58).segment).toBe("grow-in");
  });

  it("day 0 and day 40.58 are both grow-in", () => {
    expect(getEarthMonth(0).segment).toBe(getEarthMonth(40.58).segment);
  });

  it("day 81.16 (two full cycles) equals day 0", () => {
    expect(getEarthMonth(TOTAL_MONTH * 2).segment).toBe(
      getEarthMonth(0).segment,
    );
  });

  it("negative days wrap into previous cycle", () => {
    // -1 normalises to 39.58 (= 40.58 - 1), which is inside grow-out [20.29, 40.29).
    const r = getEarthMonth(-1);
    expect(r.segment).toBe("grow-out");
  });
});

describe("getEarthMonth — localDay", () => {
  it("localDay at day 0 = 1", () => {
    expect(getEarthMonth(0).localDay).toBeCloseTo(1, 5);
  });

  it("localDay at day 19.99 is close to 20.99", () => {
    expect(getEarthMonth(19.99).localDay).toBeCloseTo(20.99, 1);
  });

  it("localDay at day 20 = 21 (start of pause-1)", () => {
    expect(getEarthMonth(20).localDay).toBeCloseTo(21, 5);
  });

  it('model string is always "20-0.29-20-0.29"', () => {
    expect(getEarthMonth(0).model).toBe("20-0.29-20-0.29");
    expect(getEarthMonth(22).model).toBe("20-0.29-20-0.29");
  });
});

describe("drift test — Moon pauses do not align with Earth month pauses", () => {
  /**
   * Over successive Earth months, we check whether the Moon's position
   * ever happens to sit inside the Earth's 0.29-day pause windows.
   *
   * Because the synodic month (29.53) does not divide the Earth month
   * (40.58) cleanly, the relative drift is ~11 days per month.  After
   * 9 Earth months the Moon has drifted ~99 days = 3.35 synodic months
   * ahead, so the phase alignment is entirely different.
   *
   * This test verifies the DRIFT PROOF: run 12 Earth months and assert
   * that the fraction of time the Moon is inside Earth pauses is NOT
   * constant (i.e. they genuinely drift apart).
   */
  it("Moon phase at Earth pause-1 start differs across 12 consecutive Earth months", () => {
    const SYNODIC = 29.53059;
    const moonDays: number[] = [];

    for (let n = 0; n < 12; n++) {
      // Day 20 of the nth Earth month
      const earthDay = n * TOTAL_MONTH + 20;
      // Moon elapsed day for the same moment (separate clock, drifts)
      const moonElapsed = earthDay; // same elapsed time, different epoch start
      const moonReading = getMoonClock(moonElapsed % SYNODIC);
      moonDays.push(moonReading.synodicDay);
    }

    // The Moon's synodic day at Earth pause-1 should vary significantly.
    const uniqueRoundedDays = new Set(moonDays.map((d) => Math.floor(d)));
    // Over 12 months, at least 3 different synodic day positions expected.
    expect(uniqueRoundedDays.size).toBeGreaterThan(3);
  });

  it("Moon is NOT reliably in a peak window during Earth pause-2", () => {
    const SYNODIC = 29.53059;
    let peakCount = 0;

    for (let n = 0; n < 9; n++) {
      // Day 40.29 of the nth Earth month
      const earthDay = n * TOTAL_MONTH + 40.29;
      const moonReading = getMoonClock(earthDay % SYNODIC);
      if (moonReading.phasePeak !== null) peakCount++;
    }

    // Over 9 months, peaks should not occur every single time.
    expect(peakCount).toBeLessThan(9);
  });
});

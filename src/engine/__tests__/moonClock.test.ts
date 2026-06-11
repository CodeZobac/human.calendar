/**
 * Moon Clock tests
 *
 * Validates Full Moon and New Moon peak detection, breath direction,
 * rollover at 14.765 and 29.53059, and negative/overflow wrap.
 */

import { describe, it, expect } from "vitest";
import { getMoonClock } from "../moonClock";

const SYNODIC = 29.53059;
const HALF_SYNODIC = SYNODIC / 2; // ≈ 14.765295

describe("getMoonClock — plan examples", () => {
  it('day 14.765 → phasePeak "full-moon"', () => {
    expect(getMoonClock(14.765).phasePeak).toBe("full-moon");
  });

  it('day 29.53 → phasePeak "new-moon"', () => {
    expect(getMoonClock(29.53).phasePeak).toBe("new-moon");
  });
});

describe("getMoonClock — breath direction", () => {
  it("day 0 (New Moon) → breath-in", () => {
    expect(getMoonClock(0).segment).toBe("breath-in");
  });

  it("day 7 (waxing crescent) → breath-in", () => {
    expect(getMoonClock(7).segment).toBe("breath-in");
  });

  it("day 14.765 (Full Moon) → still breath-in (just reached peak)", () => {
    // At exactly HALF_SYNODIC it's the boundary — breath-in (d < HALF_SYNODIC
    // is false here, so it's actually breath-out at the exact boundary).
    // The plan shows d < HALF_SYNODIC → breath-in, so at d = 14.765295 it's breath-out.
    // We test just before the boundary.
    expect(getMoonClock(HALF_SYNODIC - 0.001).segment).toBe("breath-in");
  });

  it("day 15 (waning after Full Moon) → breath-out", () => {
    expect(getMoonClock(15).segment).toBe("breath-out");
  });

  it("day 22 (waning crescent) → breath-out", () => {
    expect(getMoonClock(22).segment).toBe("breath-out");
  });

  it("day 29 (approaching New Moon) → breath-out", () => {
    expect(getMoonClock(29).segment).toBe("breath-out");
  });
});

describe("getMoonClock — Full Moon peak window (±0.5 days around 14.765)", () => {
  it("day 14.265 (exactly 0.5 before Full Moon) → null (outside window)", () => {
    // boundary is exclusive: Math.abs(d - HALF) < 0.5, so 0.5 is NOT inside
    expect(getMoonClock(14.265).phasePeak).toBeNull();
  });

  it("day 14.3 (inside Full Moon window) → full-moon", () => {
    expect(getMoonClock(14.3).phasePeak).toBe("full-moon");
  });

  it("day 15.2 (inside Full Moon window) → full-moon", () => {
    expect(getMoonClock(15.2).phasePeak).toBe("full-moon");
  });

  it("day 15.27 (0.5 after Full Moon) → null (just outside)", () => {
    // HALF_SYNODIC ≈ 14.7653, so +0.5 ≈ 15.2653; 15.27 > boundary
    expect(getMoonClock(15.27).phasePeak).toBeNull();
  });
});

describe("getMoonClock — New Moon peak window (±0.5 days around 0 / 29.53)", () => {
  it("day 0 → new-moon", () => {
    expect(getMoonClock(0).phasePeak).toBe("new-moon");
  });

  it("day 0.4 → new-moon", () => {
    expect(getMoonClock(0.4).phasePeak).toBe("new-moon");
  });

  it("day 0.5 → null (just outside)", () => {
    expect(getMoonClock(0.5).phasePeak).toBeNull();
  });

  it("day 29.1 (inside New Moon window from the right) → new-moon", () => {
    expect(getMoonClock(29.1).phasePeak).toBe("new-moon");
  });

  it("day 29.03 → null (threshold is 29.03059, so 29.03 is just outside)", () => {
    // New Moon window: d > SYNODIC - 0.5 = 29.03059
    // 29.03 < 29.03059, so it falls outside the window.
    expect(getMoonClock(29.03).phasePeak).toBeNull();
  });

  it("day 29.04 → new-moon (just inside from the right)", () => {
    // 29.04 > 29.03059 → inside window
    expect(getMoonClock(29.04).phasePeak).toBe("new-moon");
  });

  it("day 28.9 → null (well outside New Moon window)", () => {
    // 29.53059 - 0.5 = 29.03059; 28.9 < threshold
    expect(getMoonClock(28.9).phasePeak).toBeNull();
  });
});

describe("getMoonClock — rollover at 29.53059", () => {
  it("day 29.53059 wraps to same as day 0", () => {
    expect(getMoonClock(SYNODIC).segment).toBe(getMoonClock(0).segment);
    expect(getMoonClock(SYNODIC).phasePeak).toBe(getMoonClock(0).phasePeak);
  });

  it("day 59.06118 (two full cycles) same as day 0", () => {
    expect(getMoonClock(SYNODIC * 2).phasePeak).toBe(getMoonClock(0).phasePeak);
  });
});

describe("getMoonClock — negative wrap (pre-epoch)", () => {
  it("day -1 wraps into previous cycle (breath-out)", () => {
    expect(getMoonClock(-1).segment).toBe("breath-out");
  });

  it("day -SYNODIC wraps to same as day 0", () => {
    expect(getMoonClock(-SYNODIC).phasePeak).toBe(getMoonClock(0).phasePeak);
  });
});

describe("getMoonClock — synodicDay value", () => {
  it("synodicDay is always in [0, SYNODIC)", () => {
    for (let d = -60; d <= 120; d += 3.7) {
      const r = getMoonClock(d);
      expect(r.synodicDay).toBeGreaterThanOrEqual(0);
      expect(r.synodicDay).toBeLessThan(SYNODIC);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  DREAMSPELL_ANCHOR_KIN,
  colorOf,
  getDreamspellReading,
  getKin,
  getOracle,
  kinFromToneAndSeal,
  sealOf,
  signatureOf,
  toneOf,
} from "../dreamspell";

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("Dreamspell count — validated checkpoints", () => {
  it("returns Kin 34 White Galactic Wizard on the 26 July 1987 anchor", () => {
    const r = getDreamspellReading(utc("1987-07-26"));
    expect(r.kin).toBe(DREAMSPELL_ANCHOR_KIN);
    expect(r.signature).toBe("White Galactic Wizard");
  });

  it("returns Kin 229 Red Galactic Moon on the 26 July 2026 Galactic New Year", () => {
    // Independently published as the Red Galactic Moon year bearer.
    const r = getDreamspellReading(utc("2026-07-26"));
    expect(r.kin).toBe(229);
    expect(r.signature).toBe("Red Galactic Moon");
  });

  it("returns Kin 230 White Solar Dog on 27 July 2026", () => {
    const r = getDreamspellReading(utc("2026-07-27"));
    expect(r.kin).toBe(230);
    expect(r.tone).toBe(9);
    expect(r.seal).toBe(10);
    expect(r.signature).toBe("White Solar Dog");
  });

  it("skips 29 February as 0.0 Hunab Ku without advancing the count", () => {
    expect(getKin(utc("2020-02-28"))).toBe(231);
    expect(getKin(utc("2020-02-29"))).toBeNull();
    expect(getKin(utc("2020-03-01"))).toBe(232);
  });

  it("describes the Hunab Ku day with every kin field nulled", () => {
    const r = getDreamspellReading(utc("2024-02-29"));
    expect(r.isHunabKu).toBe(true);
    expect(r.kin).toBeNull();
    expect(r.tone).toBeNull();
    expect(r.seal).toBeNull();
    expect(r.oracle).toBeNull();
    expect(r.signature).toBe("0.0 Hunab Ku");
  });
});

describe("Dreamspell count — structure", () => {
  it("advances exactly one kin per day across a non-leap span", () => {
    let previous = getKin(utc("2026-03-01"))!;
    for (let day = 2; day <= 31; day += 1) {
      const kin = getKin(utc(`2026-03-${String(day).padStart(2, "0")}`))!;
      expect(kin).toBe((previous % 260) + 1);
      previous = kin;
    }
  });

  it("wraps 260 back to 1", () => {
    // Walk forward from the anchor to the kin-260 day and check the next day.
    let date = utc("1987-07-26");
    for (let i = 0; i < 400; i += 1) {
      const kin = getKin(date);
      if (kin === 260) {
        const next = new Date(date.getTime() + 86_400_000);
        expect(getKin(next)).toBe(1);
        return;
      }
      date = new Date(date.getTime() + 86_400_000);
    }
    throw new Error("never reached kin 260");
  });

  it("returns the same kin 260 days apart", () => {
    const a = getKin(utc("2026-07-27"));
    // 260 count-days later, staying clear of a leap February.
    const b = getKin(new Date(utc("2026-07-27").getTime() + 260 * 86_400_000));
    expect(b).toBe(a);
  });

  it("works for dates before the 1987 anchor", () => {
    // One day before the anchor must be Kin 33.
    expect(getKin(utc("1987-07-25"))).toBe(33);
    // Across an earlier leap day the count still steps by one per day.
    expect(getKin(utc("1984-02-28"))).toBe(getKin(utc("1984-03-01"))! - 1);
    expect(getKin(utc("1984-02-29"))).toBeNull();
  });

  it("derives tone, seal and colour consistently", () => {
    expect(toneOf(1)).toBe(1);
    expect(sealOf(1)).toBe(1);
    expect(toneOf(260)).toBe(13);
    expect(sealOf(260)).toBe(20);
    expect(colorOf(1)).toBe("Red");
    expect(colorOf(2)).toBe("White");
    expect(colorOf(3)).toBe("Blue");
    expect(colorOf(4)).toBe("Yellow");
    expect(colorOf(5)).toBe("Red");
  });

  it("round-trips every kin through tone and seal", () => {
    for (let kin = 1; kin <= 260; kin += 1) {
      expect(kinFromToneAndSeal(toneOf(kin), sealOf(kin))).toBe(kin);
    }
  });

  it("names all 260 signatures uniquely", () => {
    const names = new Set<string>();
    for (let kin = 1; kin <= 260; kin += 1) names.add(signatureOf(kin));
    expect(names.size).toBe(260);
  });

  it("assigns wavespell and castle across the round", () => {
    expect(getDreamspellReading(utc("1987-07-26")).wavespell).toBe(3);
    const first = getOracle(1);
    expect(first.analog).toBe(1);
  });
});

describe("Dreamspell Oracle", () => {
  it("keeps the guide and antipode on the kin's own tone", () => {
    for (const kin of [1, 34, 116, 229, 230, 260]) {
      const o = getOracle(kin);
      expect(toneOf(o.guide)).toBe(toneOf(kin));
      expect(toneOf(o.antipode)).toBe(toneOf(kin));
    }
  });

  it("places the antipode ten seals away", () => {
    for (const kin of [1, 34, 130, 230, 260]) {
      const o = getOracle(kin);
      const gap = Math.abs(sealOf(o.antipode) - sealOf(kin));
      expect(Math.min(gap, 20 - gap)).toBe(10);
    }
  });

  it("puts the occult tone in complement so the pair sums to 14", () => {
    for (const kin of [1, 34, 116, 230, 260]) {
      const o = getOracle(kin);
      expect(toneOf(o.occult) + toneOf(kin)).toBe(14);
    }
  });

  it("is reciprocal: the antipode of the antipode is the kin", () => {
    for (let kin = 1; kin <= 260; kin += 1) {
      expect(getOracle(getOracle(kin).antipode).antipode).toBe(kin);
    }
  });

  it("is reciprocal for the occult position", () => {
    for (let kin = 1; kin <= 260; kin += 1) {
      expect(getOracle(getOracle(kin).occult).occult).toBe(kin);
    }
  });
});

describe("Dreamspell validation", () => {
  it("rejects an invalid Date", () => {
    expect(() => getDreamspellReading(new Date("nonsense"))).toThrow(RangeError);
  });

  it("reports the Gregorian date it read", () => {
    expect(getDreamspellReading(utc("2026-07-27")).gregorianDate).toBe("2026-07-27");
  });

  it("ignores time of day", () => {
    const morning = new Date("2026-07-27T01:00:00Z");
    const night = new Date("2026-07-27T23:30:00Z");
    expect(getKin(morning)).toBe(getKin(night));
  });
});

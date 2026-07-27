import { describe, expect, it } from "vitest";
import {
  COLOR_MEANINGS,
  SEAL_MEANINGS,
  TONE_MEANINGS,
  affirmationFor,
} from "../galacticMeaning";
import { getOracle, sealOf, toneOf } from "../dreamspell";

describe("galactic meaning data", () => {
  it("covers all twenty seals and thirteen tones", () => {
    for (let seal = 1; seal <= 20; seal += 1) expect(SEAL_MEANINGS[seal]).toBeDefined();
    for (let tone = 1; tone <= 13; tone += 1) expect(TONE_MEANINGS[tone]).toBeDefined();
    expect(Object.keys(SEAL_MEANINGS)).toHaveLength(20);
    expect(Object.keys(TONE_MEANINGS)).toHaveLength(13);
  });

  it("covers all four colour families", () => {
    for (const color of ["Red", "White", "Blue", "Yellow"]) {
      expect(COLOR_MEANINGS[color]).toBeDefined();
    }
  });

  it("gives every seal a distinct gloss with real prose", () => {
    const glosses = new Set<string>();
    for (let seal = 1; seal <= 20; seal += 1) {
      const { gloss } = SEAL_MEANINGS[seal];
      expect(gloss.length).toBeGreaterThan(30);
      glosses.add(gloss);
    }
    expect(glosses.size).toBe(20);
  });

  it("pairs each third-person action with a first-person verb", () => {
    for (let seal = 1; seal <= 20; seal += 1) {
      const { action, verb } = SEAL_MEANINGS[seal];
      expect(verb).toBe(verb.toLowerCase());
      // "Loves" → "love": the verb is the action stem.
      expect(action.toLowerCase().startsWith(verb.slice(0, 4))).toBe(true);
    }
    for (let tone = 1; tone <= 13; tone += 1) {
      const { action, verb } = TONE_MEANINGS[tone];
      expect(verb).toBe(verb.toLowerCase());
      expect(action.toLowerCase().startsWith(verb.slice(0, 4))).toBe(true);
    }
  });
});

describe("affirmations", () => {
  /** Build the affirmation the way the UI does, from a kin number. */
  const affirmationOf = (kin: number) =>
    affirmationFor(
      toneOf(kin),
      sealOf(kin),
      [
        "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone",
        "Rhythmic", "Resonant", "Galactic", "Solar", "Planetary",
        "Spectral", "Crystal", "Cosmic",
      ][toneOf(kin) - 1],
      sealOf(getOracle(kin).guide),
    );

  it("renders Kin 230 in grammatical first person", () => {
    expect(affirmationOf(230)).toBe(
      "I pulse in order to love. Realizing loyalty, I seal the process of heart " +
        "with the solar tone of intention. I am guided by the power of death.",
    );
  });

  it("matches the published Kin 229 year-bearer affirmation", () => {
    // Published: "I harmonize in order to purify / Modeling flow / I seal the
    // process of universal water / with the galactic tone of integrity / I am
    // guided by the power of space."
    expect(affirmationOf(229)).toBe(
      "I harmonize in order to purify. Modeling flow, I seal the process of universal water " +
        "with the galactic tone of integrity. I am guided by the power of space.",
    );
  });

  it("never emits a doubled third-person verb after 'I'", () => {
    // Guards the "I pulses in order to loves" bug class.
    for (let kin = 1; kin <= 260; kin += 1) {
      const text = affirmationOf(kin);
      expect(text).toMatch(/^I [a-z]+ in order to [a-z]+\./);
      expect(text).not.toMatch(/^I [a-z]+s in order to/);
      expect(text).not.toMatch(/in order to [a-z]+s\./);
    }
  });

  it("always closes with the power of a real seal", () => {
    const powers = Object.values(SEAL_MEANINGS).map((m) => m.power.toLowerCase());
    for (let kin = 1; kin <= 260; kin += 1) {
      const match = affirmationOf(kin).match(/guided by the power of ([a-z -]+)\.$/);
      expect(match).not.toBeNull();
      expect(powers).toContain(match![1]);
    }
  });

  it("closes every affirmation as a complete four-clause statement", () => {
    for (let kin = 1; kin <= 260; kin += 1) {
      const text = affirmationOf(kin);
      expect(text.endsWith(".")).toBe(true);
      expect(text.split(". ")).toHaveLength(3);
      expect(text).toContain("I seal the process of");
      expect(text).toContain("tone of");
    }
  });
});

/**
 * Solar Year tests
 *
 * Validates breath phase boundaries at days 180, 182.621, 362.621 and
 * 365.24219; meta-season assignments; month rollover every 40 days;
 * and wrap behaviour across year boundaries.
 */

import { describe, it, expect } from 'vitest';
import { getSolarYear } from '../solarYear';

const YEAR_REVERSAL = (365.24219 - 360) / 2; // ≈ 2.621095

describe('getSolarYear — breath phase boundaries', () => {
  it('day 0 → breath-in', () => {
    expect(getSolarYear(0).breathPhase).toBe('breath-in');
  });

  it('day 90 → breath-in', () => {
    expect(getSolarYear(90).breathPhase).toBe('breath-in');
  });

  it('day 179.99 → breath-in (just before mid-year reversal)', () => {
    expect(getSolarYear(179.99).breathPhase).toBe('breath-in');
  });

  it('day 180 → reversal (mid-year gate opens)', () => {
    expect(getSolarYear(180).breathPhase).toBe('reversal');
  });

  it('day 181 → reversal (inside mid-year gate)', () => {
    expect(getSolarYear(181).breathPhase).toBe('reversal');
  });

  it('day 180 + YEAR_REVERSAL → breath-out starts', () => {
    expect(getSolarYear(180 + YEAR_REVERSAL).breathPhase).toBe('breath-out');
  });

  it('day 270 → breath-out', () => {
    expect(getSolarYear(270).breathPhase).toBe('breath-out');
  });

  it('day 362.62 → breath-out (just before year-end reversal)', () => {
    expect(getSolarYear(362.62).breathPhase).toBe('breath-out');
  });

  it('day 362.621 → reversal (year-end gate)', () => {
    const boundary = 180 + YEAR_REVERSAL + 180;
    expect(getSolarYear(boundary).breathPhase).toBe('reversal');
  });

  it('day 365.24219 wraps cleanly to breath-in of next year', () => {
    expect(getSolarYear(365.24219).breathPhase).toBe('breath-in');
  });
});

describe('getSolarYear — month rollover (every 40 days)', () => {
  it('day 0 → month 1', () => {
    expect(getSolarYear(0).month).toBe(1);
  });

  it('day 39.99 → month 1', () => {
    expect(getSolarYear(39.99).month).toBe(1);
  });

  it('day 40 → month 2', () => {
    expect(getSolarYear(40).month).toBe(2);
  });

  it('day 79.99 → month 2', () => {
    expect(getSolarYear(79.99).month).toBe(2);
  });

  it('day 80 → month 3', () => {
    expect(getSolarYear(80).month).toBe(3);
  });

  it('day 320 → month 9', () => {
    expect(getSolarYear(320).month).toBe(9);
  });

  it('month never exceeds 9 during reversal days', () => {
    expect(getSolarYear(361).month).toBe(9);
    expect(getSolarYear(363).month).toBe(9);
    expect(getSolarYear(365).month).toBe(9);
  });
});

describe('getSolarYear — meta-seasons', () => {
  it('months 1–3 → growth', () => {
    expect(getSolarYear(0).metaSeason).toBe('growth');    // month 1
    expect(getSolarYear(80).metaSeason).toBe('growth');   // month 3
  });

  it('months 4–6 → peak', () => {
    expect(getSolarYear(120).metaSeason).toBe('peak');    // month 4
    expect(getSolarYear(200).metaSeason).toBe('peak');    // month 6
  });

  it('months 7–9 → decline', () => {
    expect(getSolarYear(240).metaSeason).toBe('decline'); // month 7
    expect(getSolarYear(320).metaSeason).toBe('decline'); // month 9
  });
});

describe('getSolarYear — dayInMonth', () => {
  it('day 0 → dayInMonth 1.0', () => {
    expect(getSolarYear(0).dayInMonth).toBeCloseTo(1, 5);
  });

  it('day 40 (start of month 2) → dayInMonth 1.0', () => {
    expect(getSolarYear(40).dayInMonth).toBeCloseTo(1, 5);
  });

  it('day 50 → dayInMonth 11.0', () => {
    expect(getSolarYear(50).dayInMonth).toBeCloseTo(11, 5);
  });
});

describe('getSolarYear — year wrap', () => {
  it('negative elapsed days wrap into previous year', () => {
    const r = getSolarYear(-1);
    expect(r.month).toBeGreaterThanOrEqual(1);
    expect(r.month).toBeLessThanOrEqual(9);
  });

  it('exactly one year (365.24219) equals day 0 reading', () => {
    expect(getSolarYear(365.24219).month).toBe(getSolarYear(0).month);
    expect(getSolarYear(365.24219).breathPhase).toBe(getSolarYear(0).breathPhase);
  });
});

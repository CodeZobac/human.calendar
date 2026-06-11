/**
 * Day Clock tests
 *
 * Validates segment boundaries, base-9 time components, and wrap-around
 * behaviour for negative and >1440 minute inputs.
 */

import { describe, it, expect } from 'vitest';
import { getDayClock } from '../dayClock';

describe('getDayClock — segment boundaries', () => {
  it('0 min (dawn start) → dawn segment', () => {
    expect(getDayClock(0).segment).toBe('dawn');
  });

  it('just before 0.5 nonary hours (79 min) → dawn', () => {
    // 0.5 nonary hours = 80 min; 79 min < boundary
    expect(getDayClock(79).segment).toBe('dawn');
  });

  it('exactly 0.5 nonary hours (80 min) → day segment starts', () => {
    expect(getDayClock(80).segment).toBe('day');
  });

  it('mid-day (400 min) → day', () => {
    expect(getDayClock(400).segment).toBe('day');
  });

  it('just before 4.5 nonary hours (719 min) → day', () => {
    // 4.5 nonary hours = 720 min; 719 min < boundary
    expect(getDayClock(719).segment).toBe('day');
  });

  it('exactly 4.5 nonary hours (720 min) → dusk starts', () => {
    expect(getDayClock(720).segment).toBe('dusk');
  });

  it('mid-dusk (760 min) → dusk', () => {
    expect(getDayClock(760).segment).toBe('dusk');
  });

  it('just before 5.0 nonary hours (799 min) → dusk', () => {
    // 5.0 nonary hours = 800 min; 799 min < boundary
    expect(getDayClock(799).segment).toBe('dusk');
  });

  it('exactly 5.0 nonary hours (800 min) → night starts', () => {
    expect(getDayClock(800).segment).toBe('night');
  });

  it('deep night (1200 min) → night', () => {
    expect(getDayClock(1200).segment).toBe('night');
  });

  it('1439 min (just before full cycle) → night', () => {
    expect(getDayClock(1439).segment).toBe('night');
  });

  it('1440 min (full cycle) wraps back to dawn', () => {
    expect(getDayClock(1440).segment).toBe('dawn');
  });
});

describe('getDayClock — base-9 time components', () => {
  it('hour is 1 at time 0', () => {
    expect(getDayClock(0).hour).toBe(1);
  });

  it('hour advances every 160 min', () => {
    expect(getDayClock(160).hour).toBe(2);
    expect(getDayClock(320).hour).toBe(3);
    expect(getDayClock(640).hour).toBe(5);
    expect(getDayClock(1280).hour).toBe(9);
  });

  it('minute and second are always in [1, 9]', () => {
    for (let m = 0; m < 1440; m += 37) {
      const r = getDayClock(m);
      expect(r.minute).toBeGreaterThanOrEqual(1);
      expect(r.minute).toBeLessThanOrEqual(9);
      expect(r.second).toBeGreaterThanOrEqual(1);
      expect(r.second).toBeLessThanOrEqual(9);
    }
  });

  it('totalNonaryHours at 480 min = 3.0', () => {
    expect(getDayClock(480).totalNonaryHours).toBeCloseTo(3.0, 5);
  });
});

describe('getDayClock — negative wrap (pre-dawn)', () => {
  it('-1 min wraps to deep night', () => {
    expect(getDayClock(-1).segment).toBe('night');
  });

  it('-80 min wraps to night (just before previous dawn)', () => {
    // -80 min ≡ 1440-80 = 1360 min → night
    expect(getDayClock(-80).segment).toBe('night');
  });

  it('-1440 min (one full day back) is same as 0', () => {
    expect(getDayClock(-1440).segment).toBe('dawn');
  });
});

describe('getDayClock — over-full-cycle wrap', () => {
  it('2880 min (two full cycles) = same as 0', () => {
    expect(getDayClock(2880).segment).toBe('dawn');
  });

  it('1520 min (1440 + 80) is same as 80 min → day', () => {
    expect(getDayClock(1520).segment).toBe(getDayClock(80).segment);
  });
});

/**
 * Human Cycles — Geo / Dawn Service
 *
 * Two responsibilities:
 *   1. Detect the user's approximate location from their IP address.
 *   2. Fetch the precise astronomical sunrise for that location and date.
 *
 * APIs used (both free, no API key required):
 *   IP location : https://ipapi.co/json/
 *   Sunrise     : https://api.sunrise-sunset.org/json
 *
 * Results are cached in localStorage so that the sunrise-sunset API is
 * never called more than once per location+date pair, and the IP lookup
 * is refreshed at most once every 24 hours.
 *
 * The daily sunrise drift (minutes/day) is computed from today's and
 * tomorrow's sunrise times and mirrors the year's own breath:
 *
 *   Spring / Autumn equinox → ~2.26 min/day   (fastest reversal)
 *   Summer / Winter solstice → ~0.01 min/day  (clock nearly frozen)
 */

// ── Public types ──────────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;       // IANA zone, e.g. "Europe/Warsaw"
  countryCode: string;
}

export interface DawnInfo {
  /** Astronomical sunrise time (UTC). This becomes Hour 1 of the day clock. */
  sunrise: Date;
  /** Astronomical sunset time (UTC). */
  sunset: Date;
  /**
   * How many minutes earlier (negative) or later (positive) sunrise is
   * tomorrow compared to today.  Near zero at solstices, ±2.26 at equinoxes.
   */
  dailyDriftMinutes: number;
  /** Location resolved from the user's IP. */
  location: GeoLocation;
  /** YYYY-MM-DD string for the date this info covers. */
  dateStr: string;
  /** Whether real geolocation was used or a fallback. */
  source: 'geolocation' | 'fallback';
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

const GEO_KEY = 'hc_geo_v3';
const SUN_KEY_PREFIX = 'hc_sun_v3_';
const GEO_TTL = 24 * 60 * 60 * 1000; // 24 h

function cacheRead<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { d, ts } = JSON.parse(raw) as { d: T; ts: number };
    if (maxAgeMs && Date.now() - ts > maxAgeMs) return null;
    return d;
  } catch {
    return null;
  }
}

function cacheWrite(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ d: data, ts: Date.now() }));
  } catch { /* storage full or unavailable */ }
}

// ── IP geolocation ────────────────────────────────────────────────────────────

async function fetchIPLocation(): Promise<GeoLocation> {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) throw new Error(`ipapi.co ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = await res.json() as any;
  if (!j.latitude) throw new Error('ipapi.co: no coordinates in response');
  return {
    latitude:    Number(j.latitude),
    longitude:   Number(j.longitude),
    city:        String(j.city        ?? 'Unknown'),
    timezone:    String(j.timezone    ?? 'UTC'),
    countryCode: String(j.country_code ?? ''),
  };
}

async function getIPLocation(): Promise<GeoLocation> {
  const cached = cacheRead<GeoLocation>(GEO_KEY, GEO_TTL);
  if (cached) return cached;
  const loc = await fetchIPLocation();
  cacheWrite(GEO_KEY, loc);
  return loc;
}

// ── Sunrise / Sunset ──────────────────────────────────────────────────────────

interface RawSun { sunrise: string; sunset: string }

async function fetchSun(lat: number, lng: number, dateStr: string): Promise<RawSun> {
  const url =
    `https://api.sunrise-sunset.org/json` +
    `?lat=${lat}&lng=${lng}&date=${dateStr}&formatted=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sunrise-sunset.org ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const j = await res.json() as any;
  if (j.status !== 'OK') throw new Error(`sunrise-sunset.org status: ${j.status}`);

  // Guard against polar edge cases (returns "1970-01-01T00:00:01+00:00")
  const sr = String(j.results.sunrise);
  const ss = String(j.results.sunset);
  if (sr.startsWith('1970')) throw new Error('Polar day/night — no sunrise');
  return { sunrise: sr, sunset: ss };
}

async function getSun(lat: number, lng: number, dateStr: string): Promise<{ sunrise: Date; sunset: Date }> {
  const key = `${SUN_KEY_PREFIX}${lat.toFixed(3)}_${lng.toFixed(3)}_${dateStr}`;
  const cached = cacheRead<RawSun>(key); // sunrise times don't expire
  const raw = cached ?? await (async () => {
    const result = await fetchSun(lat, lng, dateStr);
    cacheWrite(key, result);
    return result;
  })();
  return { sunrise: new Date(raw.sunrise), sunset: new Date(raw.sunset) };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function nextDateStr(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return toDateStr(d);
}

// ── Fallback location (UTC, no location data) ─────────────────────────────────

const FALLBACK: GeoLocation = {
  latitude:    51.477,
  longitude:   0.0,
  city:        'Greenwich',
  timezone:    'UTC',
  countryCode: 'GB',
};

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Resolve the user's location from their IP address, then fetch the
 * precise sunrise and sunset for the given date at that location.
 *
 * Also fetches tomorrow's sunrise so we can report the daily drift.
 *
 * Falls back to a fixed 06:00 UTC dawn if either API is unreachable.
 */
export async function getDawnInfo(date: Date): Promise<DawnInfo> {
  const dateStr      = toDateStr(date);
  const tomorrowStr  = nextDateStr(dateStr);

  // ── Resolve location ──────────────────────────────────────────────────────
  let location: GeoLocation;
  let source: DawnInfo['source'];
  try {
    location = await getIPLocation();
    source   = 'geolocation';
  } catch {
    location = FALLBACK;
    source   = 'fallback';
  }

  const { latitude: lat, longitude: lng } = location;

  // ── Fetch today + tomorrow in parallel ────────────────────────────────────
  const [todayResult, tomorrowResult] = await Promise.allSettled([
    getSun(lat, lng, dateStr),
    getSun(lat, lng, tomorrowStr),
  ]);

  if (todayResult.status === 'rejected') {
    // Full fallback: 06:00 UTC
    return {
      sunrise:           new Date(`${dateStr}T06:00:00Z`),
      sunset:            new Date(`${dateStr}T18:00:00Z`),
      dailyDriftMinutes: 0,
      location,
      dateStr,
      source: 'fallback',
    };
  }

  const { sunrise, sunset } = todayResult.value;

  // Drift: how many minutes does sunrise shift per day?
  // Negative  → getting earlier  (spring, days lengthening)
  // Positive  → getting later    (autumn, days shortening)
  // ≈ 0       → at a solstice
  let dailyDriftMinutes = 0;
  if (tomorrowResult.status === 'fulfilled') {
    dailyDriftMinutes =
      (tomorrowResult.value.sunrise.getTime() - sunrise.getTime()) / 60_000;
  }

  return { sunrise, sunset, dailyDriftMinutes, location, dateStr, source };
}

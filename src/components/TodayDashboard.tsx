import type { CSSProperties } from "react";
import type { Reading } from "../engine/types";
import {
  BREATH_PHASE_LABELS,
  DAY_SEGMENT_COLORS,
  EARTH_MONTH_SEGMENT_LABELS,
  LUNAR_SEGMENT_COLORS,
  LUNAR_SEGMENT_LABELS,
  META_SEASON_COLORS,
  META_SEASON_EMOJIS,
  META_SEASON_LABELS,
  formatDayClock,
  formatEarthMonth,
  formatMoonClock,
  formatSolarYear,
  lunarIllumination,
  nonaryHoursToConventional,
} from "../engine/viewModel";
import type { DawnInfo } from "../services/geo";
import MonthTimeline from "./MonthTimeline";
import "./TodayDashboard.css";

interface TodayDashboardProps {
  reading: Reading;
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  isToday: boolean;
  onResetToday: () => void;
  dawnInfo?: DawnInfo | null;
}

function toInputDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fromInputDate(s: string): Date {
  return new Date(`${s}T12:00:00Z`);
}

export default function TodayDashboard({
  reading,
  selectedDate,
  onDateChange,
  isToday,
  onResetToday,
  dawnInfo,
}: TodayDashboardProps) {
  const { dayClock, solarYear, earthMonth, moonClock } = reading;
  const seasonColor = META_SEASON_COLORS[solarYear.metaSeason];
  const dayColor = DAY_SEGMENT_COLORS[dayClock.segment];
  const moonColor = LUNAR_SEGMENT_COLORS[moonClock.segment];
  const earthMonthColor =
    earthMonth.segment === "grow-in" || earthMonth.segment === "pause-1"
      ? "var(--color-growth)"
      : "var(--color-day-light)";
  const dayProgress = Math.max(0, Math.min(100, (dayClock.totalNonaryHours / 9) * 100));
  const fullDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="today-page">
      <section className="today-hero animate-in" aria-labelledby="today-title">
        <div className="today-hero__copy">
          <span className="eyebrow">Your position in the living calendar</span>
          <h1 id="today-title">A moment within<br />many cycles.</h1>
          <p className="today-hero__date">{fullDate}</p>

          <div className="cycle-context" aria-label="Current solar context">
            <span style={{ color: seasonColor }}>
              {META_SEASON_EMOJIS[solarYear.metaSeason]} {META_SEASON_LABELS[solarYear.metaSeason]}
            </span>
            <i aria-hidden="true" />
            <span>{BREATH_PHASE_LABELS[solarYear.breathPhase]}</span>
            <i aria-hidden="true" />
            <span>Month {solarYear.month} of 9</span>
          </div>

          <div className="hero-date-control">
            <label className="sr-only" htmlFor="today-date">Selected date</label>
            <input
              id="today-date"
              type="date"
              value={toInputDate(selectedDate)}
              onChange={(event) => onDateChange(fromInputDate(event.target.value))}
            />
            {!isToday && <button type="button" onClick={onResetToday}>Return to today</button>}
          </div>
        </div>

        <div className="today-orbit" style={{ "--cycle-accent": dayColor } as CSSProperties}>
          <div className="today-orbit__halo" aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => (
              <span key={index} style={{ transform: `rotate(${index * 40}deg)` }} />
            ))}
            <div className="today-orbit__progress" style={{ transform: `rotate(${dayProgress * 3.6}deg)` }} />
          </div>
          <div className="today-orbit__reading">
            <span>Day clock</span>
            <strong>{formatDayClock(dayClock)}</strong>
            <small>{dayClock.segment}</small>
          </div>
          <div className="today-orbit__caption">
            {dawnInfo
              ? `Sunrise ${dawnInfo.sunrise.toLocaleTimeString("en-GB", {
                  timeZone: dawnInfo.location.timezone,
                  hour: "2-digit",
                  minute: "2-digit",
                })} · ${dawnInfo.location.city}`
              : `${nonaryHoursToConventional(dayClock.totalNonaryHours)} since sunrise`}
          </div>
        </div>
      </section>

      <section className="reading-section animate-in animate-in-delay-1" aria-labelledby="reading-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Current reading</span>
            <h2 id="reading-title">Four clocks, one moment</h2>
          </div>
          <span className="epoch-note">Day {Math.floor(reading.elapsedDaysFromYearEpoch)} from year epoch</span>
        </div>

        <div className="clock-constellation">
          <CelestialDial
            size="lg"
            label="Day Clock"
            value={formatDayClock(dayClock)}
            detail={`${nonaryHoursToConventional(dayClock.totalNonaryHours)} elapsed`}
            badge={dayClock.segment}
            color={dayColor}
            progress={dayProgress}
          />
          <CelestialDial
            size="md"
            label="Solar Year"
            value={formatSolarYear(solarYear)}
            detail={`Day ${solarYear.dayInMonth.toFixed(1)} of 40`}
            badge={`${META_SEASON_EMOJIS[solarYear.metaSeason]} ${META_SEASON_LABELS[solarYear.metaSeason]}`}
            color={seasonColor}
            progress={((solarYear.month - 1) / 9) * 100}
          />
          <CelestialDial
            size="md"
            label="Earth Month"
            value={formatEarthMonth(earthMonth)}
            detail={`Model · ${earthMonth.model}`}
            badge={EARTH_MONTH_SEGMENT_LABELS[earthMonth.segment]}
            color={earthMonthColor}
            progress={((earthMonth.localDay - 1) / 40.58) * 100}
          />
          <CelestialDial
            size="sm"
            label="Moon Clock"
            value={formatMoonClock(moonClock)}
            detail={`${(lunarIllumination(moonClock.synodicDay) * 100).toFixed(0)}% illuminated`}
            badge={LUNAR_SEGMENT_LABELS[moonClock.segment]}
            color={moonColor}
            progress={(moonClock.synodicDay / 29.53059) * 100}
          />
        </div>
      </section>

      <section className="timeline-section editorial-panel animate-in animate-in-delay-2" aria-labelledby="timeline-title">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="eyebrow">Earth rhythm</span>
            <h2 id="timeline-title">Month timeline</h2>
          </div>
          <span className="epoch-note">40.58 solar days</span>
        </div>
        <MonthTimeline earthMonth={earthMonth} />
      </section>

      <footer className="today-footer">
        <span>Year epoch · Winter Solstice, Dec 21 2026</span>
        <span>Moon epoch · Apr 16 2026</span>
        <span>Nonary calendar · Base 9</span>
      </footer>
    </div>
  );
}

function CelestialDial({
  size,
  label,
  value,
  detail,
  badge,
  color,
  progress,
}: {
  size: "lg" | "md" | "sm";
  label: string;
  value: string;
  detail: string;
  badge: string;
  color: string;
  progress: number;
}) {
  const R = 78;
  const CIRC = 2 * Math.PI * R;
  const p = Math.max(0.5, Math.min(100, progress));
  const angle = (p / 100) * 2 * Math.PI - Math.PI / 2;
  const mx = 90 + R * Math.cos(angle);
  const my = 90 + R * Math.sin(angle);

  return (
    <article
      className={`celestial-dial celestial-dial--${size}`}
      style={{ "--dial-accent": color } as CSSProperties}
    >
      <div className="celestial-dial__ring">
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle className="celestial-dial__track" cx="90" cy="90" r={R} />
          <circle className="celestial-dial__inner" cx="90" cy="90" r={R - 13} />
          <circle
            className="celestial-dial__orbit"
            cx="90"
            cy="90"
            r={R}
            strokeDasharray={`${(p / 100) * CIRC} ${CIRC}`}
          />
          <circle className="celestial-dial__moon-glow" cx={mx} cy={my} r="10" />
          <circle className="celestial-dial__moon" cx={mx} cy={my} r="4.2" />
        </svg>
        <div className="celestial-dial__core">
          <span className="celestial-dial__label">{label}</span>
          <strong className="celestial-dial__value">{value}</strong>
        </div>
      </div>
      <div className="celestial-dial__caption">
        <span className="celestial-dial__badge">{badge}</span>
        <span className="celestial-dial__detail">{detail}</span>
      </div>
    </article>
  );
}

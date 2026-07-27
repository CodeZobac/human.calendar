/**
 * GregorianCompare — Side-by-side Gregorian vs nonary calendar reading.
 *
 * Shows the standard Gregorian date fields on the left and the four-clock
 * nonary reading on the right, mirroring the plan's "Compare View".
 */

import type { Reading } from "../engine/types";
import "./CycleViews.css";
import {
  META_SEASON_LABELS,
  META_SEASON_EMOJIS,
  BREATH_PHASE_LABELS,
  EARTH_MONTH_SEGMENT_LABELS,
  LUNAR_SEGMENT_LABELS,
  META_SEASON_COLORS,
  DAY_SEGMENT_COLORS,
  LUNAR_SEGMENT_COLORS,
  formatDayClock,
  formatSolarYear,
  formatEarthMonth,
  formatMoonClock,
} from "../engine/viewModel";

interface GregorianCompareProps {
  reading: Reading;
  selectedDate: Date;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function GregorianCompare({
  reading,
  selectedDate,
}: GregorianCompareProps) {
  const weekday = WEEKDAYS[selectedDate.getUTCDay()];
  const monthName = MONTHS[selectedDate.getUTCMonth()];
  const dayNum = selectedDate.getUTCDate();
  const year = selectedDate.getUTCFullYear();
  const dayOfYear =
    Math.floor(
      (selectedDate.getTime() - new Date(year, 0, 1).getTime()) / 86_400_000,
    ) + 1;

  const { dayClock, solarYear, earthMonth, moonClock } = reading;
  const seasonColor = META_SEASON_COLORS[solarYear.metaSeason];
  const dayColor = DAY_SEGMENT_COLORS[dayClock.segment];
  const moonColor = LUNAR_SEGMENT_COLORS[moonClock.segment];
  const earthMonthColor =
    earthMonth.segment === "grow-in" || earthMonth.segment === "pause-1"
      ? "var(--color-growth)"
      : "var(--color-day-light)";

  return (
    <div className="comparison-grid" style={styles.container}>
      {/* ── Gregorian side ── */}
      <div style={styles.side}>
        <div style={styles.sideHeader}>
          <div style={styles.dot} />
          <span style={styles.sideTitle}>Gregorian</span>
        </div>
        <div style={styles.rows}>
          <Row label="Weekday" value={weekday} />
          <Row label="Date" value={`${dayNum} ${monthName} ${year}`} />
          <Row label="Day of year" value={String(dayOfYear)} />
          <Row
            label="ISO date"
            value={selectedDate.toISOString().split("T")[0]}
          />
          <Row
            label="Days since epoch"
            value={reading.elapsedDaysFromYearEpoch.toFixed(2)}
          />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="comparison-divider" style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerLabel}>⟷</span>
        <div style={styles.dividerLine} />
      </div>

      {/* ── Nonary side ── */}
      <div style={styles.side}>
        <div style={styles.sideHeader}>
          <div style={{ ...styles.dot, background: "var(--solar-400)" }} />
          <span style={{ ...styles.sideTitle, color: "var(--solar-400)" }}>
            Nonary Calendar
          </span>
        </div>
        <div style={styles.rows}>
          {/* Day Clock */}
          <GroupLabel label="Day Clock" />
          <Row
            label="Time"
            value={formatDayClock(dayClock)}
            valueColor={dayColor}
          />
          <Row label="Segment" value={dayClock.segment} valueColor={dayColor} />

          {/* Solar Year */}
          <GroupLabel label="Solar Year" />
          <Row
            label="Reading"
            value={formatSolarYear(solarYear)}
            valueColor={seasonColor}
          />
          <Row
            label="Month"
            value={`${solarYear.month} of 9`}
            valueColor={seasonColor}
          />
          <Row
            label="Meta-season"
            value={`${META_SEASON_EMOJIS[solarYear.metaSeason]} ${META_SEASON_LABELS[solarYear.metaSeason]}`}
            valueColor={seasonColor}
          />
          <Row
            label="Breath phase"
            value={BREATH_PHASE_LABELS[solarYear.breathPhase]}
          />
          <Row label="Day in month" value={solarYear.dayInMonth.toFixed(1)} />

          {/* Earth Month */}
          <GroupLabel label="Earth Month" />
          <Row
            label="Reading"
            value={formatEarthMonth(earthMonth)}
            valueColor={earthMonthColor}
          />
          <Row
            label="Segment"
            value={EARTH_MONTH_SEGMENT_LABELS[earthMonth.segment]}
            valueColor={earthMonthColor}
          />
          <Row label="Local day" value={earthMonth.localDay.toFixed(2)} />
          <Row label="Model" value={earthMonth.model} />

          {/* Moon Clock */}
          <GroupLabel label="Moon Clock" />
          <Row
            label="Reading"
            value={formatMoonClock(moonClock)}
            valueColor={moonColor}
          />
          <Row
            label="Segment"
            value={LUNAR_SEGMENT_LABELS[moonClock.segment]}
            valueColor={moonColor}
          />
          <Row label="Synodic day" value={moonClock.synodicDay.toFixed(3)} />
          {moonClock.phasePeak && (
            <Row
              label="Peak"
              value={
                moonClock.phasePeak === "full-moon"
                  ? "🌕 Full Moon"
                  : "🌑 New Moon"
              }
              valueColor="var(--color-solar-soft)"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function GroupLabel({ label }: { label: string }) {
  return <div style={styles.groupLabel}>{label}</div>;
}

function Row({
  label,
  value,
  hint,
  valueColor,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
}) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <div style={styles.rowRight}>
        <span
          style={{
            ...styles.rowValue,
            color: valueColor || "var(--text-primary)",
          }}
        >
          {value}
        </span>
        {hint && <span style={styles.rowHint}>{hint}</span>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    gap: 0,
    alignItems: "stretch",
    padding: 24,
    flexWrap: "wrap" as const,
  },
  side: {
    flex: "1 1 240px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 12px",
    minWidth: 0,
  },
  sideHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--text-secondary)",
    flexShrink: 0,
  },
  sideTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    color: "var(--text-secondary)",
  },
  rows: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  groupLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
    color: "var(--text-dim-25)",
    borderTop: "1px solid var(--surface-4)",
    paddingTop: 8,
    marginTop: 4,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
  },
  rowLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    color: "var(--text-dim-40)",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  rowRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 1,
    minWidth: 0,
  },
  rowValue: {
    fontFamily: "var(--font-display)",
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right" as const,
    wordBreak: "break-word" as const,
  },
  rowHint: {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    color: "var(--text-dim-30)",
    fontWeight: 400,
    fontStyle: "italic",
  },
  divider: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    padding: "0 8px",
    minWidth: 24,
    paddingTop: 32,
  },
  dividerLine: {
    width: 1,
    flex: 1,
    background: "var(--surface-6)",
    minHeight: 20,
  },
  dividerLabel: {
    fontSize: 12,
    color: "var(--text-dim-15)",
  },
};

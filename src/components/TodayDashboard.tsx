/**
 * TodayDashboard — Main view showing all four nonary clocks side-by-side.
 *
 * Displays: Day Clock · Solar Year · Earth Month · Moon Clock
 * Each clock shows its primary label from viewModel and a mini strip.
 */

import type { Reading } from "../engine/types";
import {
  META_SEASON_COLORS,
  META_SEASON_LABELS,
  META_SEASON_EMOJIS,
  DAY_SEGMENT_COLORS,
  LUNAR_SEGMENT_COLORS,
  BREATH_PHASE_LABELS,
  EARTH_MONTH_SEGMENT_LABELS,
  LUNAR_SEGMENT_LABELS,
  formatDayClock,
  formatSolarYear,
  formatEarthMonth,
  formatMoonClock,
  nonaryHoursToConventional,
  lunarIllumination,
} from "../engine/viewModel";
import MonthTimeline from "./MonthTimeline";
import type { DawnInfo } from "../services/geo";

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
  return new Date(s + "T12:00:00Z");
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
      ? "#34d399"
      : "#22d3ee";

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header} className="animate-in">
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Human Cycles</h1>
            <div style={styles.subtitle}>
              <span style={{ ...styles.seasonBadge, color: seasonColor }}>
                {META_SEASON_EMOJIS[solarYear.metaSeason]}
                &nbsp;{META_SEASON_LABELS[solarYear.metaSeason].toUpperCase()}
              </span>
              <span style={styles.sep}>·</span>
              <span style={styles.breathLabel}>
                {BREATH_PHASE_LABELS[solarYear.breathPhase]}
              </span>
              <span style={styles.sep}>·</span>
              <span style={styles.monthLabel}>
                Month {solarYear.month} of 9
              </span>
            </div>
          </div>

          <div style={styles.datePicker}>
            <input
              type="date"
              value={toInputDate(selectedDate)}
              onChange={(e) => onDateChange(fromInputDate(e.target.value))}
              style={styles.dateInput}
            />
            {!isToday && (
              <button onClick={onResetToday} style={styles.todayBtn}>
                Today
              </button>
            )}
          </div>
        </div>

        <div style={styles.gregorianRow}>
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
          <span style={styles.sep}>·</span>
          <span style={styles.elapsedLabel}>
            day {Math.floor(reading.elapsedDaysFromYearEpoch)} from epoch
          </span>
        </div>
      </header>

      {/* ── Four clock cards ── */}
      <div style={styles.clockGrid} className="animate-in animate-in-delay-1">
        {/* Day Clock */}
        <ClockCard
          label="Day Clock"
          primaryDisplay={formatDayClock(dayClock)}
          accentColor={dayColor}
          detail={
            dawnInfo
              ? `☉ ${dawnInfo.sunrise.toLocaleTimeString("en-GB", {
                  timeZone: dawnInfo.location.timezone,
                  hour: "2-digit",
                  minute: "2-digit",
                })} ${dawnInfo.location.city} · ${nonaryHoursToConventional(dayClock.totalNonaryHours)} elapsed`
              : `${nonaryHoursToConventional(dayClock.totalNonaryHours)} since sunrise`
          }
          badge={dayClock.segment}
        >
          <MiniDayBar totalHours={dayClock.totalNonaryHours} color={dayColor} />
        </ClockCard>

        {/* Solar Year */}
        <ClockCard
          label="Solar Year"
          primaryDisplay={formatSolarYear(solarYear)}
          accentColor={seasonColor}
          detail={`Day ${solarYear.dayInMonth.toFixed(1)} of 40`}
          badge={`${META_SEASON_EMOJIS[solarYear.metaSeason]} ${META_SEASON_LABELS[solarYear.metaSeason]}`}
        >
          <MiniYearBar month={solarYear.month} color={seasonColor} />
        </ClockCard>

        {/* Earth Month */}
        <ClockCard
          label="Earth Month"
          primaryDisplay={formatEarthMonth(earthMonth)}
          accentColor={earthMonthColor}
          detail={`Model: ${earthMonth.model}`}
          badge={EARTH_MONTH_SEGMENT_LABELS[earthMonth.segment]}
        >
          <MiniMonthBar
            localDay={earthMonth.localDay}
            color={earthMonthColor}
            segment={earthMonth.segment}
          />
        </ClockCard>

        {/* Moon Clock */}
        <ClockCard
          label="Moon Clock"
          primaryDisplay={formatMoonClock(moonClock)}
          accentColor={moonColor}
          detail={`${(lunarIllumination(moonClock.synodicDay) * 100).toFixed(0)}% illuminated`}
          badge={LUNAR_SEGMENT_LABELS[moonClock.segment]}
        >
          <MiniMoonBar synodicDay={moonClock.synodicDay} color={moonColor} />
        </ClockCard>
      </div>

      {/* ── Month Timeline ── */}
      <div
        className="glass-panel animate-in animate-in-delay-2"
        style={styles.timelineCard}
      >
        <h3 style={styles.sectionTitle}>Earth Month Timeline</h3>
        <MonthTimeline earthMonth={earthMonth} />
      </div>

      {/* ── Footer ── */}
      <footer style={styles.footer}>
        Year epoch: Winter Solstice Dec 21, 2026 · Moon epoch: Apr 16, 2026 ·
        9-cycle nonary calendar
      </footer>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ClockCard({
  label,
  primaryDisplay,
  accentColor,
  detail,
  badge,
  children,
}: {
  label: string;
  primaryDisplay: string;
  accentColor: string;
  detail: string;
  badge: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="glass-panel"
      style={{
        ...styles.clockCard,
        borderColor: accentColor + "25",
        background: `linear-gradient(135deg, ${accentColor}08, transparent)`,
      }}
    >
      <div style={styles.cardHeader}>
        <span style={{ ...styles.cardLabel, color: accentColor }}>{label}</span>
        <span style={{ ...styles.cardBadge }}>{badge}</span>
      </div>
      <div style={{ ...styles.cardPrimary, color: accentColor }}>
        {primaryDisplay}
      </div>
      <div style={styles.cardDetail}>{detail}</div>
      {children && <div style={styles.cardMini}>{children}</div>}
    </div>
  );
}

/** Mini day-progress bar (0 to 9 hours) */
function MiniDayBar({
  totalHours,
  color,
}: {
  totalHours: number;
  color: string;
}) {
  const pct = (totalHours / 9) * 100;
  return (
    <div style={{ ...miniBarStyles.track, borderColor: color + "20" }}>
      <div
        style={{
          ...miniBarStyles.fill,
          width: `${pct}%`,
          background: color + "60",
        }}
      />
      <div
        style={{ ...miniBarStyles.dot, left: `${pct}%`, background: color }}
      />
    </div>
  );
}

/** Mini year-progress bar (months 1–9) */
function MiniYearBar({ month, color }: { month: number; color: string }) {
  const pct = ((month - 1) / 9) * 100;
  return (
    <div style={{ ...miniBarStyles.track, borderColor: color + "20" }}>
      <div
        style={{
          ...miniBarStyles.fill,
          width: `${pct}%`,
          background: color + "40",
        }}
      />
      <div
        style={{ ...miniBarStyles.dot, left: `${pct}%`, background: color }}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{
            ...miniBarStyles.tick,
            left: `${((i + 1) / 9) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

/** Mini month-progress bar (40.58 days) */
function MiniMonthBar({
  localDay,
  color,
  segment,
}: {
  localDay: number;
  color: string;
  segment: string;
}) {
  const pct = ((localDay - 1) / 40.58) * 100;
  const isPause = segment === "pause-1" || segment === "pause-2";
  return (
    <div style={{ ...miniBarStyles.track, borderColor: color + "20" }}>
      <div
        style={{
          ...miniBarStyles.fill,
          width: `${pct}%`,
          background: isPause ? "rgba(212,168,83,0.4)" : color + "40",
        }}
      />
      <div
        style={{ ...miniBarStyles.dot, left: `${pct}%`, background: color }}
      />
      {/* Midpoint divider */}
      <div style={{ ...miniBarStyles.tick, left: "50%" }} />
    </div>
  );
}

/** Mini moon-progress bar (synodic cycle) */
function MiniMoonBar({
  synodicDay,
  color,
}: {
  synodicDay: number;
  color: string;
}) {
  const pct = (synodicDay / 29.53059) * 100;
  return (
    <div style={{ ...miniBarStyles.track, borderColor: color + "20" }}>
      <div
        style={{
          ...miniBarStyles.fill,
          width: `${pct}%`,
          background: color + "40",
        }}
      />
      <div
        style={{ ...miniBarStyles.dot, left: `${pct}%`, background: color }}
      />
      {/* Full Moon midpoint */}
      <div
        style={{
          ...miniBarStyles.tick,
          left: "50%",
          borderColor: "var(--text-dim-30)",
        }}
      />
    </div>
  );
}

const miniBarStyles: Record<string, React.CSSProperties> = {
  track: {
    position: "relative",
    width: "100%",
    height: 4,
    borderRadius: 2,
    background: "var(--surface-4)",
    border: "1px solid",
    overflow: "visible",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 2,
    transition: "width 0.8s ease",
  },
  dot: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 8,
    height: 8,
    borderRadius: "50%",
    transition: "left 0.8s ease",
    zIndex: 2,
  },
  tick: {
    position: "absolute",
    top: "-3px",
    transform: "translateX(-50%)",
    width: 1,
    height: 10,
    background: "var(--text-dim-15)",
    borderColor: "var(--text-dim-15)",
  },
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingTop: 40,
    paddingBottom: 60,
    minHeight: "100dvh",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    background: "linear-gradient(135deg, #f5dfa6, #d4a853, #8ba4c7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap" as const,
  },
  seasonBadge: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: "1px",
  },
  breathLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: "var(--text-dim-50)",
  },
  monthLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: "var(--text-dim-40)",
  },
  sep: {
    color: "var(--text-dim-15)",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  dateInput: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
    outline: "none",
    cursor: "pointer",
    colorScheme: "var(--color-scheme)" as React.CSSProperties["colorScheme"],
  },
  todayBtn: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid rgba(212,168,83,0.3)",
    background: "rgba(212,168,83,0.1)",
    color: "#d4a853",
    cursor: "pointer",
    fontWeight: 500,
  },
  gregorianRow: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "var(--text-dim-40)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  elapsedLabel: {
    color: "var(--text-dim-25)",
    fontVariantNumeric: "tabular-nums" as const,
  },
  clockGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 16,
  },
  clockCard: {
    padding: "18px 20px",
    borderRadius: 16,
    border: "1px solid",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "1.2px",
    textTransform: "uppercase" as const,
  },
  cardBadge: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    color: "var(--text-dim-35)",
    fontWeight: 500,
  },
  cardPrimary: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  },
  cardDetail: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    color: "var(--text-dim-35)",
  },
  cardMini: {
    marginTop: 6,
  },
  timelineCard: {
    padding: "24px",
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    color: "var(--text-dim-40)",
    marginBottom: 16,
  },
  footer: {
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    color: "var(--text-dim-20)",
    paddingTop: 20,
  },
};

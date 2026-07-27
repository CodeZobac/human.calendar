/**
 * MonthTimeline — Horizontal bar showing the 40.58-day Earth month breath cycle.
 *
 * Segments (Grow-in → Pause-1 → Grow-out → Pause-2):
 *   Grow-in  : 0   – 20    days  → emerald green
 *   Pause-1  : 20  – 20.29 days  → gold (reversal gate)
 *   Grow-out : 20.29 – 40.29 days → teal
 *   Pause-2  : 40.29 – 40.58 days → gold (reversal gate)
 *
 * A pulsing marker tracks the current position.
 */

import type { EarthMonthReading } from "../engine/types";
import { EARTH_MONTH_SEGMENT_LABELS } from "../engine/viewModel";
import { TOTAL_MONTH, MONTH_PAUSE } from "../engine/astronomy";

interface MonthTimelineProps {
  earthMonth: EarthMonthReading;
}

const GROW_HALF = 20;

const SEGMENTS = [
  {
    key: "grow-in" as const,
    start: 0,
    end: GROW_HALF,
    color: "var(--color-growth)",
    bg: "color-mix(in oklch, var(--color-growth) 16%, var(--color-paper-2))",
    label: "Grow-in",
    description: "Expansion",
  },
  {
    key: "pause-1" as const,
    start: GROW_HALF,
    end: GROW_HALF + MONTH_PAUSE,
    color: "var(--color-threshold)",
    bg: "color-mix(in oklch, var(--color-threshold) 18%, var(--color-paper-2))",
    label: "Pause",
    description: "Top reversal",
  },
  {
    key: "grow-out" as const,
    start: GROW_HALF + MONTH_PAUSE,
    end: GROW_HALF + MONTH_PAUSE + GROW_HALF,
    color: "var(--color-day-light)",
    bg: "color-mix(in oklch, var(--color-day-light) 16%, var(--color-paper-2))",
    label: "Grow-out",
    description: "Contraction",
  },
  {
    key: "pause-2" as const,
    start: GROW_HALF + MONTH_PAUSE + GROW_HALF,
    end: TOTAL_MONTH,
    color: "var(--color-threshold)",
    bg: "color-mix(in oklch, var(--color-threshold) 18%, var(--color-paper-2))",
    label: "Pause",
    description: "Bottom reversal",
  },
];

export default function MonthTimeline({ earthMonth }: MonthTimelineProps) {
  // localDay is 1-indexed; convert to 0-indexed for progress
  const d = earthMonth.localDay - 1;
  const progress = (d / TOTAL_MONTH) * 100;
  const activeSegment = SEGMENTS.find((s) => s.key === earthMonth.segment)!;

  return (
    <div style={styles.wrapper}>
      {/* Segment labels */}
      <div style={styles.labels}>
        {SEGMENTS.map((seg) => {
          const width = ((seg.end - seg.start) / TOTAL_MONTH) * 100;
          const isActive = seg.key === earthMonth.segment;
          return (
            <div
              key={seg.key}
              style={{
                ...styles.labelItem,
                width: `${width}%`,
                color: isActive ? seg.color : "var(--text-dim-30)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={styles.labelText}>{seg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div style={styles.trackContainer}>
        <div style={styles.track}>
          {SEGMENTS.map((seg) => {
            const width = ((seg.end - seg.start) / TOTAL_MONTH) * 100;
            const isActive = seg.key === earthMonth.segment;
            const isPause = seg.key === "pause-1" || seg.key === "pause-2";
            return (
              <div
                key={seg.key}
                style={{
                  width: `${width}%`,
                  height: "100%",
                  background: isActive ? seg.bg : "var(--surface-2)",
                  borderRight: isPause ? "none" : "1px solid var(--surface-6)",
                  position: "relative",
                  transition: "opacity var(--dur-short) var(--ease-in-out)",
                  ...(isPause
                    ? {
                        backgroundImage: isActive
                          ? "repeating-linear-gradient(45deg, transparent, transparent 2px, color-mix(in oklch, var(--color-threshold) 12%, transparent) 2px, color-mix(in oklch, var(--color-threshold) 12%, transparent) 4px)"
                          : "repeating-linear-gradient(45deg, transparent, transparent 2px, var(--color-rule-2) 2px, var(--color-rule-2) 4px)",
                      }
                    : {}),
                }}
              />
            );
          })}
        </div>

        {/* Position marker */}
        <div
          style={{
            ...styles.marker,
            left: `${progress}%`,
            background: activeSegment.color,
            boxShadow: `0 0 12px ${activeSegment.color}, 0 0 4px ${activeSegment.color}`,
          }}
        >
          <div
            style={{ ...styles.markerPulse, borderColor: activeSegment.color }}
          />
        </div>
      </div>

      {/* Day axis labels */}
      <div style={styles.dayMarkers}>
        {/* Left anchor */}
        <div style={{ ...styles.dayMark, left: "0%" }}>
          <span style={styles.dayNumber}>0</span>
        </div>
        {/* Mid point — start of pause-1 / grow-out boundary */}
        <div
          style={{
            ...styles.dayMark,
            left: `${(GROW_HALF / TOTAL_MONTH) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <span style={styles.dayNumber}>{GROW_HALF}</span>
        </div>
        {/* Right anchor */}
        <div
          style={{
            ...styles.dayMark,
            left: "100%",
            transform: "translateX(-100%)",
          }}
        >
          <span style={styles.dayNumber}>{TOTAL_MONTH.toFixed(2)}</span>
        </div>
      </div>

      {/* Readout */}
      <div style={styles.readout}>
        <span style={{ color: activeSegment.color, fontWeight: 600 }}>
          {EARTH_MONTH_SEGMENT_LABELS[earthMonth.segment]}
        </span>
        <span style={{ color: "var(--text-dim-35)" }}>
          {" "}
          &mdash; day {earthMonth.localDay.toFixed(1)} of{" "}
          {TOTAL_MONTH.toFixed(2)}
        </span>
        <span
          style={{
            color: "var(--text-dim-25)",
            fontSize: 11,
            marginLeft: 6,
          }}
        >
          ({earthMonth.model})
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  labels: {
    display: "flex",
    width: "100%",
  },
  labelItem: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    textAlign: "center",
    transition: "opacity var(--dur-short) var(--ease-in-out)",
    overflow: "hidden",
  },
  labelText: {
    display: "block",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  trackContainer: {
    position: "relative",
    width: "100%",
    paddingTop: 4,
    paddingBottom: 4,
  },
  track: {
    display: "flex",
    width: "100%",
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    background: "var(--surface-2)",
    border: "1px solid var(--surface-6)",
  },
  marker: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: 14,
    height: 14,
    borderRadius: "50%",
    zIndex: 3,
    transition: "left 0.8s cubic-bezier(0.16,1,0.3,1)",
  },
  markerPulse: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    border: "2px solid",
    opacity: 0.4,
    animation: "none",
  },
  dayMarkers: {
    position: "relative",
    width: "100%",
    height: 16,
  },
  dayMark: {
    position: "absolute",
    top: 0,
  },
  dayNumber: {
    fontFamily: "var(--font-body)",
    fontSize: 9,
    color: "var(--text-dim-25)",
    fontVariantNumeric: "tabular-nums",
  },
  readout: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },
};

/**
 * DayClockView — Full-page view of the 9-hour nonary day clock.
 *
 * Renders a circular SVG with four colour-coded arcs:
 *   Dawn  (0.5 h / 20°)  → gold
 *   Day   (4.0 h / 160°) → sky-blue
 *   Dusk  (0.5 h / 20°)  → orange
 *   Night (4.0 h / 160°) → lunar-silver
 *
 * A glowing dot tracks current position; the centre shows H:M:S.
 */

import type { DayClockReading } from "../engine/types";
import {
  DAY_SEGMENT_COLORS,
  DAY_SEGMENT_LABELS,
  formatDayClock,
  nonaryHoursToConventional,
} from "../engine/viewModel";
import type { DawnInfo } from "../services/geo";

interface DayClockViewProps {
  dayClock: DayClockReading;
  dawnInfo?: DawnInfo | null;
}

// ── Layout ──────────────────────────────────────────────────────────────────
const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE / 2 - 30;
const INNER_R = OUTER_R * 0.56;
const MID_R = (OUTER_R + INNER_R) / 2;

// ── Segment spans (degrees, clockwise from 12 o'clock) ──────────────────────
const DAWN_DEG = (0.5 / 9) * 360; // 20°
const DAY_DEG = (4.0 / 9) * 360; // 160°
const DUSK_DEG = (0.5 / 9) * 360; // 20°

const SEGMENTS = [
  { key: "dawn" as const, start: 0, end: DAWN_DEG },
  { key: "day" as const, start: DAWN_DEG, end: DAWN_DEG + DAY_DEG },
  {
    key: "dusk" as const,
    start: DAWN_DEG + DAY_DEG,
    end: DAWN_DEG + DAY_DEG + DUSK_DEG,
  },
  { key: "night" as const, start: DAWN_DEG + DAY_DEG + DUSK_DEG, end: 360 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function arcPath(
  startDeg: number,
  endDeg: number,
  outerR: number,
  innerR: number,
  gap = 1.5,
): string {
  const s = degToRad(startDeg + gap);
  const e = degToRad(endDeg - gap);
  const largeArc = endDeg - startDeg - 2 * gap > 180 ? 1 : 0;

  const x1o = CX + outerR * Math.cos(s);
  const y1o = CY + outerR * Math.sin(s);
  const x2o = CX + outerR * Math.cos(e);
  const y2o = CY + outerR * Math.sin(e);
  const x2i = CX + innerR * Math.cos(e);
  const y2i = CY + innerR * Math.sin(e);
  const x1i = CX + innerR * Math.cos(s);
  const y1i = CY + innerR * Math.sin(s);

  return [
    `M ${x1o} ${y1o}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
    `L ${x2i} ${y2i}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x1i} ${y1i}`,
    "Z",
  ].join(" ");
}

// ── Dawn formatting helpers ───────────────────────────────────────────────

function formatSunriseLocal(sunrise: Date, timezone: string): string {
  return sunrise.toLocaleTimeString("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDrift(drift: number): { label: string; hint: string } {
  const abs = Math.abs(drift);
  const dir =
    drift < -0.05
      ? "getting earlier"
      : drift > 0.05
        ? "getting later"
        : "nearly frozen";
  return {
    label: `${abs.toFixed(2)} min/day (${dir})`,
    hint:
      Math.abs(drift) < 0.1
        ? "at a solstice — day clock is maximally stable"
        : abs > 2.0
          ? "near equinox — day clock shifting fastest"
          : "",
  };
}

// ── Component ──────────────────────────────────────────────────────────────────────
export default function DayClockView({
  dayClock,
  dawnInfo,
}: DayClockViewProps) {
  const activeColor = DAY_SEGMENT_COLORS[dayClock.segment];
  const activeLabel = DAY_SEGMENT_LABELS[dayClock.segment];

  // Glowing pointer dot position
  const pointerDeg = (dayClock.totalNonaryHours / 9) * 360;
  const pointerRad = degToRad(pointerDeg);
  const px = CX + MID_R * Math.cos(pointerRad);
  const py = CY + MID_R * Math.sin(pointerRad);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Day Clock</h2>
        <span style={{ ...styles.badge, color: activeColor }}>
          {activeLabel}
        </span>
      </div>

      {/* Circular clock */}
      <div style={styles.clockWrap}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="dc-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            cx={CX}
            cy={CY}
            r={MID_R}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={OUTER_R - INNER_R}
          />

          {/* Coloured arcs */}
          {SEGMENTS.map((seg) => {
            const isActive = seg.key === dayClock.segment;
            const color = DAY_SEGMENT_COLORS[seg.key];
            return (
              <path
                key={seg.key}
                d={arcPath(seg.start, seg.end, OUTER_R, INNER_R)}
                fill={isActive ? color + "55" : color + "18"}
                stroke={color}
                strokeWidth={isActive ? 1.5 : 0.5}
                opacity={isActive ? 1 : 0.5}
                filter={isActive ? "url(#dc-glow)" : undefined}
                style={{ transition: "all 0.8s ease" }}
              />
            );
          })}

          {/* Hour tick marks (hours 1–9) */}
          {Array.from({ length: 9 }, (_, i) => {
            const tickDeg = (i / 9) * 360;
            const tickRad = degToRad(tickDeg);
            const t1x = CX + (OUTER_R + 5) * Math.cos(tickRad);
            const t1y = CY + (OUTER_R + 5) * Math.sin(tickRad);
            const t2x = CX + (OUTER_R + 14) * Math.cos(tickRad);
            const t2y = CY + (OUTER_R + 14) * Math.sin(tickRad);
            const lx = CX + (OUTER_R + 23) * Math.cos(tickRad);
            const ly = CY + (OUTER_R + 23) * Math.sin(tickRad);
            return (
              <g key={i}>
                <line
                  x1={t1x}
                  y1={t1y}
                  x2={t2x}
                  y2={t2y}
                  stroke="var(--text-dim-25)"
                  strokeWidth={1.5}
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-dim-40)"
                  fontSize={9}
                  fontFamily="'Outfit', sans-serif"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Segment label arcs (very small labels) */}
          {SEGMENTS.map((seg) => {
            const midDeg = (seg.start + seg.end) / 2;
            const midRad = degToRad(midDeg);
            const lx = CX + (INNER_R - 12) * Math.cos(midRad);
            const ly = CY + (INNER_R - 12) * Math.sin(midRad);
            const color = DAY_SEGMENT_COLORS[seg.key];
            const isActive = seg.key === dayClock.segment;
            return (
              <text
                key={seg.key + "-label"}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? color : color + "88"}
                fontSize={isActive ? 9 : 7}
                fontFamily="'Outfit', sans-serif"
                fontWeight={isActive ? 600 : 400}
              >
                {DAY_SEGMENT_LABELS[seg.key]}
              </text>
            );
          })}

          {/* Glowing position dot */}
          <circle
            cx={px}
            cy={py}
            r={10}
            fill={activeColor + "44"}
            filter="url(#dc-glow)"
            style={{ transition: "all 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <circle
            cx={px}
            cy={py}
            r={5}
            fill={activeColor}
            style={{ transition: "all 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <circle cx={px} cy={py} r={2} fill="white" />

          {/* Centre: H:M:S */}
          <text
            x={CX}
            y={CY - 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill={activeColor}
            fontSize={28}
            fontFamily="'Outfit', sans-serif"
            fontWeight={700}
            style={{ filter: `drop-shadow(0 0 10px ${activeColor}99)` }}
          >
            {dayClock.hour}:{dayClock.minute}:{dayClock.second}
          </text>
          <text
            x={CX}
            y={CY + 10}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-dim-35)"
            fontSize={9}
            fontFamily="'Inter', sans-serif"
            letterSpacing="2"
          >
            H : M : S
          </text>
          <text
            x={CX}
            y={CY + 28}
            textAnchor="middle"
            dominantBaseline="central"
            fill={activeColor}
            fontSize={12}
            fontFamily="'Outfit', sans-serif"
            fontWeight={500}
          >
            {activeLabel.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Info rows */}
      <div className="glass-panel" style={styles.infoPanel}>
        <InfoRow
          label="Nonary time"
          value={formatDayClock(dayClock)}
          valueColor={activeColor}
        />
        <InfoRow
          label="Since sunrise"
          value={nonaryHoursToConventional(dayClock.totalNonaryHours)}
        />
        <InfoRow
          label="Nonary hours elapsed"
          value={dayClock.totalNonaryHours.toFixed(3)}
        />
        <InfoRow label="Segment" value={activeLabel} valueColor={activeColor} />

        {/* Dawn / sunrise rows — populated once geo service resolves */}
        {dawnInfo ? (
          <>
            <div style={styles.divider} />
            <InfoRow
              label="Sunrise"
              value={formatSunriseLocal(
                dawnInfo.sunrise,
                dawnInfo.location.timezone,
              )}
              valueColor="#f5c842"
              hint={`${dawnInfo.location.city}, ${dawnInfo.location.countryCode} · ${dawnInfo.source}`}
            />
            <InfoRow
              label="Sunset"
              value={formatSunriseLocal(
                dawnInfo.sunset,
                dawnInfo.location.timezone,
              )}
            />
            {(() => {
              const { label, hint } = formatDrift(dawnInfo.dailyDriftMinutes);
              return (
                <InfoRow
                  label="Daily drift"
                  value={label}
                  hint={hint || undefined}
                />
              );
            })()}
          </>
        ) : (
          <InfoRow
            label="Sunrise"
            value="Locating…"
            hint="fetching IP location + sunrise API"
          />
        )}
      </div>

      {/* Segment legend */}
      <div style={styles.legend}>
        {SEGMENTS.map((seg) => (
          <div key={seg.key} style={styles.legendItem}>
            <div
              style={{
                ...styles.legendDot,
                background: DAY_SEGMENT_COLORS[seg.key],
              }}
            />
            <span
              style={{
                ...styles.legendLabel,
                color:
                  seg.key === dayClock.segment
                    ? DAY_SEGMENT_COLORS[seg.key]
                    : "var(--text-dim-40)",
              }}
            >
              {DAY_SEGMENT_LABELS[seg.key]}
            </span>
            <span style={styles.legendDuration}>
              {seg.key === "dawn" || seg.key === "dusk"
                ? "0.5h / 80m"
                : "4h / 10h40m"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
  hint,
}: {
  label: string;
  value: string;
  valueColor?: string;
  hint?: string;
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <span
          style={{
            ...styles.infoValue,
            color: valueColor || "var(--text-primary)",
          }}
        >
          {value}
        </span>
        {hint && <span style={styles.infoHint}>{hint}</span>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  badge: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "1px",
    textTransform: "uppercase" as const,
  },
  clockWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 0",
  },
  infoPanel: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 16,
  },
  infoLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: "var(--text-dim-40)",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "right" as const,
  },
  infoHint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    color: "var(--text-dim-30)",
    fontStyle: "italic",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 12,
    justifyContent: "center",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: 500,
  },
  legendDuration: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "4px 0",
  },
};

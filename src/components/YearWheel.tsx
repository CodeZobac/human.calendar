/**
 * YearWheel — 9-month solar year wheel with breath phases and meta-seasons.
 *
 * Visual structure (clockwise from 12 o'clock = year start Winter Solstice):
 *   Growth months 1–3   (green)
 *   Peak months 4–6     (gold)
 *   Decline months 7–9  (amber)
 *
 * The mid-year reversal sits between months 4 and 5 (≈ day 180).
 * The year-end reversal sits after month 9 (days 360–365.24).
 * Each reversal is shown as a thin accent gate on the outer rim.
 */

import type { SolarYearReading } from "../engine/types";
import {
  META_SEASON_COLORS,
  META_SEASON_LABELS,
  META_SEASON_EMOJIS,
  BREATH_PHASE_LABELS,
  formatSolarYear,
} from "../engine/viewModel";

interface YearWheelProps {
  solarYear: SolarYearReading;
}

// ── Layout ──────────────────────────────────────────────────────────────────
const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE / 2 - 28;
const INNER_R = OUTER_R * 0.52;
const MID_R = (OUTER_R + INNER_R) / 2;

// ── Geometry helpers ─────────────────────────────────────────────────────────
function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function segPath(
  startDeg: number,
  endDeg: number,
  outerR: number,
  innerR: number,
  gap = 1.2,
): string {
  const s = degToRad(startDeg + gap);
  const e = degToRad(endDeg - gap);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
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

// Each month = 40° (9 months × 40° = 360°).
const MONTH_DEG = 360 / 9; // 40°

// Reversal gate positions (in degrees from 0 = month 1 start)
// Mid-year reversal: after 4.5 months = 180°
// Year-end reversal: after 9 months = 360° (shown near 360°)
const REVERSAL_GATES = [
  { deg: 180, label: "Mid-year\nReversal" },
  { deg: 360, label: "Year-end\nReversal" },
];

export default function YearWheel({ solarYear }: YearWheelProps) {
  const { month, metaSeason, breathPhase, dayInMonth } = solarYear;
  const activeColor = META_SEASON_COLORS[metaSeason];

  // Position dot: progress through the current year in degrees
  // Month 1 starts at 0°, month 2 at 40°, etc.
  const progressDeg =
    (month - 1) * MONTH_DEG + ((dayInMonth - 1) / 40) * MONTH_DEG;
  const progressRad = degToRad(progressDeg);
  const px = CX + MID_R * Math.cos(progressRad);
  const py = CY + MID_R * Math.sin(progressRad);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Year Wheel</h2>
        <span style={{ ...styles.badge, color: activeColor }}>
          {META_SEASON_EMOJIS[metaSeason]} {META_SEASON_LABELS[metaSeason]}
        </span>
      </div>

      <div style={styles.clockWrap}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <filter id="yw-glow" x="-60%" y="-60%" width="220%" height="220%">
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

          {/* Month segments */}
          {Array.from({ length: 9 }, (_, i) => {
            const m = i + 1;
            const startDeg = i * MONTH_DEG;
            const endDeg = startDeg + MONTH_DEG;
            const isActive = m === month;
            const color =
              m <= 3
                ? META_SEASON_COLORS.growth
                : m <= 6
                  ? META_SEASON_COLORS.peak
                  : META_SEASON_COLORS.decline;

            return (
              <path
                key={m}
                d={segPath(startDeg, endDeg, OUTER_R, INNER_R)}
                fill={isActive ? color + "55" : color + "18"}
                stroke={color}
                strokeWidth={isActive ? 1.5 : 0.5}
                opacity={isActive ? 1 : 0.55}
                filter={isActive ? "url(#yw-glow)" : undefined}
                style={{ transition: "all 0.6s ease" }}
              />
            );
          })}

          {/* Month number labels */}
          {Array.from({ length: 9 }, (_, i) => {
            const m = i + 1;
            const midDeg = i * MONTH_DEG + MONTH_DEG / 2;
            const midRad = degToRad(midDeg);
            const lx = CX + MID_R * Math.cos(midRad);
            const ly = CY + MID_R * Math.sin(midRad);
            const isActive = m === month;
            const color =
              m <= 3
                ? META_SEASON_COLORS.growth
                : m <= 6
                  ? META_SEASON_COLORS.peak
                  : META_SEASON_COLORS.decline;
            return (
              <text
                key={m}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isActive ? "#fff" : color + "aa"}
                fontSize={isActive ? 14 : 11}
                fontFamily="'Outfit', sans-serif"
                fontWeight={isActive ? 700 : 400}
                style={{ transition: "all 0.4s ease" }}
              >
                {m}
              </text>
            );
          })}

          {/* Reversal gate markers */}
          {REVERSAL_GATES.map((gate) => {
            const gateRad = degToRad(gate.deg === 360 ? 359 : gate.deg);
            const lx1 = CX + (OUTER_R + 2) * Math.cos(gateRad);
            const ly1 = CY + (OUTER_R + 2) * Math.sin(gateRad);
            const lx2 = CX + (OUTER_R + 14) * Math.cos(gateRad);
            const ly2 = CY + (OUTER_R + 14) * Math.sin(gateRad);
            return (
              <g key={gate.deg}>
                <line
                  x1={lx1}
                  y1={ly1}
                  x2={lx2}
                  y2={ly2}
                  stroke="rgba(212,168,83,0.6)"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* Breath direction arc labels */}
          <text
            x={CX}
            y={CY - INNER_R + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-dim-30)"
            fontSize={7}
            fontFamily="'Inter', sans-serif"
          >
            ↑ Breath-in
          </text>
          <text
            x={CX}
            y={CY + INNER_R - 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-dim-30)"
            fontSize={7}
            fontFamily="'Inter', sans-serif"
          >
            ↓ Breath-out
          </text>

          {/* Progress dot */}
          <circle
            cx={px}
            cy={py}
            r={10}
            fill={activeColor + "44"}
            filter="url(#yw-glow)"
            style={{ transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <circle
            cx={px}
            cy={py}
            r={5}
            fill={activeColor}
            style={{ transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <circle cx={px} cy={py} r={2} fill="white" />

          {/* Centre info */}
          <text
            x={CX}
            y={CY - 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill={activeColor}
            fontSize={24}
            fontFamily="'Outfit', sans-serif"
            fontWeight={700}
            style={{ filter: `drop-shadow(0 0 10px ${activeColor}99)` }}
          >
            {month}
          </text>
          <text
            x={CX}
            y={CY + 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-dim-35)"
            fontSize={8}
            fontFamily="'Inter', sans-serif"
            letterSpacing="1.5"
          >
            OF 9
          </text>
          <text
            x={CX}
            y={CY + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill={activeColor}
            fontSize={10}
            fontFamily="'Outfit', sans-serif"
            fontWeight={500}
          >
            {META_SEASON_LABELS[metaSeason].toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Info panel */}
      <div className="glass-panel" style={styles.infoPanel}>
        <InfoRow
          label="Reading"
          value={formatSolarYear(solarYear)}
          valueColor={activeColor}
        />
        <InfoRow
          label="Month"
          value={`${month} of 9`}
          valueColor={activeColor}
        />
        <InfoRow label="Day in month" value={dayInMonth.toFixed(1)} />
        <InfoRow
          label="Meta-season"
          value={`${META_SEASON_EMOJIS[metaSeason]} ${META_SEASON_LABELS[metaSeason]}`}
          valueColor={activeColor}
        />
        <InfoRow
          label="Breath phase"
          value={BREATH_PHASE_LABELS[breathPhase]}
        />
      </div>

      {/* Meta-season legend */}
      <div style={styles.legend}>
        {(["growth", "peak", "decline"] as const).map((s) => (
          <div key={s} style={styles.legendItem}>
            <div
              style={{ ...styles.legendDot, background: META_SEASON_COLORS[s] }}
            />
            <span
              style={{
                ...styles.legendLabel,
                color:
                  s === metaSeason
                    ? META_SEASON_COLORS[s]
                    : "var(--text-dim-40)",
              }}
            >
              {META_SEASON_EMOJIS[s]} {META_SEASON_LABELS[s]} (months{" "}
              {s === "growth" ? "1–3" : s === "peak" ? "4–6" : "7–9"})
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
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span
        style={{
          ...styles.infoValue,
          color: valueColor || "var(--text-primary)",
        }}
      >
        {value}
      </span>
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
    letterSpacing: "0.5px",
  },
  clockWrap: {
    display: "flex",
    justifyContent: "center",
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
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
  },
};

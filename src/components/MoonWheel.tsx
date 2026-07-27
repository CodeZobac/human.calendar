/**
 * MoonWheel — Synodic lunar clock showing breath-in / breath-out halves.
 *
 * Visual layout (clockwise from 12 o'clock = New Moon / phase 0):
 *   Breath-in  (phases 0 → 4.5) — right half — waxing, silver-white
 *   Full Moon peak at 6 o'clock  — phase 4.5
 *   Breath-out (phases 4.5 → 9)  — left half  — waning, deep blue
 *   New Moon peak at 12 o'clock  — phase 0 / 9
 *
 * All time values use the nonary 9-phase scale (0–9) rather than
 * Gregorian synodic days. One lunar phase ≈ 3.28 conventional days.
 */

import type { MoonClockReading } from "../engine/types";
import "./CycleViews.css";
import { formatMoonClock, lunarIllumination } from "../engine/viewModel";
import {
  SYNODIC_MONTH_DAYS,
  HALF_SYNODIC,
  LUNAR_PHASE_UNIT_DAYS,
} from "../engine/astronomy";

interface MoonWheelProps {
  moonClock: MoonClockReading;
}

// ── Layout ──────────────────────────────────────────────────────────────────
const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER_R = SIZE / 2 - 32;
const INNER_R = OUTER_R * 0.52;
const MID_R = (OUTER_R + INNER_R) / 2;
const TRACK_W = OUTER_R - INNER_R;

// ── Colors ────────────────────────────────────────────────────────────────
// Absolute colors so both light and dark modes have strong contrast in SVG.
const WAXING_COLOR = "var(--color-lunar)";
const WANING_COLOR = "var(--color-lunar-deep)";
const WAXING_BRIGHT = "var(--color-lunar)";
const TRACK_BG = "var(--color-rule-2)";

// ── Helpers ──────────────────────────────────────────────────────────────────
function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function arcPath(
  startDeg: number,
  endDeg: number,
  outerR: number,
  innerR: number,
  gap = 0,
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

// ── Component ────────────────────────────────────────────────────────────────
export default function MoonWheel({ moonClock }: MoonWheelProps) {
  const { synodicDay, segment, phasePeak } = moonClock;

  const isBreathIn = segment === "breath-in";
  const activeColor = isBreathIn ? WAXING_COLOR : WANING_COLOR;
  const illum = lunarIllumination(synodicDay);

  // Nonary lunar phase: 0–9 scale (1 phase ≈ LUNAR_PHASE_UNIT_DAYS)
  const lunarPhase = synodicDay / LUNAR_PHASE_UNIT_DAYS;

  // Progress dot position
  const progressDeg = (synodicDay / SYNODIC_MONTH_DAYS) * 360;
  const progressRad = degToRad(progressDeg);
  const px = CX + MID_R * Math.cos(progressRad);
  const py = CY + MID_R * Math.sin(progressRad);

  // Phases until next full moon (in nonary phase units)
  const daysUntilFull = isBreathIn
    ? HALF_SYNODIC - synodicDay
    : SYNODIC_MONTH_DAYS + HALF_SYNODIC - synodicDay;
  const phasesUntilFull = daysUntilFull / LUNAR_PHASE_UNIT_DAYS;

  // Peak label
  const peakLabel =
    phasePeak === "full-moon"
      ? "🌕 Full Moon"
      : phasePeak === "new-moon"
        ? "🌑 New Moon"
        : null;

  // 9 phase tick marks, one every 40° (clockwise from 12 o'clock)
  const phaseTicks = Array.from({ length: 9 }, (_, i) => i); // 0–8

  return (
    <div className="cycle-instrument" style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Moon Clock</h2>
        {peakLabel ? (
          <span style={{ ...styles.badge, color: "var(--color-solar-soft)" }}>{peakLabel}</span>
        ) : (
          <span
            style={{
              ...styles.badge,
              color: isBreathIn ? WAXING_BRIGHT : WANING_COLOR,
            }}
          >
            {isBreathIn ? "↑ Breath-in" : "↓ Breath-out"}
          </span>
        )}
      </div>

      <div style={styles.clockWrap}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="moon-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Soft glow for dot */}
            <filter
              id="dot-glow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Waxing gradient fill */}
            <linearGradient id="waxing-grad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={WAXING_BRIGHT} stopOpacity="0.55" />
              <stop offset="100%" stopColor={WAXING_COLOR} stopOpacity="0.25" />
            </linearGradient>
            {/* Waning gradient fill */}
            <linearGradient id="waning-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={WANING_COLOR} stopOpacity="0.55" />
              <stop offset="100%" stopColor={WANING_COLOR} stopOpacity="0.25" />
            </linearGradient>
            {/* Centre disc gradient */}
            <radialGradient id="centre-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="color-mix(in oklch, var(--color-lunar) 18%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in oklch, var(--color-lunar-deep) 4%, transparent)" />
            </radialGradient>
          </defs>

          {/* ── Outer decorative ring ── */}
          <circle
            cx={CX}
            cy={CY}
            r={OUTER_R + 6}
            fill="none"
            stroke={WAXING_COLOR}
            strokeWidth={1}
            strokeOpacity={0.15}
            strokeDasharray="2 6"
          />

          {/* ── Track background ── */}
          <circle
            cx={CX}
            cy={CY}
            r={MID_R}
            fill="none"
            stroke={TRACK_BG}
            strokeWidth={TRACK_W}
          />

          {/* ── Breath-in arc (0° → 180°, right half) waxing ── */}
          <path
            d={arcPath(0, 180, OUTER_R, INNER_R, 1.5)}
            fill={isBreathIn ? "url(#waxing-grad)" : "color-mix(in oklch, var(--color-lunar) 6%, transparent)"}
            stroke={WAXING_BRIGHT}
            strokeWidth={isBreathIn ? 2 : 0.8}
            strokeOpacity={isBreathIn ? 0.9 : 0.3}
            filter={isBreathIn ? "url(#moon-glow)" : undefined}
            style={{ transition: "opacity var(--dur-long) var(--ease-out)" }}
          />

          {/* ── Breath-out arc (180° → 360°, left half) waning ── */}
          <path
            d={arcPath(180, 360, OUTER_R, INNER_R, 1.5)}
            fill={!isBreathIn ? "url(#waning-grad)" : "color-mix(in oklch, var(--color-lunar-deep) 6%, transparent)"}
            stroke={WANING_COLOR}
            strokeWidth={!isBreathIn ? 2 : 0.8}
            strokeOpacity={!isBreathIn ? 0.9 : 0.3}
            filter={!isBreathIn ? "url(#moon-glow)" : undefined}
            style={{ transition: "opacity var(--dur-long) var(--ease-out)" }}
          />

          {/* ── 9 phase tick marks (every 40°) ── */}
          {phaseTicks.map((phase) => {
            const tickDeg = phase * (360 / 9); // 0, 40, 80 … 320
            const r1 = degToRad(tickDeg);
            // Ticks alternate: longer on even phases (0, 2, 4, 6, 8)
            const isMain = phase % 2 === 0;
            const tickLen = isMain ? 10 : 6;
            const t1x = CX + (OUTER_R + 5) * Math.cos(r1);
            const t1y = CY + (OUTER_R + 5) * Math.sin(r1);
            const t2x = CX + (OUTER_R + 5 + tickLen) * Math.cos(r1);
            const t2y = CY + (OUTER_R + 5 + tickLen) * Math.sin(r1);
            const lx = CX + (OUTER_R + 22) * Math.cos(r1);
            const ly = CY + (OUTER_R + 22) * Math.sin(r1);
            return (
              <g key={phase}>
                <line
                  x1={t1x}
                  y1={t1y}
                  x2={t2x}
                  y2={t2y}
                  stroke={isMain ? WAXING_COLOR : "color-mix(in oklch, var(--color-lunar) 40%, transparent)"}
                  strokeWidth={isMain ? 1.5 : 1}
                />
                {isMain && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={WAXING_COLOR}
                    fillOpacity={0.75}
                    fontSize={9}
                    fontFamily="var(--font-display)"
                    fontWeight={600}
                  >
                    {phase}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Full Moon marker at 180° (bottom) ── */}
          <circle
            cx={CX + MID_R * Math.cos(degToRad(180))}
            cy={CY + MID_R * Math.sin(degToRad(180))}
            r={phasePeak === "full-moon" ? 9 : 6}
            fill={
              phasePeak === "full-moon"
                ? "var(--color-ink)"
                : "color-mix(in oklch, var(--color-lunar) 45%, transparent)"
            }
            stroke={WAXING_BRIGHT}
            strokeWidth={phasePeak === "full-moon" ? 2 : 1}
            strokeOpacity={0.7}
            filter={phasePeak === "full-moon" ? "url(#moon-glow)" : undefined}
            style={{ transition: "opacity var(--dur-short) var(--ease-out)" }}
          />

          {/* ── New Moon marker at 0° (top) ── */}
          <circle
            cx={CX + MID_R * Math.cos(degToRad(0))}
            cy={CY + MID_R * Math.sin(degToRad(0))}
            r={phasePeak === "new-moon" ? 9 : 6}
            fill={
              phasePeak === "new-moon"
                ? "var(--color-lunar-deep)"
                : "color-mix(in oklch, var(--color-lunar-deep) 35%, transparent)"
            }
            stroke={WANING_COLOR}
            strokeWidth={phasePeak === "new-moon" ? 2 : 1}
            strokeOpacity={0.6}
            filter={phasePeak === "new-moon" ? "url(#moon-glow)" : undefined}
            style={{ transition: "opacity var(--dur-short) var(--ease-out)" }}
          />

          {/* ── Vertical divider (12 o'clock ↔ 6 o'clock) ── */}
          <line
            x1={CX}
            y1={CY - OUTER_R - 2}
            x2={CX}
            y2={CY + OUTER_R + 2}
            stroke="color-mix(in oklch, var(--color-lunar) 25%, transparent)"
            strokeWidth={1}
            strokeDasharray="3 5"
          />

          {/* ── Section labels ── */}
          <text
            x={CX + MID_R * 0.72}
            y={CY - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill={WAXING_BRIGHT}
            fillOpacity={isBreathIn ? 0.75 : 0.3}
            fontSize={8}
            fontFamily="var(--font-body)"
            fontWeight={500}
            letterSpacing="0.5"
          >
            WAXING
          </text>
          <text
            x={CX - MID_R * 0.72}
            y={CY - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill={WANING_COLOR}
            fillOpacity={!isBreathIn ? 0.9 : 0.35}
            fontSize={8}
            fontFamily="var(--font-body)"
            fontWeight={500}
            letterSpacing="0.5"
          >
            WANING
          </text>

          {/* ── Progress dot ── */}
          {/* Outer glow halo */}
          <circle
            cx={px}
            cy={py}
            r={16}
            fill={activeColor}
            fillOpacity={0.18}
            style={{ transition: "transform var(--dur-long) var(--ease-out)" }}
          />
          {/* Mid ring */}
          <circle
            cx={px}
            cy={py}
            r={10}
            fill={activeColor}
            fillOpacity={0.35}
            filter="url(#dot-glow)"
            style={{ transition: "transform var(--dur-long) var(--ease-out)" }}
          />
          {/* Core dot */}
          <circle
            cx={px}
            cy={py}
            r={5.5}
            fill={isBreathIn ? WAXING_BRIGHT : "var(--color-lunar-deep)"}
            stroke="white"
            strokeWidth={1.5}
            style={{ transition: "transform var(--dur-long) var(--ease-out)" }}
          />

          {/* ── Centre disc ── */}
          {/* Shadow ring */}
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R - 5}
            fill="none"
            stroke="color-mix(in oklch, var(--color-lunar-deep) 30%, transparent)"
            strokeWidth={2}
          />
          {/* Disc background */}
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R - 7}
            fill="var(--bg-primary)"
            stroke="color-mix(in oklch, var(--color-lunar) 20%, transparent)"
            strokeWidth={1}
          />
          {/* Illumination fill */}
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R - 14}
            fill={`color-mix(in oklch, var(--color-lunar) ${illum * 55}%, transparent)`}
            style={{ transition: "opacity var(--dur-long) var(--ease-out)" }}
          />
          {/* Gradient overlay */}
          <circle cx={CX} cy={CY} r={INNER_R - 14} fill="url(#centre-grad)" />

          {/* ── Centre text ── */}
          {/* Main phase number */}
          <text
            x={CX}
            y={CY - 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-primary)"
            fontSize={28}
            fontFamily="var(--font-display)"
            fontWeight={700}
            style={{
              filter: `drop-shadow(0 0 10px ${isBreathIn ? "var(--color-lunar)" : "var(--color-lunar-deep)"})`,
            }}
          >
            {lunarPhase.toFixed(1)}
          </text>
          {/* "PHASE" label */}
          <text
            x={CX}
            y={CY + 6}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isBreathIn ? WAXING_COLOR : WANING_COLOR}
            fillOpacity={0.85}
            fontSize={8}
            fontFamily="var(--font-body)"
            fontWeight={700}
            letterSpacing="1.5"
          >
            LUNAR PHASE
          </text>
          {/* Illumination % */}
          <text
            x={CX}
            y={CY + 23}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isBreathIn ? WAXING_BRIGHT : WANING_COLOR}
            fillOpacity={0.9}
            fontSize={11}
            fontFamily="var(--font-display)"
            fontWeight={600}
          >
            {Math.round(illum * 100)}% LIT
          </text>
        </svg>
      </div>

      {/* ── Info panel ── */}
      <div className="glass-panel" style={styles.infoPanel}>
        <InfoRow
          label="Reading"
          value={formatMoonClock(moonClock)}
          valueColor={isBreathIn ? WAXING_COLOR : WANING_COLOR}
        />
        <InfoRow label="Lunar phase" value={`${lunarPhase.toFixed(3)} / 9`} />
        <InfoRow
          label="Segment"
          value={isBreathIn ? "Breath-in (waxing)" : "Breath-out (waning)"}
          valueColor={isBreathIn ? WAXING_COLOR : WANING_COLOR}
        />
        <InfoRow label="Illumination" value={`${(illum * 100).toFixed(1)}%`} />
        {phasePeak && (
          <InfoRow
            label="Peak"
            value={phasePeak === "full-moon" ? "🌕 Full Moon" : "🌑 New Moon"}
            valueColor="var(--color-solar-soft)"
          />
        )}
        <InfoRow
          label="Next Full Moon"
          value={`in ${phasesUntilFull.toFixed(2)} phases`}
        />
      </div>

      {/* ── Breath legend ── */}
      <div style={styles.legend}>
        <LegendRow
          color={WAXING_BRIGHT}
          active={isBreathIn}
          label={`Breath-in — New Moon → Full Moon (4.5 phases)`}
        />
        <LegendRow
          color={WANING_COLOR}
          active={!isBreathIn}
          label={`Breath-out — Full Moon → New Moon (4.5 phases)`}
        />
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function LegendRow({
  color,
  active,
  label,
}: {
  color: string;
  active: boolean;
  label: string;
}) {
  return (
    <div style={styles.legendItem}>
      <div
        style={{
          ...styles.legendDot,
          background: color,
          opacity: active ? 1 : 0.35,
          boxShadow: active ? `0 0 6px ${color}` : "none",
        }}
      />
      <span
        style={{
          ...styles.legendLabel,
          color: active ? "var(--text-primary)" : "var(--text-dim-40)",
        }}
      >
        {label}
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
    fontFamily: "var(--font-display)",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  badge: {
    fontFamily: "var(--font-display)",
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
    gap: 14,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 16,
  },
  infoLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-dim-40)",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: "var(--font-display)",
    fontSize: 14,
    fontWeight: 500,
    textAlign: "right" as const,
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    flexShrink: 0,
    transition: "opacity var(--dur-short) var(--ease-out)",
  },
  legendLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    fontWeight: 400,
    transition: "color 0.4s ease",
  },
};

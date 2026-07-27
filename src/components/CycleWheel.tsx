/**
 * CycleWheel — SVG circular wheel with 9 segments.
 * Active segment glows, others remain dim. Smooth transitions on change.
 */

import { useEffect, useState } from "react";
import type { CyclePosition } from "../engine/types";

interface CycleWheelProps {
  value: CyclePosition;
  label: string;
  sublabel?: string;
  accentColor: string;
  glowColor: string;
  size?: number;
}

export default function CycleWheel({
  value,
  label,
  sublabel,
  accentColor,
  glowColor,
  size = 180,
}: CycleWheelProps) {
  const [animatedValue, setAnimatedValue] = useState(value);

  useEffect(() => {
    // Slight delay for transition effect
    const t = setTimeout(() => setAnimatedValue(value), 50);
    return () => clearTimeout(t);
  }, [value]);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.62;
  const labelR = outerR * 0.82;
  const segmentGap = 0.03; // radians gap between segments
  const totalAngle = (2 * Math.PI) / 9;

  function describeArc(index: number, rOuter: number, rInner: number): string {
    const startAngle = index * totalAngle - Math.PI / 2 + segmentGap / 2;
    const endAngle = (index + 1) * totalAngle - Math.PI / 2 - segmentGap / 2;

    const x1Outer = cx + rOuter * Math.cos(startAngle);
    const y1Outer = cy + rOuter * Math.sin(startAngle);
    const x2Outer = cx + rOuter * Math.cos(endAngle);
    const y2Outer = cy + rOuter * Math.sin(endAngle);
    const x1Inner = cx + rInner * Math.cos(endAngle);
    const y1Inner = cy + rInner * Math.sin(endAngle);
    const x2Inner = cx + rInner * Math.cos(startAngle);
    const y2Inner = cy + rInner * Math.sin(startAngle);

    return [
      `M ${x1Outer} ${y1Outer}`,
      `A ${rOuter} ${rOuter} 0 0 1 ${x2Outer} ${y2Outer}`,
      `L ${x1Inner} ${y1Inner}`,
      `A ${rInner} ${rInner} 0 0 0 ${x2Inner} ${y2Inner}`,
      `Z`,
    ].join(" ");
  }

  const segments = Array.from({ length: 9 }, (_, i) => {
    const segmentNum = (i + 1) as CyclePosition;
    const isActive = segmentNum === animatedValue;
    const midAngle = (i + 0.5) * totalAngle - Math.PI / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { index: i, segmentNum, isActive, midAngle, lx, ly };
  });

  return (
    <div style={styles.container}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.svg}
      >
        <defs>
          <filter
            id={`glow-${label}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={(outerR + innerR) / 2}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={outerR - innerR}
        />

        {/* Segments */}
        {segments.map(({ index, segmentNum, isActive }) => (
          <path
            key={segmentNum}
            d={describeArc(index, outerR, innerR)}
            fill={isActive ? accentColor : "var(--surface-4)"}
            stroke={isActive ? accentColor : "var(--surface-8)"}
            strokeWidth={isActive ? 1.5 : 0.5}
            opacity={isActive ? 1 : 0.6}
            filter={isActive ? `url(#glow-${label})` : undefined}
            style={{
              transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "default",
            }}
          />
        ))}

        {/* Segment numbers */}
        {segments.map(({ segmentNum, isActive, lx, ly }) => (
          <text
            key={`label-${segmentNum}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isActive ? "#fff" : "var(--text-dim-35)"}
            fontSize={isActive ? 13 : 11}
            fontFamily="var(--font-display)"
            fontWeight={isActive ? 600 : 400}
            style={{ transition: "all 0.4s ease", pointerEvents: "none" }}
          >
            {segmentNum}
          </text>
        ))}

        {/* Center value */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fill={accentColor}
          fontSize={28}
          fontFamily="var(--font-display)"
          fontWeight={700}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        >
          {animatedValue}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-dim-35)"
          fontSize={9}
          fontFamily="var(--font-body)"
          fontWeight={500}
          letterSpacing="1.5"
        >
          OF 9
        </text>
      </svg>

      <div style={styles.labelContainer}>
        <span style={{ ...styles.label, color: accentColor }}>{label}</span>
        {sublabel && <span style={styles.sublabel}>{sublabel}</span>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  svg: {
    overflow: "visible",
    filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
  },
  labelContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontFamily: "var(--font-display)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  sublabel: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-dim-45)",
    fontWeight: 400,
  },
};

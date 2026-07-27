/**
 * Geometry for the meshed Tzolk'in gear pair.
 *
 * The two pitch radii are in the exact ratio of their tooth counts
 * (13 : 20 → 91 : 140), so the rims travel at identical arc speed and the
 * wheels mesh like real gears. The pitch circles are tangent at the shared
 * contact point; the active coefficient tooth and the active day-sign notch
 * both rotate onto that point, where the tooth (r 14) nests inside the
 * notch (r 16) with a 2px reveal.
 */
export const WHEEL = {
  contact: { x: 310, y: 195 },
  number: { cx: 219, cy: 195, pitch: 91, tooth: 14, count: 13, hub: 18, ring: 55 },
  sign: { cx: 450, cy: 195, pitch: 140, notch: 16, count: 20, hub: 21, ring: 98, dot: 113, label: 167 },
} as const;

const rad = (deg: number) => (deg * Math.PI) / 180;

export const point = (cx: number, cy: number, radius: number, degrees: number) => ({
  x: cx + Math.cos(rad(degrees)) * radius,
  y: cy + Math.sin(rad(degrees)) * radius,
});

export const fmt = (value: number) => Number(value.toFixed(2));

/**
 * Build a closed gear outline: rim arcs on the pitch circle joined by
 * near-semicircular teeth (outward bumps) or notches (inward bites) whose
 * endpoints sit exactly on the pitch circle.
 */
export function gearOutline(
  cx: number,
  cy: number,
  pitchRadius: number,
  count: number,
  toothRadius: number,
  kind: "teeth" | "notches",
): string {
  // Half the angular width the tooth circle subtends on the pitch circle.
  const half = (2 * Math.asin(toothRadius / (2 * pitchRadius)) * 180) / Math.PI;
  const step = 360 / count;
  const bulgeSweep = kind === "teeth" ? 1 : 0;
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = i * step;
    const start = point(cx, cy, pitchRadius, angle - half);
    const end = point(cx, cy, pitchRadius, angle + half);
    parts.push(
      i === 0
        ? `M ${fmt(start.x)} ${fmt(start.y)}`
        : `A ${pitchRadius} ${pitchRadius} 0 0 1 ${fmt(start.x)} ${fmt(start.y)}`,
    );
    parts.push(`A ${toothRadius} ${toothRadius} 0 1 ${bulgeSweep} ${fmt(end.x)} ${fmt(end.y)}`);
  }
  const first = point(cx, cy, pitchRadius, -half);
  parts.push(`A ${pitchRadius} ${pitchRadius} 0 0 1 ${fmt(first.x)} ${fmt(first.y)} Z`);
  return parts.join(" ");
}

/** Rotation placing the active coefficient tooth on the contact point. */
export const numberWheelAngle = (coefficient: number) =>
  -(coefficient - 1) * (360 / WHEEL.number.count);

/**
 * Rotation placing the active sign notch on the contact point. Sign stations
 * are laid out at -index * 18° so the wheel turns clockwise while the number
 * wheel turns counter-clockwise — both rims rise through the mesh together.
 */
export const signWheelAngle = (daySignIndex: number) =>
  180 + daySignIndex * (360 / WHEEL.sign.count);

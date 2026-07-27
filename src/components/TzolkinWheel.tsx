import { TZOLKIN_DAY_SIGNS, type TzolkinReading } from "../engine/tzolkin";
import { WHEEL, fmt, gearOutline, numberWheelAngle, point, signWheelAngle } from "./tzolkinWheelGeometry";

interface TzolkinWheelProps {
  reading: TzolkinReading;
}

export default function TzolkinWheel({ reading }: TzolkinWheelProps) {
  const N = WHEEL.number;
  const S = WHEEL.sign;
  const C = WHEEL.contact;
  const numberAngle = numberWheelAngle(reading.coefficient);
  const signAngle = signWheelAngle(reading.daySignIndex);
  const activeNotch = point(S.cx, S.cy, S.pitch, -reading.daySignIndex * 18);

  return (
    <svg viewBox="0 0 650 390" role="img" aria-labelledby="tz-wheel-title tz-wheel-desc">
      <title id="tz-wheel-title">
        {`${reading.coefficient} ${reading.daySign}, day ${reading.position} of 260`}
      </title>
      <desc id="tz-wheel-desc">
        Two meshed wheels: thirteen number teeth engage twenty day-sign notches. The active
        coefficient tooth sits inside the active sign notch at the glowing contact point.
      </desc>
      <defs>
        <radialGradient id="tzContactGlow">
          <stop className="tz-glow-stop tz-glow-stop--core" offset="0" />
          <stop className="tz-glow-stop tz-glow-stop--edge" offset="1" />
        </radialGradient>
      </defs>

      <path className="tz-orbit-rule" d="M42 195H578" />
      <circle className="tz-glow" cx={C.x} cy={C.y} r={44} fill="url(#tzContactGlow)" aria-hidden="true" />

      <g
        className="tz-wheel tz-sign-wheel"
        transform={`rotate(${fmt(signAngle)} ${S.cx} ${S.cy})`}
        style={{ "--wheel-angle": `${signAngle}deg` } as React.CSSProperties}
      >
        <path className="tz-gear tz-gear--sign" d={gearOutline(S.cx, S.cy, S.pitch, S.count, S.notch, "notches")} />
        <circle className="tz-ring" cx={S.cx} cy={S.cy} r={S.ring} aria-hidden="true" />
        <circle className="tz-hub" cx={S.cx} cy={S.cy} r={S.hub} />
        <circle className="tz-pin" cx={S.cx} cy={S.cy} r={2.5} />
        <circle className="tz-notch-active" cx={fmt(activeNotch.x)} cy={fmt(activeNotch.y)} r={S.notch} />
        {TZOLKIN_DAY_SIGNS.map((sign, index) => {
          const angle = -index * (360 / S.count);
          const dot = point(S.cx, S.cy, S.dot, angle);
          const label = point(S.cx, S.cy, S.label, angle);
          const offset = Math.abs(index - reading.daySignIndex);
          const distance = Math.min(offset, S.count - offset) * (360 / S.count);
          const active = index === reading.daySignIndex;
          return (
            <g key={sign}>
              <circle
                className={`tz-sign-dot${active ? " is-active" : ""}`}
                cx={fmt(dot.x)}
                cy={fmt(dot.y)}
                r={active ? 5 : 3.5}
              />
              <g transform={`translate(${fmt(label.x)} ${fmt(label.y)})`}>
                <g className="tz-upright" transform={`rotate(${fmt(-signAngle)})`}>
                  <text
                    className={`tz-sign-name${active ? " is-active" : ""}`}
                    style={{ opacity: distance <= 18 ? 0 : 1 }}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {sign}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </g>

      <g
        className="tz-wheel tz-number-wheel"
        transform={`rotate(${fmt(numberAngle)} ${N.cx} ${N.cy})`}
        style={{ "--wheel-angle": `${numberAngle}deg` } as React.CSSProperties}
      >
        <path className="tz-gear tz-gear--number" d={gearOutline(N.cx, N.cy, N.pitch, N.count, N.tooth, "teeth")} />
        <circle className="tz-ring" cx={N.cx} cy={N.cy} r={N.ring} aria-hidden="true" />
        <circle className="tz-hub" cx={N.cx} cy={N.cy} r={N.hub} />
        <circle className="tz-pin" cx={N.cx} cy={N.cy} r={2.5} />
        {Array.from({ length: N.count }, (_, index) => {
          const angle = index * (360 / N.count);
          const p = point(N.cx, N.cy, N.pitch, angle);
          const active = index === reading.coefficient - 1;
          return (
            <g key={index} transform={`translate(${fmt(p.x)} ${fmt(p.y)})`}>
              <circle className={`tz-tooth-disc${active ? " is-active" : ""}`} r={10.5} />
              <g className="tz-upright" transform={`rotate(${fmt(-numberAngle)})`}>
                <text
                  className={`tz-number${active ? " is-active" : ""}`}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {index + 1}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

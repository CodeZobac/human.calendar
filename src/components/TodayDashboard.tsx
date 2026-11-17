import type { CSSProperties } from "react";
import type { Reading } from "../engine/types";
import {
  DAY_SEGMENT_COLORS,
  DAY_SEGMENT_LABELS,
  LUNAR_SEGMENT_COLORS,
  META_SEASON_COLORS,
  META_SEASON_LABELS,
  moonPhaseName,
  lunarIllumination,
  nonaryHoursToConventional,
} from "../engine/viewModel";
import type { DawnInfo } from "../services/geo";
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

const R = 150;
// The nine-hour day, counted from sunrise. Boundaries match engine/dayClock.ts.
const DAY_PARTS = [
  { key: "dawn", from: 0, to: 0.5, note: "o corpo desperta com a primeira luz" },
  { key: "day", from: 0.5, to: 4.5, note: "as horas de maior energia" },
  { key: "dusk", from: 4.5, to: 5, note: "a luz baixa e o ritmo abranda" },
  { key: "night", from: 5, to: 9, note: "descanso e reparação" },
] as const;
const HALF = Math.PI * R;

export default function TodayDashboard({
  reading,
  selectedDate,
  onDateChange,
  isToday,
  onResetToday,
  dawnInfo,
}: TodayDashboardProps) {
  const { dayClock, solarYear, earthMonth, moonClock } = reading;
  const fullDate = selectedDate.toLocaleDateString("pt-PT", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const breathLine =
    solarYear.breathPhase === "breath-in"
      ? "a inspirar"
      : solarYear.breathPhase === "breath-out"
        ? "a expirar"
        : "em pausa";
  // The ring is the year: right half breathes in, left half breathes out.
  const yearProgress = Math.min(1, ((solarYear.month - 1) * 40 + solarYear.dayInMonth - 1) / 360);
  const exhaling = yearProgress > 0.5;

  const monthPhrase =
    earthMonth.segment === "grow-in" ? "em expansão" : earthMonth.segment === "grow-out" ? "em recolha" : "em pausa";
  const isNight = dayClock.segment === "night";
  const bars = [
    {
      label: "Mês",
      text: `Dia ${Math.min(40, Math.floor(earthMonth.localDay))} de 40 · ${monthPhrase}`,
      color: earthMonth.segment === "grow-in" || earthMonth.segment === "pause-1" ? "var(--color-growth)" : "var(--color-day-light)",
      progress: (earthMonth.localDay - 1) / 40.58,
    },
    {
      label: "Lua",
      text: `${moonPhaseName(moonClock)} · ${Math.round(lunarIllumination(moonClock.synodicDay) * 100)}% iluminada`,
      color: LUNAR_SEGMENT_COLORS[moonClock.segment],
      progress: moonClock.synodicDay / 29.53059,
    },
    {
      label: "Dia",
      text: isNight
        ? `Noite · faltam ${nonaryHoursToConventional(9 - dayClock.totalNonaryHours)} para o nascer do sol`
        : `${DAY_SEGMENT_LABELS[dayClock.segment]} · o sol nasceu há ${nonaryHoursToConventional(dayClock.totalNonaryHours)}`,
      color: DAY_SEGMENT_COLORS[dayClock.segment],
      progress: dayClock.totalNonaryHours / 9,
    },
  ];

  return (
    <div className="today-page">
      <section className="today-hero" aria-labelledby="today-title">
        <figure className="year-ring" style={{ "--ring": META_SEASON_COLORS[solarYear.metaSeason] } as CSSProperties}>
          <svg viewBox="0 0 400 400" role="img" aria-label={`Ano solar: mês ${solarYear.month} de 9, ${breathLine}`}>
            <circle className="year-ring__track" cx="200" cy="200" r={R} />
            <circle
              className="year-ring__arc"
              cx="200"
              cy="200"
              r={R}
              strokeDasharray={`${Math.max(0.005, yearProgress) * 2 * HALF} ${2 * HALF}`}
            />
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} className="year-ring__tick" x1="200" y1="42" x2="200" y2="58" transform={`rotate(${i * 40} 200 200)`} />
            ))}
            <circle className="year-ring__dot" cx="200" cy={200 - R} r="9" transform={`rotate(${yearProgress * 360} 200 200)`} />
            <text className={`year-ring__side${exhaling ? "" : " is-active"}`} x="200" y="200" transform="rotate(90 200 200) translate(0 -178)">Inspira</text>
            <text className={`year-ring__side${exhaling ? " is-active" : ""}`} x="200" y="200" transform="rotate(-90 200 200) translate(0 -178)">Expira</text>
          </svg>
          <figcaption>
            <strong>Mês {solarYear.month}</strong>
            <span>de 9 · {META_SEASON_LABELS[solarYear.metaSeason]}</span>
          </figcaption>
        </figure>

        <div className="today-hero__copy">
          <span className="eyebrow">{fullDate}</span>
          <h1 id="today-title">O ano está {breathLine}.</h1>
          <p className="today-lead">
            A Terra respira uma vez por ano: inspira do inverno até ao verão e expira de volta. O anel
            mostra onde estás nessa respiração; as barras, os ciclos mais curtos que cabem dentro dela.
          </p>

          <ul className="cycle-bars">
            {bars.map((bar) => (
              <li key={bar.label} style={{ "--ring": bar.color, "--p": `${Math.max(0, Math.min(1, bar.progress)) * 100}%` } as CSSProperties}>
                <span>{bar.label}</span>
                <p>{bar.text}</p>
                <i aria-hidden="true" />
              </li>
            ))}
          </ul>

          <div className="hero-date-control">
            <label className="sr-only" htmlFor="today-date">Data selecionada</label>
            <input
              id="today-date"
              type="date"
              value={toInputDate(selectedDate)}
              onChange={(event) => onDateChange(fromInputDate(event.target.value))}
            />
            {!isToday && <button type="button" onClick={onResetToday}>Voltar a hoje</button>}
            {dawnInfo && (
              <small>
                Nascer do sol às{" "}
                {dawnInfo.sunrise.toLocaleTimeString("pt-PT", {
                  timeZone: dawnInfo.location.timezone,
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                em {dawnInfo.location.city}
              </small>
            )}
          </div>
        </div>
      </section>

      <section className="today-hero today-clock" aria-labelledby="clock-title">
        <div className="today-hero__copy">
          <span className="eyebrow">O dia em nove horas</span>
          <h2 id="clock-title">O dia começa com o sol.</h2>
          <p className="today-lead">
            Aqui o dia não começa à meia-noite: começa quando o sol nasce. Daí até ao nascer seguinte
            contam-se nove horas longas, cada uma com cerca de 2h40. É o ritmo que o corpo já segue,
            guiado pela luz.
          </p>
          <ul className="day-parts">
            {DAY_PARTS.map((part) => (
              <li
                key={part.key}
                className={part.key === dayClock.segment ? "is-active" : ""}
                style={{ "--ring": DAY_SEGMENT_COLORS[part.key] } as CSSProperties}
              >
                <strong>{DAY_SEGMENT_LABELS[part.key]}</strong> {part.note}
              </li>
            ))}
          </ul>
        </div>

        <figure className="year-ring">
          <svg viewBox="0 0 400 400" role="img" aria-label={`Relógio do dia: hora ${dayClock.hour} de 9, ${DAY_SEGMENT_LABELS[dayClock.segment]}`}>
            {DAY_PARTS.map((part) => (
              <circle
                key={part.key}
                className="year-ring__arc"
                style={{ "--ring": DAY_SEGMENT_COLORS[part.key] } as CSSProperties}
                cx="200"
                cy="200"
                r={R}
                pathLength="9"
                strokeDasharray={`${part.to - part.from} 9`}
                strokeDashoffset={-part.from}
                strokeLinecap="butt"
              />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <line className="year-ring__tick" x1="200" y1="42" x2="200" y2="58" transform={`rotate(${i * 40} 200 200)`} />
                <text className="year-ring__side" x="200" y="200" transform={`rotate(${i * 40 + 20} 200 200) translate(0 -172)`}>{i + 1}</text>
              </g>
            ))}
            <circle
              className="year-ring__dot"
              style={{ "--ring": DAY_SEGMENT_COLORS[dayClock.segment] } as CSSProperties}
              cx="200"
              cy={200 - R}
              r="9"
              transform={`rotate(${(dayClock.totalNonaryHours / 9) * 360} 200 200)`}
            />
          </svg>
          <figcaption>
            <strong>Hora {dayClock.hour}</strong>
            <span>de 9 · {DAY_SEGMENT_LABELS[dayClock.segment]}</span>
          </figcaption>
        </figure>
      </section>
    </div>
  );
}

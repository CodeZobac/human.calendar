import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { TZOLKIN_DAY_SIGNS, type TzolkinReading } from "../engine/tzolkin";
import TzolkinWheel from "./TzolkinWheel";
import "./TzolkinView.css";

export type TzolkinMotion = "previous" | "next" | "jump";

interface TzolkinViewProps {
  reading: TzolkinReading;
  date: Date;
  isToday: boolean;
  motion: TzolkinMotion;
  onPrevious: () => void;
  onNext: () => void;
  onDateChange: (value: string) => void;
  onToday: () => void;
}

export default function TzolkinView({
  reading, date, isToday, motion, onPrevious, onNext, onDateChange, onToday,
}: TzolkinViewProps) {
  const dateValue = date.toISOString().slice(0, 10);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(date);

  return (
    <section className="tzolkin-page view-page animate-in" aria-labelledby="tzolkin-title">
      <div className="page-heading tzolkin-heading">
        <span className="eyebrow">The sacred 260-day count</span>
        <h1 id="tzolkin-title">Tzolk’in</h1>
        <p>Thirteen coefficients and twenty day signs turning as one continuous round.</p>
      </div>

      <div className="tzolkin-instrument">
        <div className={`tzolkin-stage motion-${motion}`} key={`${reading.gregorianDate}-${motion}`}>
          <TzolkinWheel reading={reading} />
        </div>

        <div className="tzolkin-reading" aria-live="polite">
          <span className="tzolkin-reading__date">{formattedDate}</span>
          <div className="tzolkin-reading__primary">
            <strong>{reading.coefficient}</strong>
            <span>{reading.daySign}</span>
          </div>
          <p>Position <b>{reading.position}</b> of 260</p>
        </div>

        <div className="tzolkin-controls" aria-label="Choose Tzolk’in date">
          <button type="button" className="tzolkin-step" onClick={onPrevious} aria-label="Previous day"><ChevronLeft aria-hidden="true" /></button>
          <label>
            <span className="sr-only">Tzolk’in date</span>
            <input type="date" value={dateValue} onChange={(event) => onDateChange(event.target.value)} />
          </label>
          <button type="button" className="tzolkin-step" onClick={onNext} aria-label="Next day"><ChevronRight aria-hidden="true" /></button>
          <button type="button" className="tzolkin-today" onClick={onToday} disabled={isToday}>
            <RotateCcw aria-hidden="true" /> Today
          </button>
        </div>
      </div>

      <section className="tzolkin-legend" aria-labelledby="sign-legend-title">
        <div>
          <span className="eyebrow">Twenty stations</span>
          <h2 id="sign-legend-title">Day sign sequence</h2>
        </div>
        <ol>
          {TZOLKIN_DAY_SIGNS.map((sign, index) => (
            <li className={index === reading.daySignIndex ? "is-active" : ""} key={sign}>
              <span>{String(index + 1).padStart(2, "0")}</span> {sign}
            </li>
          ))}
        </ol>
      </section>

      <div className="tzolkin-notes">
        <Info title="How the count works">
          The coefficients 1–13 and the twenty named day signs advance together. Because 13 and 20 share no factor, a particular pairing returns after 260 days.
        </Info>
        <Info title="A living tradition">
          Known in related forms as the Tzolk’in and Chol Q’ij, the count remains part of Maya ceremonial life. Ajq’ijab’—daykeepers—continue its practice, including observances such as Wajxaqib’ B’atz’. <a href="https://maya.nmai.si.edu/calendar/calendar-system" target="_blank" rel="noreferrer">Smithsonian NMAI ↗</a>
        </Info>
        <Info title="Origins and evidence">
          The 260-day calendar is ancient Mesoamerican knowledge. Scholars debate its early development across Maya and Olmec-region societies and study possible solar, seasonal, and agricultural relationships. <a href="https://www.cambridge.org/core/journals/latin-american-antiquity/article/role-of-solar-observations-in-developing-the-preclassic-maya-calendar/CE9899861546A50ACE1819A6796D8694" target="_blank" rel="noreferrer">Latin American Antiquity ↗</a> <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9821873/" target="_blank" rel="noreferrer">Science Advances ↗</a>
        </Info>
        <Info title="Atlantis and later interpretations">
          From the nineteenth century, Brasseur de Bourbourg and Augustus and Alice Le Plongeon connected Maya civilization generally with Atlantis; later Mayanist and New Age movements reworked those ideas. They are modern claims—not ancient Maya testimony—and archaeology does not support an Atlantean origin for the Tzolk’in. José Argüelles’s Dreamspell is likewise a modern system distinct from the traditional count. <a href="https://cswr.hds.harvard.edu/news/2025/11/03/imagining-atlantis-americas" target="_blank" rel="noreferrer">Harvard CSWR ↗</a>
        </Info>
      </div>

      <aside className="tzolkin-correlation">
        <strong>Conversion note</strong>
        <p>This view uses the scholarly GMT correlation constant 584283. Other correlations—and counts maintained by living communities—can produce a different Gregorian mapping.</p>
      </aside>
    </section>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <article><h2>{title}</h2><p>{children}</p></article>;
}

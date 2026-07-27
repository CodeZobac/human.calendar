import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { TZOLKIN_DAY_SIGNS, type TzolkinReading } from "../engine/tzolkin";
import { SOLAR_SEALS, getDreamspellReading, sealOf, signatureOf } from "../engine/dreamspell";
import { HEPTADS, MOONS, getThirteenMoonReading } from "../engine/thirteenMoon";
import {
  COLOR_MEANINGS,
  SEAL_MEANINGS,
  TONE_MEANINGS,
  affirmationFor,
} from "../engine/galacticMeaning";
import TzolkinWheel from "./TzolkinWheel";
import "./TzolkinView.css";

export type TzolkinMotion = "previous" | "next" | "jump";

interface TzolkinViewProps {
  /** The traditional GMT reading, shown as a scholarly cross-reference. */
  reading: TzolkinReading;
  date: Date;
  isToday: boolean;
  motion: TzolkinMotion;
  onPrevious: () => void;
  onNext: () => void;
  onDateChange: (value: string) => void;
  onToday: () => void;
}

const ORACLE_LABELS = {
  guide: "Guide",
  analog: "Destiny",
  antipode: "Challenge",
  occult: "Hidden power",
} as const;

export default function TzolkinView({
  reading, date, isToday, motion, onPrevious, onNext, onDateChange, onToday,
}: TzolkinViewProps) {
  const dateValue = date.toISOString().slice(0, 10);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(date);

  const kin = getDreamspellReading(date);
  const moon = getThirteenMoonReading(date);

  // On 0.0 Hunab Ku the count pauses, so the gears hold the previous day's
  // position rather than snapping to an arbitrary one.
  const wheelSource = kin.isHunabKu
    ? getDreamspellReading(new Date(date.getTime() - 86_400_000))
    : kin;

  const colorClass = kin.color ? kin.color.toLowerCase() : "violet";

  return (
    <section
      className={`tzolkin-page view-page animate-in is-${colorClass}`}
      aria-labelledby="tzolkin-title"
    >
      <div className="page-heading tzolkin-heading">
        <span className="eyebrow">The sacred 260-day count</span>
        <h1 id="tzolkin-title">Tzolk’in</h1>
        <p>
          Thirteen galactic tones and twenty solar seals turning as one continuous round —
          and the 13-Moon year they drive.
        </p>
      </div>

      <div className="tzolkin-instrument">
        <div
          className={`tzolkin-stage motion-${motion}${kin.isHunabKu ? " is-paused" : ""}`}
          key={`${kin.gregorianDate}-${motion}`}
        >
          <TzolkinWheel
            reading={{
              tone: wheelSource.tone!,
              signIndex: wheelSource.seal! - 1,
              signLabels: SOLAR_SEALS,
              position: wheelSource.kin!,
              signName: wheelSource.sealName!,
            }}
          />
        </div>

        <div className="tzolkin-reading" aria-live="polite">
          <span className="tzolkin-reading__date">{formattedDate}</span>

          {kin.isHunabKu ? (
            <>
              <div className="tzolkin-reading__primary">
                <span>0.0 Hunab Ku</span>
              </div>
              <p>The leap day sits outside the count. The wheels hold.</p>
            </>
          ) : (
            <>
              <div className="tzolkin-reading__primary">
                <strong>{kin.tone}</strong>
                <span>{kin.sealName}</span>
              </div>
              <p className="tzolkin-reading__signature">{kin.signature}</p>
              <p>
                Kin <b>{kin.kin}</b> of 260 · Wavespell <b>{kin.wavespell}</b> of 20
              </p>
            </>
          )}

          <div className="tzolkin-reading__moon">
            {moon.isDayOutOfTime ? (
              <strong>Day Out of Time</strong>
            ) : moon.moon === null ? (
              <strong>Outside the 13:28 grid</strong>
            ) : (
              <>
                <strong>Moon {moon.moon} · Day {moon.day}</strong>
                <span>{MOONS[moon.moon - 1].name} — {MOONS[moon.moon - 1].keyword.toLowerCase()}</span>
              </>
            )}
          </div>
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

      {!kin.isHunabKu && (
        <div className="tzolkin-detail">
          <article className="tz-panel tz-panel--affirmation">
            <span className="galactic-label">Affirmation</span>
            <blockquote className="galactic-affirmation">
              {affirmationFor(kin.tone!, kin.seal!, kin.toneName!, sealOf(kin.oracle!.guide))}
            </blockquote>
            <p className="galactic-question">
              <span>Today asks</span> {TONE_MEANINGS[kin.tone!].question}
            </p>
          </article>

          <article className="tz-panel">
            <span className="galactic-label">The energy of this day</span>
            <p className="galactic-gloss">{SEAL_MEANINGS[kin.seal!].gloss}</p>
            <dl className="galactic-facts galactic-facts--wide">
              <div>
                <dt>Seal action</dt>
                <dd>{SEAL_MEANINGS[kin.seal!].action} · {SEAL_MEANINGS[kin.seal!].essence}</dd>
              </div>
              <div>
                <dt>Seal power</dt>
                <dd>{SEAL_MEANINGS[kin.seal!].power}</dd>
              </div>
              <div>
                <dt>Tone function</dt>
                <dd>{TONE_MEANINGS[kin.tone!].action} · {TONE_MEANINGS[kin.tone!].power}</dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd>{kin.color} — {COLOR_MEANINGS[kin.color!].movement}</dd>
              </div>
            </dl>
          </article>

          <article className="tz-panel">
            <span className="galactic-label">The Oracle</span>
            <ul className="tz-oracle">
              {(["guide", "analog", "antipode", "occult"] as const).map((position) => {
                const oracleKin = kin.oracle![position];
                return (
                  <li key={position} className={position === "analog" ? "is-self" : ""}>
                    <span className="galactic-oracle__role">{ORACLE_LABELS[position]}</span>
                    <span className="galactic-oracle__kin">Kin {oracleKin}</span>
                    <span className="galactic-oracle__name">{signatureOf(oracleKin)}</span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="tz-panel">
            <span className="galactic-label">The 13-Moon year</span>
            {moon.moon === null ? (
              <p className="galactic-gloss">
                {moon.isDayOutOfTime
                  ? "The 365th day, belonging to no moon — a hinge between one year and the next."
                  : "The leap day sits outside the 13:28 grid entirely."}
              </p>
            ) : (
              <>
                <div className="tz-moonbar" aria-hidden="true">
                  {Array.from({ length: 28 }, (_, index) => (
                    <span key={index} className={index < moon.day! ? "is-filled" : ""} />
                  ))}
                </div>
                <dl className="galactic-facts galactic-facts--wide">
                  <div>
                    <dt>Heptad</dt>
                    <dd>{HEPTADS[moon.heptad!].name} · {HEPTADS[moon.heptad!].action}</dd>
                  </div>
                  <div>
                    <dt>Day of heptad</dt>
                    <dd>{moon.heptadDay} of 7</dd>
                  </div>
                  <div>
                    <dt>Day of year</dt>
                    <dd>{moon.dayOfYear} of 365</dd>
                  </div>
                  <div>
                    <dt>Year began</dt>
                    <dd>26 Jul {moon.yearStart}</dd>
                  </div>
                </dl>
              </>
            )}
          </article>
        </div>
      )}

      <section className="tzolkin-legend" aria-labelledby="sign-legend-title">
        <div>
          <span className="eyebrow">Twenty stations</span>
          <h2 id="sign-legend-title">Solar seal sequence</h2>
        </div>
        <ol>
          {SOLAR_SEALS.map((seal, index) => (
            <li className={index === (kin.seal ?? 0) - 1 ? "is-active" : ""} key={seal}>
              <span>{String(index + 1).padStart(2, "0")}</span> {seal}
            </li>
          ))}
        </ol>
      </section>

      <div className="tzolkin-notes">
        <Info title="How the count works">
          The tones 1–13 and the twenty named seals advance together. Because 13 and 20 share no
          factor, a particular pairing returns after 260 days — the mesh you see above.
        </Info>
        <Info title="Two counts, one structure">
          The wheels show the modern <b>Dreamspell</b> count (Argüelles, 1990), which anchors
          26 July 1987 to Kin 34 and treats 29 February as a day outside the count. The traditional
          Maya Tzolk’in skips no days, so it reads differently for the same date — today it gives{" "}
          <b>{reading.coefficient} {reading.daySign}</b>, position {reading.position} of 260, on the
          GMT correlation 584283. Its twenty day signs are named{" "}
          {TZOLKIN_DAY_SIGNS.slice(0, 3).join(", ")}… rather than {SOLAR_SEALS.slice(0, 3).join(", ")}…
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
        <p>
          The wheels and readings above follow the Dreamspell count, so they agree with the 13-Moon
          date shown on Today. The traditional count quoted in the notes uses the scholarly GMT
          correlation constant 584283; other correlations—and counts maintained by living
          communities—can produce a different Gregorian mapping.
        </p>
      </aside>
    </section>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <article><h2>{title}</h2><p>{children}</p></article>;
}

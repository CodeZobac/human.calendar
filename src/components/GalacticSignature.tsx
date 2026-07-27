import { getDreamspellReading, sealOf, signatureOf } from "../engine/dreamspell";
import { getThirteenMoonReading, HEPTADS, MOONS } from "../engine/thirteenMoon";
import {
  COLOR_MEANINGS,
  SEAL_MEANINGS,
  TONE_MEANINGS,
  affirmationFor,
} from "../engine/galacticMeaning";
import "./GalacticSignature.css";

interface GalacticSignatureProps {
  date: Date;
}

const ORACLE_LABELS: Record<string, string> = {
  guide: "Guide",
  analog: "Destiny",
  antipode: "Challenge",
  occult: "Hidden power",
};

export default function GalacticSignature({ date }: GalacticSignatureProps) {
  const moon = getThirteenMoonReading(date);
  const kin = getDreamspellReading(date);

  const moonInfo = moon.moon !== null ? MOONS[moon.moon - 1] : null;
  const heptadInfo = moon.heptad !== null ? HEPTADS[moon.heptad] : null;

  return (
    <section
      className={`galactic-signature${kin.color ? ` is-${kin.color.toLowerCase()}` : ""}`}
      aria-labelledby="galactic-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">The 13-Moon year and the sacred count</span>
          <h2 id="galactic-title">Galactic signature</h2>
        </div>
        <span className="epoch-note">Day {moon.dayOfYear} of 365 · year began 26 Jul {moon.yearStart}</span>
      </div>

      <div className="galactic-grid">
        <article className="galactic-moon">
          <span className="galactic-label">13-Moon position</span>
          {moon.isDayOutOfTime ? (
            <>
              <strong className="galactic-moon__primary">Day Out of Time</strong>
              <p className="galactic-moon__sub">
                The 365th day, belonging to no moon — a hinge between one year and the next.
              </p>
            </>
          ) : moon.moon === null ? (
            <>
              <strong className="galactic-moon__primary">0.0 Hunab Ku</strong>
              <p className="galactic-moon__sub">
                The leap day sits outside the count entirely. Neither moon nor kin advances.
              </p>
            </>
          ) : (
            <>
              <strong className="galactic-moon__primary">
                Moon {moon.moon} <span>·</span> Day {moon.day}
              </strong>
              <p className="galactic-moon__sub">
                {moonInfo!.name} — the moon of {moonInfo!.keyword.toLowerCase()}
              </p>
              <dl className="galactic-facts">
                <div>
                  <dt>Heptad</dt>
                  <dd>{heptadInfo!.name} · {heptadInfo!.action}</dd>
                </div>
                <div>
                  <dt>Day of heptad</dt>
                  <dd>{moon.heptadDay} of 7</dd>
                </div>
              </dl>
              <div className="galactic-moonbar" aria-hidden="true">
                {Array.from({ length: 28 }, (_, index) => (
                  <span key={index} className={index < moon.day! ? "is-filled" : ""} />
                ))}
              </div>
            </>
          )}
        </article>

        <article className="galactic-kin">
          <span className="galactic-label">Galactic signature</span>
          {kin.isHunabKu ? (
            <>
              <strong className="galactic-kin__primary">0.0 Hunab Ku</strong>
              <p className="galactic-kin__sub">A day outside the 260-day count.</p>
            </>
          ) : (
            <>
              <div className="galactic-kin__head">
                <span className="galactic-kin__number">Kin {kin.kin}</span>
                <span className={`galactic-swatch is-${kin.color!.toLowerCase()}`} aria-hidden="true" />
              </div>
              <strong className="galactic-kin__primary">{kin.signature}</strong>
              <p className="galactic-kin__sub">
                Tone {kin.tone} ({kin.toneName}) · Seal {kin.seal} ({kin.sealName}) ·
                Wavespell {kin.wavespell} of 20
              </p>

              <blockquote className="galactic-affirmation">
                {affirmationFor(kin.tone!, kin.seal!, kin.toneName!, sealOf(kin.oracle!.guide))}
              </blockquote>
            </>
          )}
        </article>

        {!kin.isHunabKu && (
          <article className="galactic-meaning">
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

            <p className="galactic-question">
              <span>Today asks</span> {TONE_MEANINGS[kin.tone!].question}
            </p>
          </article>
        )}

        {!kin.isHunabKu && (
          <article className="galactic-oracle">
            <span className="galactic-label">The Oracle</span>
            <ul>
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
        )}
      </div>

      <p className="galactic-note">
        This is the modern <b>Dreamspell</b> count (Argüelles, 1990), which anchors 26 July 1987 to
        Kin 34 and treats 29 February as a day outside the count. It is a twentieth-century system
        and deliberately differs from the traditional Maya Tzolk’in shown in the Tzolk’in view,
        which uses the GMT correlation and skips no days.
      </p>
    </section>
  );
}

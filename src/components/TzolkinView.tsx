import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  TZOLKIN_ANCHOR_DATE,
  TZOLKIN_ANCHOR_POSITION,
  TZOLKIN_DAYS,
  TZOLKIN_DAY_SIGNS,
  type TzolkinReading,
} from "../engine/tzolkin";
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
  const { meaning } = reading;
  const dateValue = date.toISOString().slice(0, 10);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(date);

  return (
    <section className="tzolkin-page view-page animate-in" aria-labelledby="tzolkin-title">
      <div className="page-heading tzolkin-heading">
        <span className="eyebrow">The sacred 260-day count</span>
        <h1 id="tzolkin-title">Tzolk’in</h1>
        <p>
          Thirteen numbers and twenty day signs turning together as one continuous round.
          Every calendar day advances both wheels by one step.
        </p>
      </div>

      <div className="tzolkin-instrument">
        <div
          className={`tzolkin-stage motion-${motion}`}
          key={`${reading.gregorianDate}-${motion}`}
        >
          <TzolkinWheel
            reading={{
              tone: reading.coefficient,
              signIndex: reading.daySignIndex,
              signLabels: TZOLKIN_DAY_SIGNS,
              position: reading.position,
              signName: reading.daySign,
            }}
          />
        </div>

        <div className="tzolkin-reading" aria-live="polite">
          <span className="tzolkin-reading__date">{formattedDate}</span>
          <div className="tzolkin-reading__primary">
            <strong>{reading.coefficient}</strong>
            <span>{reading.daySign}</span>
          </div>
          <p className="tzolkin-reading__translated">{meaning.combined_title}</p>
          <p>
            Day <b>{reading.position}</b> of 260
          </p>
        </div>

        <div className="tzolkin-controls" aria-label="Choose Tzolk’in date">
          <button
            type="button"
            className="tzolkin-step"
            onClick={onPrevious}
            aria-label="Previous day"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <label>
            <span className="sr-only">Tzolk’in date</span>
            <input
              type="date"
              value={dateValue}
              onChange={(event) => onDateChange(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="tzolkin-step"
            onClick={onNext}
            aria-label="Next day"
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <button type="button" className="tzolkin-today" onClick={onToday} disabled={isToday}>
            <RotateCcw aria-hidden="true" /> Today
          </button>
        </div>
      </div>

      <section className="tzolkin-meaning" aria-labelledby="day-meaning-title">
        <article className="tzolkin-meaning__combined">
          <span className="eyebrow">Day {meaning.day_index} · Combined reading</span>
          <h2 id="day-meaning-title">{meaning.combined_title}</h2>
          <p>{formatCombinedMeaning(meaning.combined_meaning)}</p>
        </article>

        <article>
          <span className="eyebrow">Tone {meaning.tone_index} of 13</span>
          <h2>{meaning.tone_name}</h2>
          <KeywordList keywords={meaning.tone_keywords} />
          <p>{meaning.tone_description}</p>
        </article>

        <article>
          <span className="eyebrow">Sign {meaning.sign_index} of 20</span>
          <h2>
            {reading.daySign} <small>{meaning.sign_english_name}</small>
          </h2>
          <KeywordList keywords={meaning.sign_keywords} />
          <p>{meaning.sign_description}</p>
        </article>
      </section>

      <section className="tzolkin-legend" aria-labelledby="sign-legend-title">
        <div>
          <span className="eyebrow">Twenty stations of the 260-day round</span>
          <h2 id="sign-legend-title">Day-sign sequence</h2>
          <p className="tzolkin-legend__note">
            Day 1 begins with 1 Imix. The number and sign cycles then advance together,
            returning to the same pairing after 260 days.
          </p>
        </div>
        <ol>
          {TZOLKIN_DAY_SIGNS.map((sign, index) => (
            <li className={index === reading.daySignIndex ? "is-active" : ""} key={sign}>
              <span>Sign {index + 1}</span>
              <b>{sign}</b>
              <small>{TZOLKIN_DAYS[index].sign_english_name}</small>
            </li>
          ))}
        </ol>
      </section>

      <div className="tzolkin-notes">
        <Info title="How the count works">
          The number cycle runs from 1 to 13 while the day-sign cycle runs through twenty names.
          Because 13 and 20 share no factor, a particular pairing returns after 260 days.
        </Info>
        <Info title="Anchor and calculation">
          The permanent anchor is <b>27 July 2026 = Day {TZOLKIN_ANCHOR_POSITION}, 3 Cimi</b>.
          For another date, count its elapsed calendar days from the anchor and wrap the result
          into the range 1–260. Dates before the anchor use negative elapsed days.
        </Info>
        <Info title="A continuous calendar">
          Every Gregorian civil date advances the count, including 29 February. Calculations use
          UTC calendar dates so time zones and daylight-saving changes cannot add or remove a day.
        </Info>
        <Info title="A living tradition">
          Known in related forms as the Tzolk’in and Chol Q’ij, the 260-day count remains part of
          Maya ceremonial life. Communities may maintain their own correlations between the living
          count and Gregorian dates.
        </Info>
      </div>

      <aside className="tzolkin-correlation">
        <strong>Conversion note</strong>
        <p>
          This calendar uses the specified anchor of {TZOLKIN_ANCHOR_DATE} = Day{" "}
          {TZOLKIN_ANCHOR_POSITION}. It does not use the Goodman–Martínez–Thompson correlation,
          so its Gregorian mapping can differ from GMT-based conversions and community counts.
        </p>
      </aside>
    </section>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <article><h2>{title}</h2><p>{children}</p></article>;
}

function KeywordList({ keywords }: { keywords: string[] }) {
  return (
    <ul className="tzolkin-keywords" aria-label="Keywords">
      {keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
    </ul>
  );
}

function formatCombinedMeaning(value: string): string {
  return value
    .replace(". with the sign archetype of ", " with the sign archetype of ")
    .replace(/\.\.$/, ".");
}

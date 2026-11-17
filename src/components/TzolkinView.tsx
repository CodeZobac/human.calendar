import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
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
  const formattedDate = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(date);

  return (
    <section className="tzolkin-page view-page animate-in" aria-labelledby="tzolkin-title">
      <div className="page-heading tzolkin-heading">
        <span className="eyebrow">A contagem sagrada de 260 dias</span>
        <h1 id="tzolkin-title">Tzolk’in</h1>
        <p>
          Treze números e vinte signos do dia a rodar juntos numa única volta contínua.
          Cada dia avança as duas rodas um passo, na contagem Dreamspell.
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
          {reading.hunabKu ? (
            <p>0.0 Hunab Ku · dia fora da contagem. O Kin <b>{reading.position}</b> mantém-se até amanhã.</p>
          ) : (
            <p>
              Kin <b>{reading.position}</b> de 260
            </p>
          )}
        </div>

        <div className="tzolkin-controls" aria-label="Escolher data do Tzolk’in">
          <button
            type="button"
            className="tzolkin-step"
            onClick={onPrevious}
            aria-label="Dia anterior"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <label>
            <span className="sr-only">Data do Tzolk’in</span>
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
            aria-label="Dia seguinte"
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <button type="button" className="tzolkin-today" onClick={onToday} disabled={isToday}>
            <RotateCcw aria-hidden="true" /> Hoje
          </button>
        </div>
      </div>

      <section className="tzolkin-meaning" aria-labelledby="day-meaning-title">
        <article className="tzolkin-meaning__combined">
          <span className="eyebrow">Dia {meaning.day_index} · Leitura combinada</span>
          <h2 id="day-meaning-title">{meaning.combined_title}</h2>
          <p>{meaning.combined_meaning}</p>
        </article>

        <article>
          <span className="eyebrow">Tom {meaning.tone_index} de 13</span>
          <h2>{meaning.tone_name}</h2>
          <KeywordList keywords={meaning.tone_keywords} />
          <p>{meaning.tone_description}</p>
        </article>

        <article>
          <span className="eyebrow">Signo {meaning.sign_index} de 20</span>
          <h2>
            {reading.daySign} <small>{meaning.sign_english_name}</small>
          </h2>
          <KeywordList keywords={meaning.sign_keywords} />
          <p>{meaning.sign_description}</p>
        </article>
      </section>

      <section className="tzolkin-legend" aria-labelledby="sign-legend-title">
        <div>
          <span className="eyebrow">Vinte estações da volta de 260 dias</span>
          <h2 id="sign-legend-title">Sequência dos signos</h2>
          <p className="tzolkin-legend__note">
            O dia 1 começa com 1 Imix. Os ciclos do número e do signo avançam depois juntos
            e voltam ao mesmo par ao fim de 260 dias.
          </p>
        </div>
        <ol>
          {TZOLKIN_DAY_SIGNS.map((sign, index) => (
            <li className={index === reading.daySignIndex ? "is-active" : ""} key={sign}>
              <span>Signo {index + 1}</span>
              <b>{sign}</b>
              <small>{TZOLKIN_DAYS[index].sign_english_name}</small>
            </li>
          ))}
        </ol>
      </section>

      <div className="tzolkin-notes">
        <Info title="Como funciona a contagem">
          O ciclo dos números vai de 1 a 13, enquanto o dos signos percorre vinte nomes.
          Como 13 e 20 não têm fatores em comum, cada par só se repete ao fim de 260 dias.
        </Info>
        <Info title="Âncora e cálculo">
          A contagem parte de <b>26 de julho de 1987 = Kin 34, Mago Branco Galáctico</b>. Para outra
          data, contam-se os dias decorridos desde a âncora, sem os 29 de fevereiro, e reduz-se o
          resultado ao intervalo 1–260.
        </Info>
        <Info title="O dia fora do tempo">
          O 29 de fevereiro não tem Kin: é o 0.0 Hunab Ku, um dia que fica fora da contagem. As
          rodas não avançam nesse dia e retomam a 1 de março. Os cálculos usam datas em UTC.
        </Info>
        <Info title="Uma tradição viva">
          Conhecida em formas aparentadas como Tzolk’in e Chol Q’ij, a contagem de 260 dias continua a fazer
          parte da vida cerimonial maia. A contagem tradicional segue uma correlação diferente
          da Dreamspell e não salta nenhum dia.
        </Info>
      </div>

      <aside className="tzolkin-correlation">
        <strong>Nota de conversão</strong>
        <p>
          Este calendário segue a contagem Dreamspell (Lei do Tempo), a mesma do tzolkin.io. Não usa
          a correlação Goodman–Martínez–Thompson, por isso o Kin de cada dia difere da contagem
          tradicional maia.
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
    <ul className="tzolkin-keywords" aria-label="Palavras-chave">
      {keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
    </ul>
  );
}

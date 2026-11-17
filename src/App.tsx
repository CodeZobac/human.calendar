import { useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";
import { getReading } from "./engine/reading";
import { getDawnInfo, type DawnInfo } from "./services/geo";
import TodayDashboard from "./components/TodayDashboard";
import TzolkinView, { type TzolkinMotion } from "./components/TzolkinView";
import Dock from "./components/Dock";
import Intro from "./components/Intro";
import About from "./components/About";
import { AnimatePresence } from "framer-motion";
import { getTzolkinReading } from "./engine/tzolkin";
import {
  Orbit,
  Target,
} from "lucide-react";

type Tab = "today" | "tzolkin" | "about";
function toInputDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromInputDate(s: string): Date {
  return new Date(`${s}T12:00:00Z`);
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [pickedDate, setPickedDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
  });
  const [tzolkinDate, setTzolkinDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
  });
  const [tzolkinMotion, setTzolkinMotion] = useState<TzolkinMotion>("jump");
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [introOpen, setIntroOpen] = useState(true);
  // Stable identity: Intro restarts its timer whenever onDone changes.
  const closeIntro = useCallback(() => setIntroOpen(false), []);
  const [dawnInfo, setDawnInfo] = useState<DawnInfo | null>(null);

  const navItems = useMemo(
    () => [
      { key: "today", label: "Hoje", icon: <Target /> },
      { key: "tzolkin", label: "Tzolk’in", icon: <Orbit /> },
    ].map((item) => ({
      ...item,
      onClick: () => setActiveTab(item.key as Tab),
      isActive: activeTab === item.key,
    })),
    [activeTab],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setLiveNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const todayStr = toInputDate(new Date());
  const isToday = toInputDate(pickedDate) === todayStr;
  const effectiveDate = isToday ? liveNow : pickedDate;
  const dateStr = toInputDate(effectiveDate);
  const dawnDate = useMemo(() => fromInputDate(dateStr), [dateStr]);

  useEffect(() => {
    let cancelled = false;
    getDawnInfo(dawnDate)
      .then((info) => {
        if (!cancelled) setDawnInfo(info);
      })
      .catch(() => {
        if (!cancelled) setDawnInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [dawnDate]);

  const reading = useMemo(
    () => getReading(effectiveDate, { dawnDate: dawnInfo?.sunrise }),
    [effectiveDate, dawnInfo],
  );
  const tzolkinReading = useMemo(() => getTzolkinReading(tzolkinDate), [tzolkinDate]);
  const isTzolkinToday = toInputDate(tzolkinDate) === todayStr;

  function moveTzolkin(days: number) {
    setTzolkinMotion(days < 0 ? "previous" : "next");
    setTzolkinDate((date) => new Date(date.getTime() + days * 86_400_000));
  }

  function setTzolkinInput(value: string) {
    if (!value) return;
    setTzolkinMotion("jump");
    setTzolkinDate(fromInputDate(value));
  }

  function resetTzolkinToday() {
    const now = new Date();
    setTzolkinMotion("jump");
    setTzolkinDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12)));
  }

  function resetToday() {
    const now = new Date();
    setPickedDate(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12)));
  }

  return (
    <>
    <AnimatePresence>
      {introOpen && <Intro onDone={closeIntro} />}
    </AnimatePresence>
    {/* Background: right two thirds carry a fingerprint whorl; the left third stays clear. */}
    <svg className="fingerprint" aria-hidden="true" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="fp-warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="fp-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="fingerprint__from" />
          <stop offset="1" className="fingerprint__to" />
        </linearGradient>
      </defs>
      <g filter="url(#fp-warp)" fill="none" stroke="url(#fp-ink)" strokeWidth="3">
        {Array.from({ length: 40 }, (_, i) => (
          <ellipse key={i} cx="440" cy="400" rx={8 + i * 15.5} ry={10 + i * 19} />
        ))}
      </g>
    </svg>
    <div className="app-shell" inert={introOpen}>
      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => setActiveTab("today")}
          aria-label="+ Conexão, início"
        >
          <span className="brand-mark__orbit" aria-hidden="true"><span /></span>
          <span className="brand-mark__copy">
            <strong>+ Conexão</strong>
            <small>A natureza, medida em noves</small>
          </span>
        </button>

        <Dock items={navItems} />

        <div className="header-actions">
        <button
          type="button"
          className={`about-link${activeTab === "about" ? " is-active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          Sobre
        </button>
        </div>
      </header>

      <main className="app-main" id="main-content">
        {activeTab === "today" && (
          <TodayDashboard
            reading={reading}
            selectedDate={pickedDate}
            onDateChange={setPickedDate}
            isToday={isToday}
            onResetToday={resetToday}
            dawnInfo={dawnInfo}
          />
        )}

        {activeTab === "tzolkin" && (
          <TzolkinView
            reading={tzolkinReading}
            date={tzolkinDate}
            isToday={isTzolkinToday}
            motion={tzolkinMotion}
            onPrevious={() => moveTzolkin(-1)}
            onNext={() => moveTzolkin(1)}
            onDateChange={setTzolkinInput}
            onToday={resetTzolkinToday}
          />
        )}
        {activeTab === "about" && <About />}
      </main>

      <footer className="site-footer">
        <a href="https://www.instagram.com/in.sintonia_/" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="0.6" />
          </svg>
          <span className="sr-only">Instagram: </span>in.sintonia_
        </a>
      </footer>
    </div>
    </>
  );
}

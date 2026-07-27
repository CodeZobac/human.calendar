import { useEffect, useMemo, useState } from "react";
import "./index.css";
import { getReading } from "./engine/reading";
import { getDawnInfo, type DawnInfo } from "./services/geo";
import TodayDashboard from "./components/TodayDashboard";
import DayClockView from "./components/DayClockView";
import YearWheel from "./components/YearWheel";
import MonthTimeline from "./components/MonthTimeline";
import MoonWheel from "./components/MoonWheel";
import GregorianCompare from "./components/GregorianCompare";
import TzolkinView, { type TzolkinMotion } from "./components/TzolkinView";
import Dock from "./components/Dock";
import { getTzolkinReading } from "./engine/tzolkin";
import {
  ArrowLeftRight,
  Moon,
  Orbit,
  RotateCw,
  Sun,
  Target,
} from "lucide-react";

type Tab = "today" | "nonary" | "moon" | "compare" | "tzolkin";

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
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved
      ? saved === "dark"
      : !window.matchMedia("(prefers-color-scheme: light)").matches;
  });
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
  const [dawnInfo, setDawnInfo] = useState<DawnInfo | null>(null);

  const navItems = useMemo(
    () => [
      { key: "today", label: "Today", icon: <Target /> },
      { key: "nonary", label: "Nonary", icon: <RotateCw /> },
      { key: "moon", label: "Moon", icon: <Moon /> },
      { key: "compare", label: "Compare", icon: <ArrowLeftRight /> },
      { key: "tzolkin", label: "Tzolk’in", icon: <Orbit /> },
    ].map((item) => ({
      ...item,
      onClick: () => setActiveTab(item.key as Tab),
      isActive: activeTab === item.key,
    })),
    [activeTab],
  );

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDark ? "#0b0d1b" : "#edf4ff");
  }, [isDark]);

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
    <div className="app-shell">
      <header className="site-header">
        <button
          type="button"
          className="brand-mark"
          onClick={() => setActiveTab("today")}
          aria-label="Human Cycles home"
        >
          <span className="brand-mark__orbit" aria-hidden="true"><span /></span>
          <span className="brand-mark__copy">
            <strong>Human Cycles</strong>
            <small>Nature, measured in nines</small>
          </span>
        </button>

        <Dock items={navItems} />

        <button
          type="button"
          className="icon-button theme-toggle"
          onClick={() => setIsDark((value) => !value)}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
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

        {activeTab === "nonary" && (
          <section className="view-page nonary-page animate-in" aria-labelledby="nonary-title">
            <div className="page-heading">
              <span className="eyebrow">Earth rhythm</span>
              <h1 id="nonary-title">The Nonary System</h1>
              <p>Day, solar year, and Earth month read as one nested cycle.</p>
            </div>

            <div className="nonary-instruments">
              <section className="nonary-instrument" aria-label="Day Clock">
                <DayClockView dayClock={reading.dayClock} dawnInfo={dawnInfo} />
              </section>

              <section className="nonary-instrument" aria-label="Year Wheel">
                <YearWheel solarYear={reading.solarYear} />
              </section>

              <section className="nonary-instrument nonary-instrument--month" aria-labelledby="month-timeline-title">
                <div className="page-heading page-heading--instrument">
                  <span className="eyebrow">Forty-point-five-eight days</span>
                  <h2 id="month-timeline-title">Earth Month Timeline</h2>
                  <p>A passage through expansion, pause, and contraction.</p>
                </div>
                <div className="editorial-panel timeline-panel">
                  <MonthTimeline earthMonth={reading.earthMonth} />
                </div>
              </section>
            </div>
          </section>
        )}

        {activeTab === "moon" && (
          <section className="view-page animate-in" aria-label="Moon Clock">
            <MoonWheel moonClock={reading.moonClock} />
          </section>
        )}

        {activeTab === "compare" && (
          <section className="view-page animate-in">
            <div className="page-heading page-heading--with-action">
              <div>
                <span className="eyebrow">Two ways of seeing</span>
                <h1>Gregorian / Nonary</h1>
                <p>The familiar calendar beside nature's repeating cycles.</p>
              </div>
              <DateControl
                date={pickedDate}
                isToday={isToday}
                onChange={setPickedDate}
                onReset={resetToday}
              />
            </div>
            <div className="editorial-panel compare-panel">
              <GregorianCompare reading={reading} selectedDate={pickedDate} />
            </div>
          </section>
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
      </main>
    </div>
  );
}

function DateControl({
  date,
  isToday,
  onChange,
  onReset,
}: {
  date: Date;
  isToday: boolean;
  onChange: (date: Date) => void;
  onReset: () => void;
}) {
  return (
    <div className="date-control">
      <label className="sr-only" htmlFor="comparison-date">Selected date</label>
      <input
        id="comparison-date"
        type="date"
        value={toInputDate(date)}
        onChange={(event) => onChange(fromInputDate(event.target.value))}
      />
      {!isToday && <button type="button" onClick={onReset}>Today</button>}
    </div>
  );
}

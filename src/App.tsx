/**
 * App — Root component with 6-tab navigation for the nonary calendar.
 *
 * Tabs: Today · Day · Year · Month · Moon · Compare
 *
 * State:
 *   - activeTab    : which screen is visible
 *   - selectedDate : controlled by the date picker (Today uses live time)
 *   - liveNow      : updated every 30 s when "today" is selected
 *   - isDark       : theme toggle (persisted in localStorage)
 */

import { useState, useEffect, useMemo } from "react";
import "./index.css";
import { getReading } from "./engine/reading";
import { getDawnInfo, type DawnInfo } from "./services/geo";
import TodayDashboard from "./components/TodayDashboard";
import DayClockView from "./components/DayClockView";
import YearWheel from "./components/YearWheel";
import MonthTimeline from "./components/MonthTimeline";
import MoonWheel from "./components/MoonWheel";
import GregorianCompare from "./components/GregorianCompare";
import Dock from "./components/Dock";
import { 
  Target, 
  Sun, 
  RotateCw, 
  Calendar, 
  Moon, 
  ArrowLeftRight 
} from "lucide-react";

type Tab = "today" | "day" | "year" | "month" | "moon" | "compare";

function toInputDate(d: Date): string {
  return d.toISOString().split("T")[0];
}
function fromInputDate(s: string): Date {
  return new Date(s + "T12:00:00Z");
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("today");

  const dockItems = useMemo(() => [
    { key: "today", label: "Today", icon: <Target /> },
    { key: "day", label: "Day", icon: <Sun /> },
    { key: "year", label: "Year", icon: <RotateCw /> },
    { key: "month", label: "Month", icon: <Calendar /> },
    { key: "moon", label: "Moon", icon: <Moon /> },
    { key: "compare", label: "Compare", icon: <ArrowLeftRight /> },
  ].map(item => ({
    ...item,
    onClick: () => setActiveTab(item.key as Tab),
    isActive: activeTab === item.key,
  })), [activeTab]);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return !window.matchMedia("(prefers-color-scheme: light)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  // ── Date state ─────────────────────────────────────────────────────────────
  const [pickedDate, setPickedDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0),
    );
  });

  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setLiveNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = toInputDate(new Date());
  const isToday = toInputDate(pickedDate) === todayStr;
  const effectiveDate = isToday ? liveNow : pickedDate;
  const dateStr = toInputDate(effectiveDate);

  // ── Dawn info: IP → location → real sunrise ────────────────────────────────
  const [dawnInfo, setDawnInfo] = useState<DawnInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDawnInfo(effectiveDate)
      .then((info) => {
        if (!cancelled) setDawnInfo(info);
      })
      .catch(() => {
        if (!cancelled) setDawnInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [dateStr]); // re-fetch only when the calendar date changes

  const reading = useMemo(
    () => getReading(effectiveDate, { dawnDate: dawnInfo?.sunrise }),
    [effectiveDate, dawnInfo],
  );

  function handleDateChange(d: Date) {
    setPickedDate(d);
  }

  function handleResetToday() {
    const now = new Date();
    setPickedDate(
      new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0),
      ),
    );
  }

  return (
    <>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        style={styles.themeToggle}
      >
        {isDark ? "☀" : "☽"}
      </button>

      {/* Main content */}
      <main style={styles.main}>
        {activeTab === "today" && (
          <TodayDashboard
            reading={reading}
            selectedDate={pickedDate}
            onDateChange={handleDateChange}
            isToday={isToday}
            onResetToday={handleResetToday}
            dawnInfo={dawnInfo}
          />
        )}

        {activeTab === "day" && (
          <div style={styles.screenPad}>
            <DayClockView dayClock={reading.dayClock} dawnInfo={dawnInfo} />
          </div>
        )}

        {activeTab === "year" && (
          <div style={styles.screenPad}>
            <YearWheel solarYear={reading.solarYear} />
          </div>
        )}

        {activeTab === "month" && (
          <div style={styles.screenPad}>
            <h2 style={styles.screenTitle}>Earth Month Timeline</h2>
            <div className="glass-panel" style={styles.monthCard}>
              <MonthTimeline earthMonth={reading.earthMonth} />
            </div>
          </div>
        )}

        {activeTab === "moon" && (
          <div style={styles.screenPad}>
            <MoonWheel moonClock={reading.moonClock} />
          </div>
        )}

        {activeTab === "compare" && (
          <div style={styles.screenPad}>
            <h2 style={styles.screenTitle}>Gregorian / Nonary Comparison</h2>
            <div style={styles.compareWrap}>
              <div style={styles.compareDateRow}>
                <input
                  type="date"
                  value={toInputDate(pickedDate)}
                  onChange={(e) =>
                    handleDateChange(fromInputDate(e.target.value))
                  }
                  style={styles.dateInput}
                />
                {!isToday && (
                  <button onClick={handleResetToday} style={styles.todayBtn}>
                    Today
                  </button>
                )}
              </div>
              <div className="glass-panel">
                <GregorianCompare reading={reading} selectedDate={pickedDate} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tab bar */}
      <Dock items={dockItems} />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  themeToggle: {
    position: "fixed",
    top: 12,
    right: 12,
    zIndex: 200,
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "1px solid var(--border-medium)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow-sm)",
    transition: "background 0.2s ease, border-color 0.2s ease",
  },
  main: {
    paddingBottom: 100,
    minHeight: "100dvh",
  },
  screenPad: {
    padding: "0 20px",
    maxWidth: 1200,
    margin: "0 auto",
    paddingBottom: 60,
  },
  screenTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    paddingTop: 32,
    marginBottom: 24,
  },
  monthCard: {
    padding: 24,
  },
  compareWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  compareDateRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingTop: 32,
  },
  dateInput: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--input-border)",
    background: "var(--input-bg)",
    color: "var(--input-text)",
    outline: "none",
    cursor: "pointer",
    colorScheme: "var(--color-scheme)" as React.CSSProperties["colorScheme"],
  },
  todayBtn: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid var(--border-accent)",
    background: "var(--solar-glow)",
    color: "var(--solar-400)",
    cursor: "pointer",
    fontWeight: 500,
  },
};

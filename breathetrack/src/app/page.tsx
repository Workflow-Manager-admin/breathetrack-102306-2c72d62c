export const dynamic = "force-dynamic";

"use client";
import { useState, useRef } from "react";

const COLOR_PRIMARY = "#1976D2";
const COLOR_SECONDARY = "#FFFFFF";
const COLOR_ACCENT = "#43A047";

/**
 * Simple progress graph as a sparkline.
 */
function ProgressGraph({ scores }: { scores: number[] }) {
  if (scores.length === 0) {
    return (
      <div className="w-full text-center text-gray-500">No test results yet.</div>
    );
  }
  // Sparkline dimensions
  const width = 220;
  const height = 44;
  const maxScore = Math.max(...scores, 30);
  const minScore = Math.min(...scores, 0);

  const points = scores.map((score, idx) => {
    const x = (idx / (scores.length - 1 || 1)) * (width - 18) + 9;
    const y =
      height -
      12 -
      ((score - minScore) / (maxScore - minScore || 1)) * (height - 18);
    return `${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      aria-label="Progress graph showing BOLT test results"
      className="block mx-auto"
    >
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} rx={10} fill={COLOR_SECONDARY} />
      {/* Sparkline path */}
      <polyline
        fill="none"
        stroke={COLOR_PRIMARY}
        strokeWidth="3"
        points={points.join(" ")}
      />
      {/* Dots */}
      {scores.map((score, idx) => {
        const x = (idx / (scores.length - 1 || 1)) * (width - 18) + 9;
        const y =
          height -
          12 -
          ((score - minScore) / (maxScore - minScore || 1)) * (height - 18);
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r="3"
            fill={COLOR_ACCENT}
            stroke={COLOR_PRIMARY}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * Main BreatheTrack container component
 */
export default function Home() {
  // States for app main functionality
  const [testActive, setTestActive] = useState(false);
  const [timer, setTimer] = useState(0); // in seconds
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  const timerStartRef = useRef<number | null>(null);

  // Handler for starting/stopping the BOLT test timer
  function handleTestClick() {
    if (!testActive) {
      setTestActive(true);
      setTimer(0);
      timerStartRef.current = Date.now();
      const id = setInterval(() => {
        setTimer((t) => Math.min(t + 1, 60));
      }, 1000);
      setIntervalId(id);
    } else {
      // Stop test before timer hits max (or user presses stop again)
      finishTest();
    }
  }

  // Compute what happens when finishing a test
  function finishTest() {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setTestActive(false);
    // Only record test if timer > 0
    if (timer > 0) {
      setResults((prev) => [...prev, timer]);
    }
    setTimer(0);
    timerStartRef.current = null;
  }

  // Keyboard spacebar support for accessibility (Start/stop)
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      handleTestClick();
    }
  }

  // Format seconds to mm:ss
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? m + ":" : ""}${s.toString().padStart(2, "0")}`;
  }

  const latestResult = results[results.length - 1] || null;

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-white"
      style={{ background: COLOR_SECONDARY, color: "#171717" }}
    >
      {/* HEADER with menu */}
      <header className="px-4 pt-4 pb-2 flex justify-between items-center">
        <span className="font-bold text-lg tracking-wide" style={{ color: COLOR_PRIMARY }}>
          BreatheTrack
        </span>
        <nav aria-label="Main menu">
          <button
            aria-label="Open menu"
            className="rounded-full px-4 py-2 text-base font-semibold"
            style={{ background: COLOR_PRIMARY, color: COLOR_SECONDARY }}
            onClick={() => setShowMenu((v) => !v)}
          >
            ≡
          </button>
        </nav>
      </header>

      {/* Menu dropdown */}
      {showMenu && (
        <div
          className="absolute mt-3 top-16 right-4 z-10 rounded-lg border bg-white px-6 py-4 shadow-md flex flex-col gap-3"
          style={{ borderColor: "#f0f0f0" }}
        >
          <button
            className="text-base font-semibold text-left py-1"
            style={{ color: COLOR_PRIMARY }}
            onClick={() => {
              setShowEducation(true);
              setShowMenu(false);
            }}
          >
            Educational Content
          </button>
          <button
            className="text-base font-semibold text-left py-1"
            style={{ color: COLOR_PRIMARY }}
          >
            Settings
          </button>
          <button
            className="text-base font-semibold text-left py-1"
            style={{ color: "#333" }}
            onClick={() => setShowMenu(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Educational content modal or pane */}
      {showEducation && (
        <div className="fixed inset-0 bg-black/30 z-20 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6 shadow-lg border border-gray-200 relative">
            <h2 className="font-bold text-xl mb-2" style={{ color: COLOR_PRIMARY }}>
              What is a BOLT Test?
            </h2>
            <p className="text-base mb-2">
              The Body Oxygen Level Test (BOLT) assesses respiratory health by timing your natural breath-hold after a normal exhale. Better scores reflect improved functional breathing.
            </p>
            <ul className="list-disc pl-6 text-base mb-4">
              <li>Take a normal, relaxed breath in and out.</li>
              <li>Hold your nose after exhaling.</li>
              <li>Start timer—release hold when you feel the first natural need to breathe.</li>
              <li>Your score (in seconds) is your BOLT result.</li>
            </ul>
            <button
              type="button"
              className="mt-2 rounded-md px-5 py-2 font-semibold"
              style={{
                background: COLOR_ACCENT,
                color: "#fff",
                fontSize: "1rem",
              }}
              onClick={() => setShowEducation(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MAIN app container */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-5">
        {/* Timer/Instructions area */}
        <section
          className="w-full max-w-md flex flex-col items-center bg-[#f7fafd] rounded-xl shadow border border-[#e5e9f2] px-6 py-6 mb-7"
          aria-label="BOLT test area"
        >
          {/* Instructions */}
          <div className="text-center mb-2 text-[1.1rem]">
            <span>Prepare for the BOLT test:<br /></span>
            <span className="font-medium text-sm text-gray-600">
              Take a normal breath in and out, press <b>Start Test</b>, and hold your breath after exhaling.
            </span>
          </div>
          {/* Timer display */}
          <div
            className="my-2 flex flex-col items-center"
            aria-live="polite"
            tabIndex={-1}
          >
            <span className="text-[2.3rem] font-extrabold tracking-tight"
              style={{ color: COLOR_PRIMARY, letterSpacing: "0.02em" }}
            >
              {testActive ? formatTime(timer) : formatTime(0)}
            </span>
            <span className="text-sm text-gray-600 mb-1">
              {testActive
                ? "Release when you feel the first urge to breathe."
                : "Your timer will begin counting up (in seconds)."}
            </span>
          </div>
          {/* Start/Stop button */}
          <button
            type="button"
            aria-pressed={testActive}
            aria-label={testActive ? "Stop Test" : "Start Test"}
            disabled={testActive && timer >= 60}
            tabIndex={0}
            className="w-full rounded-[32px] px-7 py-4 font-bold mt-2 shadow 
                       focus:outline-none focus:ring-2 focus:ring-[#1976D2]/50
                       text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: testActive ? COLOR_ACCENT : COLOR_PRIMARY,
              color: COLOR_SECONDARY,
              fontSize: "1.5rem",
              letterSpacing: "0.01em",
            }}
            onClick={handleTestClick}
            onKeyDown={handleKeyDown}
          >
            {testActive ? "Stop Test" : "Start Test"}
          </button>
        </section>

        {/* Latest result */}
        <section
          className="w-full max-w-md mb-6 text-center"
          aria-label="Latest result"
        >
          <span className="text-xs tracking-wide text-gray-600">Latest BOLT Result:</span>
          <div
            className="rounded-lg mx-auto bg-[#e9f5ed] text-[#146b2e] font-bold text-2xl p-3 mt-2"
            style={{
              background: "#e9f5ed",
              color: COLOR_ACCENT,
              boxShadow: "0 0 6px 0 #e0e0e0",
              width: "7.2em",
            }}
          >
            {latestResult !== null ? `${latestResult} s` : "--"}
          </div>
        </section>

        {/* Progress graph */}
        <section
          className="w-full max-w-md my-2"
          aria-label="Progress graph"
        >
          <div className="text-xs mb-2 pl-1 text-gray-700">Progress Over Time</div>
          <ProgressGraph scores={results} />
        </section>
      </main>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  ArrowRight,
  Home,
  Sparkles,
} from "lucide-react";
import {
  addTask,
  completeTask,
  firstIncompleteTask,
  getPrefs,
  incSessions,
  savePrefs,
  toggleStep,
  uid,
  type Task,
} from "@/lib/storage";

const DURATIONS = [5, 15, 25, 45] as const;
type Duration = (typeof DURATIONS)[number];

export default function FocusPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [duration, setDuration] = useState<Duration>(25);
  const [remaining, setRemaining] = useState<number>(25 * 60);
  const [running, setRunning] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [inlineTitle, setInlineTitle] = useState("");
  const tickRef = useRef<number | null>(null);

  // Load initial state
  useEffect(() => {
    const prefs = getPrefs();
    setDuration(prefs.defaultMinutes);
    setRemaining(prefs.defaultMinutes * 60);
    setTask(firstIncompleteTask());
  }, []);

  // Timer loop — uses setTimeout + Date.now to stay correct when tab backgrounds
  const targetRef = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      return;
    }
    if (targetRef.current === null) {
      targetRef.current = Date.now() + remaining * 1000;
    }
    const tick = () => {
      if (targetRef.current === null) return;
      const left = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        targetRef.current = null;
        onTimerComplete();
        return;
      }
      tickRef.current = window.setTimeout(tick, 250);
    };
    tick();
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // When duration changes while paused, reset target
  useEffect(() => {
    if (!running) {
      setRemaining(duration * 60);
      targetRef.current = null;
      savePrefs({ defaultMinutes: duration });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const totalSeconds = duration * 60;
  const progress = 1 - remaining / totalSeconds;

  const onTimerComplete = useCallback(() => {
    incSessions();
    setCelebrating(true);
    playChime();
  }, []);

  function handlePlayPause() {
    if (!running) {
      // If timer was at zero, reset to full before starting
      if (remaining <= 0) {
        setRemaining(duration * 60);
        targetRef.current = Date.now() + duration * 60 * 1000;
      } else {
        targetRef.current = Date.now() + remaining * 1000;
      }
      setRunning(true);
    } else {
      setRunning(false);
      targetRef.current = null;
    }
  }

  function handleReset() {
    setRunning(false);
    targetRef.current = null;
    setRemaining(duration * 60);
  }

  function handleToggleStep(stepId: string) {
    if (!task) return;
    const updated = toggleStep(task.id, stepId);
    const next = updated.find((t) => t.id === task.id) ?? null;
    setTask(next);
    // Auto-celebrate when all steps are complete
    if (next && next.steps.length > 0 && next.steps.every((s) => s.done)) {
      setRunning(false);
      targetRef.current = null;
      incSessions();
      setCelebrating(true);
      playChime();
    }
  }

  function handleCreateInline() {
    const title = inlineTitle.trim();
    if (!title) return;
    const t: Task = {
      id: uid(),
      title,
      steps: [],
      createdAt: Date.now(),
    };
    addTask(t);
    setTask(t);
    setInlineTitle("");
  }

  function finishSession(completeCurrent: boolean) {
    if (task && completeCurrent) {
      completeTask(task.id);
    }
    setCelebrating(false);
    setRunning(false);
    targetRef.current = null;
    setRemaining(duration * 60);
    setTask(completeCurrent ? firstIncompleteTask() : task);
  }

  return (
    <div className="pt-8 md:pt-14">
      <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">focus</p>
      <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
        One task. One timer.{" "}
        <span className="italic text-rust-600">That's the whole trick.</span>
      </h1>

      {/* Task header / inline entry */}
      <section className="mt-8">
        {task ? (
          <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
              working on
            </div>
            <h2 className="font-display text-2xl md:text-3xl mt-1.5 leading-snug">
              {task.title}
            </h2>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-100/40 p-5">
            <label className="text-sm text-ink-muted">No task queued — type one here:</label>
            <div className="mt-2 flex gap-2">
              <input
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateInline()}
                placeholder="e.g., 'write the first paragraph'"
                className="flex-1 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 font-display text-lg placeholder:text-ink-light focus:outline-none focus:border-rust-400"
              />
              <button
                onClick={handleCreateInline}
                disabled={!inlineTitle.trim()}
                className="rounded-xl bg-ink text-cream-50 px-4 py-3 text-sm hover:bg-rust-600 transition-colors disabled:opacity-50"
                aria-label="Add task"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-light">
              Want AI-generated steps?{" "}
              <Link href="/app/breakdown" className="underline underline-offset-4 text-rust-600">
                Break it down first
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* Duration picker */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Session length</span>
          {running && (
            <span className="text-xs text-ink-light">
              Change will apply after you pause
            </span>
          )}
        </div>
        <div className="mt-2 inline-flex rounded-full border border-cream-200 bg-cream-50 p-1">
          {DURATIONS.map((d) => {
            const active = d === duration;
            return (
              <button
                key={d}
                onClick={() => !running && setDuration(d)}
                disabled={running}
                className={
                  "px-4 py-2 text-sm rounded-full transition-colors " +
                  (active
                    ? "bg-ink text-cream-50"
                    : "text-ink-muted hover:text-ink disabled:opacity-50")
                }
              >
                {d} min
              </button>
            );
          })}
        </div>
      </section>

      {/* Timer dial */}
      <section className="mt-10 flex flex-col items-center">
        <TimerDial minutes={minutes} seconds={seconds} progress={progress} running={running} />

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="rounded-full border border-cream-300 p-4 text-ink-muted hover:text-ink hover:border-ink-light transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="rounded-full bg-rust-600 hover:bg-rust-700 text-cream-50 px-8 py-5 text-base font-medium flex items-center gap-3 shadow-lift transition-colors"
          >
            {running ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                {remaining === totalSeconds ? "Begin" : "Resume"}
              </>
            )}
          </button>
        </div>
      </section>

      {/* Steps checklist */}
      {task && task.steps.length > 0 && (
        <section className="mt-12">
          <h3 className="font-display text-2xl">Steps</h3>
          <ul className="mt-3 space-y-2">
            {task.steps.map((s, i) => (
              <li
                key={s.id}
                className={
                  "flex items-start gap-3 rounded-2xl border p-4 transition-colors " +
                  (s.done
                    ? "border-sage-400/40 bg-sage-400/10"
                    : "border-cream-200 bg-cream-50 hover:border-rust-400/50")
                }
              >
                <button
                  onClick={() => handleToggleStep(s.id)}
                  className={
                    "shrink-0 mt-0.5 h-6 w-6 rounded-full border-2 grid place-items-center transition-colors " +
                    (s.done
                      ? "bg-sage-500 border-sage-500 text-cream-50"
                      : "border-cream-300 hover:border-rust-400")
                  }
                  aria-label={s.done ? "Mark step undone" : "Mark step done"}
                >
                  {s.done && <Check className="h-3.5 w-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-sm text-ink-light">{i + 1}.</span>
                    <span
                      className={
                        "leading-relaxed " + (s.done ? "line-through text-ink-light" : "text-ink")
                      }
                    >
                      {s.text}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {celebrating && (
        <Celebration
          onDone={() => finishSession(true)}
          onAnother={() => {
            setCelebrating(false);
            setRemaining(duration * 60);
            targetRef.current = null;
          }}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Timer dial

function TimerDial({
  minutes,
  seconds,
  progress,
  running,
}: {
  minutes: number;
  seconds: number;
  progress: number;
  running: boolean;
}) {
  const r = 120;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = circ * (1 - clamped);

  return (
    <div className="relative">
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        className="drop-shadow-[0_10px_30px_rgba(42,36,29,0.08)]"
      >
        <defs>
          <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d68b63" />
            <stop offset="100%" stopColor="#a84f2c" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="140" cy="140" r={r} fill="#fbf7f1" stroke="#ebe2d1" strokeWidth="14" />
        {/* Progress */}
        <circle
          cx="140"
          cy="140"
          r={r}
          fill="none"
          stroke="url(#dialGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          transform="rotate(-90 140 140)"
          style={{ transition: "stroke-dashoffset 250ms linear" }}
        />
        {/* Tick marks every 5 minutes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 140 + Math.cos(angle) * (r + 16);
          const y1 = 140 + Math.sin(angle) * (r + 16);
          const x2 = 140 + Math.cos(angle) * (r + 22);
          const y2 = 140 + Math.sin(angle) * (r + 22);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ddd0b7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div
            className={
              "font-display text-6xl md:text-7xl tabular-nums tracking-tight leading-none " +
              (running ? "text-ink" : "text-ink-muted")
            }
          >
            {String(minutes).padStart(2, "0")}
            <span className={running ? "animate-pulse-soft" : ""}>:</span>
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.2em] text-ink-light">
            {running ? "focusing" : "ready"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Celebration overlay

function Celebration({
  onDone,
  onAnother,
}: {
  onDone: () => void;
  onAnother: () => void;
}) {
  const pieces = useMemo(() => makeConfetti(40), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.4}px`,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
              borderRadius: "2px",
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md mx-4 rounded-3xl bg-cream-50 border border-cream-200 shadow-lift p-8 text-center animate-fade-up">
        <div className="mx-auto h-12 w-12 rounded-full bg-rust-500/10 text-rust-600 grid place-items-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="font-display text-4xl mt-4 leading-tight">
          You <span className="italic text-rust-600">did</span> it.
        </h2>
        <p className="mt-2 text-ink-muted">
          That's one more than yesterday. The streak counted; the session counted; you counted.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onAnother}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 px-5 py-3 text-sm text-ink-muted hover:text-ink hover:border-ink-light transition-colors"
          >
            <Play className="h-4 w-4" />
            Another session
          </button>
          <button
            onClick={onDone}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream-50 px-5 py-3 text-sm font-medium hover:bg-rust-600 transition-colors"
          >
            Mark done
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <Link
          href="/app"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-light hover:text-ink"
        >
          <Home className="h-3 w-3" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

function makeConfetti(n: number) {
  const colors = ["#c36a42", "#d68b63", "#7a8e6e", "#9bac8f", "#ddd0b7"];
  return Array.from({ length: n }).map(() => ({
    left: Math.random() * 100,
    size: 8 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 600,
    duration: 1800 + Math.random() * 1600,
    rotate: Math.random() * 360,
  }));
}

// A tiny, gentle chime via WebAudio so we don't ship an audio file.
function playChime() {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);
      osc.start(start);
      osc.stop(start + 0.72);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Browser blocked audio — that's fine.
  }
}

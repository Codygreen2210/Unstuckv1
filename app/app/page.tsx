"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, CheckCircle2, Timer, ListChecks, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { StuckFlow } from "@/components/stuck-flow";
import {
  firstIncompleteTask,
  getStats,
  type Stats,
  type Task,
} from "@/lib/storage";

export default function AppHome() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    setStats(getStats());
    setTask(firstIncompleteTask());
  }, []);

  const greeting = useGreeting();

  return (
    <div className="pt-8 md:pt-14">
      {/* Greeting */}
      <section className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
          {greeting}
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight tracking-tight">
          What's getting in the way{" "}
          <span className="italic text-rust-600">right now?</span>
        </h1>
      </section>

      {/* Big I'm Stuck button */}
      <section className="mt-7 animate-fade-up [animation-delay:80ms] [animation-fill-mode:backwards]">
        <button
          onClick={() => setOpen(true)}
          className="group relative w-full overflow-hidden rounded-[2rem] bg-rust-600 hover:bg-rust-700 transition-colors p-8 md:p-10 text-left shadow-lift"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,theme(colors.cream.50),transparent_60%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-cream-100/80 text-sm tracking-wide uppercase">
                One tap. We'll figure it out.
              </div>
              <div className="font-display italic text-5xl md:text-6xl text-cream-50 mt-2 leading-none">
                I'm stuck.
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-cream-50/10 group-hover:bg-cream-50/20 transition-colors p-4 md:p-5">
              <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-cream-50" />
            </div>
          </div>
        </button>
      </section>

      {/* Stats row */}
      <section className="mt-6 grid grid-cols-3 gap-3 animate-fade-up [animation-delay:160ms] [animation-fill-mode:backwards]">
        <StatCard icon={Flame} label="day streak" value={stats?.streak ?? 0} />
        <StatCard icon={CheckCircle2} label="today" value={stats?.tasksCompletedToday ?? 0} />
        <StatCard icon={Timer} label="sessions" value={stats?.sessionsCompleted ?? 0} />
      </section>

      {/* Current task */}
      <section className="mt-10 animate-fade-up [animation-delay:220ms] [animation-fill-mode:backwards]">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Current task</h2>
          <Link
            href="/app/breakdown"
            className="text-sm text-rust-600 hover:text-rust-700 underline underline-offset-4"
          >
            New task
          </Link>
        </div>
        {task ? (
          <div className="mt-3 rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
                  in progress
                </div>
                <h3 className="font-display text-xl md:text-2xl mt-1.5 leading-snug">
                  {task.title}
                </h3>
                <div className="mt-2 text-sm text-ink-muted">
                  {task.steps.filter((s) => s.done).length} of {task.steps.length} steps done
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/app/focus"
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream-50 px-4 py-2 text-sm hover:bg-rust-600 transition-colors"
              >
                <Timer className="h-4 w-4" />
                Start a session
              </Link>
              <Link
                href="/app/breakdown"
                className="inline-flex items-center gap-2 rounded-full border border-cream-300 px-4 py-2 text-sm text-ink-muted hover:text-ink hover:border-ink-light transition-colors"
              >
                <ListChecks className="h-4 w-4" />
                Edit steps
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-cream-300 bg-cream-100/40 p-6 text-center">
            <p className="text-ink-muted">
              No task queued. Pick one small thing — we'll break it down together.
            </p>
            <Link
              href="/app/breakdown"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink text-cream-50 px-4 py-2 text-sm hover:bg-rust-600 transition-colors"
            >
              Add a task
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mt-10 mb-8 animate-fade-up [animation-delay:280ms] [animation-fill-mode:backwards]">
        <h2 className="font-display text-2xl">Or jump straight in</h2>
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          <QuickCard
            href="/app/breakdown"
            icon={ListChecks}
            title="Break a task down"
            body="Messy thought in, clear steps out."
          />
          <QuickCard
            href="/app/focus"
            icon={Timer}
            title="Start a focus session"
            body="A warm, visible timer. Nothing else."
          />
          <QuickCard
            href="/app/coach"
            icon={MessageCircle}
            title="Talk to the coach"
            body="A calm presence, one question at a time."
          />
        </div>
      </section>

      <StuckFlow open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function useGreeting() {
  const [g, setG] = useState("Hey");
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) setG("Still up");
    else if (h < 12) setG("Good morning");
    else if (h < 17) setG("Good afternoon");
    else if (h < 21

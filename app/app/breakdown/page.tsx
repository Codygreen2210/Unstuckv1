"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import {
  addTask,
  getPrefs,
  savePrefs,
  uid,
  type Task,
} from "@/lib/storage";

const SPICE_LABELS = ["Very gentle", "Honest", "No-nonsense", "Spicy"];
const SPICE_HINTS = [
  "assume low energy, tiny first step",
  "clear, practical, human-sized",
  "direct and efficient",
  "blunt, affectionate, unfiltered",
];

export default function BreakdownPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [spice, setSpice] = useState(1);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = getPrefs();
    setSpice(p.spiciness);
  }, []);

  async function breakdown() {
    if (!title.trim()) return;
    setError(null);
    setLoading(true);
    setSteps([]);
    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), spiciness: spice }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Something went wrong");
      }
      const data = (await res.json()) as { steps: string[] };
      setSteps(data.steps);
      savePrefs({ spiciness: spice as 0 | 1 | 2 | 3 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function saveAndFocus() {
    if (!title.trim() || steps.length === 0) return;
    const task: Task = {
      id: uid(),
      title: title.trim(),
      steps: steps.map((s) => ({ id: uid(), text: s, done: false })),
      createdAt: Date.now(),
    };
    addTask(task);
    router.push("/app/focus");
  }

  return (
    <div className="pt-8 md:pt-14">
      <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
        break it down
      </p>
      <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
        Say it <span className="italic">however</span> it lives in your head.
      </h1>
      <p className="mt-3 text-ink-muted max-w-xl">
        Messy is fine. Vague is fine. We'll turn it into honest, human-sized steps.
      </p>

      <div className="mt-8 rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6">
        <label className="text-sm text-ink-muted">What's the task?</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., 'clean the kitchen' or 'finish the presentation for Thursday'"
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-cream-200 bg-cream-100/40 p-4 font-display text-xl leading-snug placeholder:text-ink-light focus:outline-none focus:border-rust-400"
        />

        {/* Spiciness */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <label className="text-sm text-ink-muted">Tone</label>
            <span className="font-display text-lg text-rust-600">{SPICE_LABELS[spice]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={spice}
            onChange={(e) => setSpice(Number(e.target.value))}
            className="mt-3 w-full accent-rust-600"
            aria-label="Breakdown tone"
          />
          <div className="mt-1 text-xs text-ink-light">{SPICE_HINTS[spice]}</div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={breakdown}
            disabled={!title.trim() || loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream-50 px-5 py-3 text-sm font-medium hover:bg-rust-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </>
            ) : steps.length ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Redo breakdown
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Break it down
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rust-400/40 bg-rust-400/10 px-4 py-3 text-sm text-rust-700">
            {error}
          </div>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="mt-8 animate-fade-up">
          <h2 className="font-display text-2xl">Your steps</h2>
          <ol className="mt-3 space-y-2">
            {steps.map((s, i) => (
              <li
                key={i}
                className="flex gap-4 rounded-2xl border border-cream-200 bg-cream-50 p-4 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
              >
                <span className="shrink-0 h-8 w-8 rounded-full bg-rust-500/10 text-rust-600 grid place-items-center font-display text-sm">
                  {i + 1}
                </span>
                <span className="text-ink leading-relaxed pt-1">{s}</span>
              </li>
            ))}
          </ol>

          <button
            onClick={saveAndFocus}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-rust-600 hover:bg-rust-700 text-cream-50 px-6 py-3.5 text-base font-medium shadow-soft transition-colors"
          >
            Save task &amp; start focus
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

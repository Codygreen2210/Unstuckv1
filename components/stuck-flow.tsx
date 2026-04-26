"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Waves, Leaf, ShieldAlert, Moon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "overwhelmed" | "bored" | "scared" | "tired";

const options: {
  key: Kind;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "overwhelmed",
    label: "Overwhelmed",
    sub: "Too much at once. Brain feels loud.",
    Icon: Waves,
  },
  {
    key: "bored",
    label: "Bored",
    sub: "Nothing about this is interesting.",
    Icon: Leaf,
  },
  {
    key: "scared",
    label: "Scared",
    sub: "I'll mess it up, or it'll be bad.",
    Icon: ShieldAlert,
  },
  {
    key: "tired",
    label: "Tired",
    sub: "The tank is empty.",
    Icon: Moon,
  },
];

const advice: Record<
  Kind,
  { title: string; body: string; cta: { href: string; label: string } }
> = {
  overwhelmed: {
    title: "Let's make it smaller.",
    body: "When the pile looks impossible, we don't climb it — we pick up the one thing nearest our hand. Type the task in as messy as you like; we'll break it down together.",
    cta: { href: "/app/breakdown", label: "Break it down" },
  },
  bored: {
    title: "A timer changes everything.",
    body: "Boredom is often 'my brain has nowhere to push against.' A short visible timer gives it a wall. 15 minutes, and you're free.",
    cta: { href: "/app/focus", label: "Start a short session" },
  },
  scared: {
    title: "You don't have to do it. You have to start it.",
    body: "Fear shrinks when a task becomes concrete. Let's name the first, smallest, silliest step — the one that couldn't possibly go wrong.",
    cta: { href: "/app/breakdown", label: "Name the tiny step" },
  },
  tired: {
    title: "Rest is the task.",
    body: "You don't owe anyone your productivity right now. Lie down. Drink water. Close this tab. We'll still be here when you're back.",
    cta: { href: "/app/coach", label: "Talk it through" },
  },
};

export function StuckFlow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<Kind | null>(null);

  useEffect(() => {
    if (!open) setChoice(null);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div className="relative w-full md:max-w-lg bg-cream-50 md:rounded-3xl rounded-t-3xl shadow-lift border border-cream-200 p-6 md:p-8 animate-fade-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-ink-light hover:bg-cream-100 hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {!choice ? (
          <>
            <p className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
              Stuck check-in
            </p>
            <h2 className="font-display text-3xl md:text-4xl mt-2 leading-tight">
              What <span className="italic">kind</span> of stuck is this?
            </h2>
            <p className="mt-2 text-ink-muted">
              No wrong answers. First instinct is the right one.
            </p>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map(({ key, label, sub, Icon }) => (
                <li key={key}>
                  <button
                    onClick={() => setChoice(key)}
                    className="w-full text-left rounded-2xl border border-cream-200 bg-cream-100/50 hover:bg-cream-100 hover:border-rust-400/60 transition-all p-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-cream-50 p-2 border border-cream-200 group-hover:border-rust-400/60">
                        <Icon className="h-4 w-4 text-rust-600" />
                      </span>
                      <div>
                        <div className="font-display text-lg leading-snug">{label}</div>
                        <div className="text-sm text-ink-muted">{sub}</div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Advice kind={choice} onBack={() => setChoice(null)} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function Advice({
  kind,
  onBack,
  onClose,
}: {
  kind: Kind;
  onBack: () => void;
  onClose: () => void;
}) {
  const a = advice[kind];
  return (
    <div className="animate-fade-up">
      <p className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium capitalize">
        {kind}
      </p>
      <h3 className="font-display text-3xl md:text-4xl mt-2 leading-tight">{a.title}</h3>
      <p className="mt-3 text-ink-muted leading-relaxed">{a.body}</p>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Actually, a different one
        </button>
        <Link
          href={a.cta.href}
          onClick={onClose}
          className={cn(
            "sm:ml-auto inline-flex items-center justify-center gap-2 rounded-full",
            "bg-ink text-cream-50 px-5 py-3 text-sm font-medium",
            "hover:bg-rust-600 transition-colors",
          )}
        >
          {a.cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

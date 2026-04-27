import Link from "next/link";
import { ArrowRight, Check, Sparkles, Timer, MessageCircle, ListChecks, Moon } from "lucide-react";
import { EmailSignup } from "@/components/email-signup";

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Top nav */}
      <header className="mx-auto max-w-6xl px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rust-500" />
          <span className="font-display text-2xl tracking-tight">Unstuck</span>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-muted">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#compare" className="hover:text-ink">Why it's different</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
        </nav>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-full bg-ink text-cream-50 px-4 py-2 text-sm hover:bg-rust-600 transition-colors"
        >
          Open the app
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-16 md:pt-24 pb-16">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
              for adults with ADHD
            </p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] mt-4 tracking-tight">
              Get moving when your{" "}
              <span className="italic text-rust-600">brain won't.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-muted max-w-xl leading-relaxed">
              Unstuck is a calm, warm companion for the moment you freeze. Tell it you're stuck,
              and it figures out <span className="text-ink">why</span> — then hands you the
              smallest thing that could actually help.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rust-600 text-cream-50 px-6 py-3.5 text-base font-medium hover:bg-rust-700 transition-colors shadow-soft"
              >
                Try it now — free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-300 px-6 py-3.5 text-base text-ink-muted hover:text-ink hover:border-ink-light transition-colors"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-ink-light">
              No signup. Works in your browser. Conversations stay on your device.
            </p>
          </div>

          {/* Demo card */}
          <div className="md:col-span-5 animate-fade-up [animation-delay:120ms] [animation-fill-mode:backwards]">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-rust-400/10 blur-2xl" />
              <div className="relative rounded-[1.75rem] border border-cream-200 bg-cream-100/50 p-5 shadow-lift">
                <div className="flex items-center gap-2 text-xs text-ink-light">
                  <span className="h-2 w-2 rounded-full bg-rust-500 animate-pulse-soft" />
                  Live — tap something
                </div>
                <div className="mt-4 rounded-2xl bg-cream-50 border border-cream-200 p-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
                    Stuck check-in
                  </div>
                  <div className="font-display text-2xl leading-snug mt-2">
                    What <span className="italic">kind</span> of stuck is this?
                  </div>
                  <ul className="mt-4 space-y-2">
                    {[
                      { label: "Overwhelmed", hint: "brain is loud" },
                      { label: "Bored", hint: "nothing grabs me" },
                      { label: "Scared", hint: "might mess it up" },
                      { label: "Tired", hint: "empty tank" },
                    ].map((o, i) => (
                      <li
                        key={o.label}
                        className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-100/40 px-4 py-3 animate-fade-up"
                        style={{ animationDelay: `${200 + i * 80}ms`, animationFillMode: "backwards" }}
                      >
                        <span className="font-display text-lg">{o.label}</span>
                        <span className="text-xs text-ink-light">{o.hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-cream-100/60 border-y border-cream-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
            how it works
          </p>
          <h2 className="font-display text-4xl md:text-5xl mt-3 max-w-3xl leading-tight">
            One big button. Then the <span className="italic">right</span> kind of help.
          </h2>
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <Card
              icon={ListChecks}
              eyebrow="for overwhelmed"
              title="AI task breakdown"
              body="Type the task however messy it is in your head. We'll break it into honest, human-sized steps — not a 40-item gantt chart."
            />
            <Card
              icon={Timer}
              eyebrow="for bored"
              title="Focus with a visible timer"
              body="A warm, analog-feeling countdown. Pick 5, 15, 25, or 45 minutes. Tick off steps. Celebrate the finish."
            />
            <Card
              icon={MessageCircle}
              eyebrow="for scared"
              title="AI body-double chat"
              body="An always-available, non-judgmental presence. Sits with you. Asks one gentle question. Doesn't lecture."
            />
            <Card
              icon={Moon}
              eyebrow="for tired"
              title="Permission to rest"
              body="Sometimes the correct answer is 'not today.' We'll tell you that, and mean it. No streak-shaming."
            />
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
          why unstuck
        </p>
        <h2 className="font-display text-4xl md:text-5xl mt-3 max-w-3xl leading-tight">
          The other apps were built for <span className="italic">neurotypical</span> brains
          in costumes.
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          <CompareCol
            title="Generic planners"
            points={["Empty checklists that judge you", "No help when you freeze", "Assume you already started"]}
            tone="muted"
          />
          <CompareCol
            title="Other ADHD apps"
            points={["Cartoony mascots", "Scheduled coworking only", "Cold purple gradients"]}
            tone="muted"
          />
          <CompareCol
            title="Unstuck"
            points={[
              "Meets you at the freeze",
              "Triage → the right tool, every time",
              "Calm, warm, and honest",
            ]}
            tone="accent"
          />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-ink text-cream-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-6">
              <p className="text-xs uppercase tracking-[0.22em] text-rust-400 font-medium">
                pricing
              </p>
              <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
                Free while we figure this out <span className="italic">together.</span>
              </h2>
              <p className="mt-4 text-cream-200/80 max-w-lg">
                No credit card. No trial clock. When Unstuck launches paid tiers, existing
                users get a permanent discount — that's our promise.
              </p>
            </div>
            <div className="md:col-span-6">
              <div className="rounded-2xl border border-cream-50/10 bg-cream-50/[0.03] p-8">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-6xl">$0</span>
                  <span className="text-cream-200/70">/ forever during beta</span>
                </div>
                <ul className="mt-6 space-y-3 text-cream-100/90">
                  {[
                    "Unlimited task breakdowns",
                    "Unlimited focus sessions",
                    "Unlimited body-double chat",
                    "Streaks, stats, and session history",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="h-4 w-4 mt-1 text-rust-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/app"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-rust-500 hover:bg-rust-400 text-cream-50 px-6 py-3.5 text-base font-medium w-full transition-colors"
                >
                  Open the app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-rust-500" />
        <h2 className="font-display text-4xl md:text-6xl mt-5 leading-[1.05]">
          The task you've been avoiding?
          <br />
          <span className="italic text-rust-600">Start it in 60 seconds.</span>
        </h2>
        <Link
          href="/app"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream-50 px-6 py-3.5 text-base font-medium hover:bg-rust-600 transition-colors"
        >
          Open Unstuck
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* EMAIL SIGNUP */}
      <section className="mx-auto max-w-2xl px-6 pb-20">
        <EmailSignup />
      </section>

      <footer className="border-t border-cream-200">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-light">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-rust-500" />
            <span className="font-display text-base text-ink">Unstuck</span>
          </div>
          <div>Made with care, not urgency.</div>
        </div>
      </footer>
    </main>
  );
}

function Card({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-7 hover:border-rust-400/60 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-rust-600" />
        <span className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
          {eyebrow}
        </span>
      </div>
      <h3 className="font-display text-2xl mt-3">{title}</h3>
      <p className="mt-3 text-ink-muted leading-relaxed">{body}</p>
    </div>
  );
}

function CompareCol({
  title,
  points,
  tone,
}: {
  title: string;
  points: string[];
  tone: "muted" | "accent";
}) {
  const accent = tone === "accent";
  return (
    <div
      className={
        accent
          ? "rounded-2xl border-2 border-rust-500 bg-cream-50 p-7 shadow-soft"
          : "rounded-2xl border border-cream-200 bg-cream-100/40 p-7"
      }
    >
      <h3 className={`font-display text-xl ${accent ? "text-rust-600" : "text-ink-muted"}`}>
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3 text-sm">
            <span
              className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                accent ? "bg-rust-500" : "bg-ink-light"
              }`}
            />
            <span className={accent ? "text-ink" : "text-ink-muted"}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

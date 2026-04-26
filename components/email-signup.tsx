"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-2xl border border-sage-400/40 bg-sage-400/10 p-5 text-center animate-fade-up">
        <div className="mx-auto h-10 w-10 rounded-full bg-sage-500/20 text-sage-600 grid place-items-center">
          <Check className="h-5 w-5" />
        </div>
        <p className="mt-3 font-display text-xl">You're on the list.</p>
        <p className="mt-1 text-sm text-ink-muted">
          I'll only email when something meaningful ships. No spam — pinky promise.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6 shadow-soft"
    >
      <div className="flex items-center gap-2 text-rust-600">
        <Mail className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.18em] font-medium">
          stay in the loop
        </span>
      </div>
      <h3 className="font-display text-2xl md:text-3xl mt-2 leading-tight">
        Get notified when I ship <span className="italic">new things.</span>
      </h3>
      <p className="mt-2 text-sm text-ink-muted">
        Daily reminders, voice input, and calendar sync are coming. I'll email you
        when they're live. That's it. No newsletter, no spam.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="flex-1 rounded-xl border border-cream-200 bg-cream-100/40 px-4 py-3 text-base placeholder:text-ink-light focus:outline-none focus:border-rust-400"
        />
        <button
          type="submit"
          disabled={!email.trim() || status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink text-cream-50 px-5 py-3 text-sm font-medium hover:bg-rust-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Notify me"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-rust-700">{error}</div>
      )}
    </form>
  );
}

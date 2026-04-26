"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, Check, Loader2, ArrowLeft } from "lucide-react";
import {
  getReminderPref,
  enableReminders,
  disableReminders,
} from "@/lib/reminders";

export default function SettingsPage() {
  const [hydrated, setHydrated] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">(
    "unknown",
  );

  useEffect(() => {
    (async () => {
      const en = (await getReminderPref<boolean>("reminder_enabled")) ?? false;
      const t = (await getReminderPref<string>("reminder_time")) ?? "09:00";
      setEnabled(en);
      setTime(t);
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermission(Notification.permission);
      }
      setHydrated(true);
    })();
  }, []);

  async function handleEnable() {
    setStatus("saving");
    setError(null);
    const result = await enableReminders(time);
    if (!result.ok) {
      setStatus("error");
      setError(result.reason || "Could not enable reminders");
      return;
    }
    setEnabled(true);
    setStatus("saved");
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleDisable() {
    setStatus("saving");
    await disableReminders();
    setEnabled(false);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  async function handleTimeChange(newTime: string) {
    setTime(newTime);
    if (enabled) {
      // Re-enable to update the time
      const result = await enableReminders(newTime);
      if (result.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      }
    }
  }

  return (
    <div className="pt-8 md:pt-14">
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <p className="mt-6 text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
        settings
      </p>
      <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
        Make Unstuck remember <span className="italic text-rust-600">you back.</span>
      </h1>
      <p className="mt-3 text-ink-muted max-w-xl">
        ADHD brains forget things exist between uses. A gentle daily nudge helps.
      </p>

      {/* Reminder card */}
      <div className="mt-8 rounded-2xl border border-cream-200 bg-cream-50 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div
            className={
              "shrink-0 rounded-full p-2.5 " +
              (enabled
                ? "bg-rust-500/10 text-rust-600"
                : "bg-cream-200 text-ink-light")
            }
          >
            {enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl">Daily reminder</h2>
            <p className="text-sm text-ink-muted mt-1">
              {enabled
                ? `On — we'll nudge you at ${formatTime(time)}.`
                : "Off — you won't get any notifications."}
            </p>
          </div>
        </div>

        {hydrated && (
          <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-sm text-ink-muted">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={status === "saving"}
                className="mt-2 w-full rounded-xl border border-cream-200 bg-cream-100/40 px-4 py-3 font-display text-2xl tabular-nums focus:outline-none focus:border-rust-400"
              />
            </div>
            <button
              onClick={enabled ? handleDisable : handleEnable}
              disabled={status === "saving"}
              className={
                "rounded-xl px-5 py-3 text-sm font-medium transition-colors disabled:opacity-50 " +
                (enabled
                  ? "border border-cream-300 text-ink-muted hover:text-ink hover:border-ink-light"
                  : "bg-rust-600 text-cream-50 hover:bg-rust-700")
              }
            >
              {status === "saving" ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : enabled ? (
                "Turn off"
              ) : (
                "Turn on"
              )}
            </button>
          </div>
        )}

        {status === "saved" && (
          <div className="mt-4 flex items-center gap-2 text-sm text-sage-600">
            <Check className="h-4 w-4" />
            Saved
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rust-400/40 bg-rust-400/10 px-4 py-3 text-sm text-rust-700">
            {error}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-cream-200 text-xs text-ink-light leading-relaxed">
          <p>
            Reminders work best when you've added Unstuck to your home screen.
            On iPhone, open this site in Safari → Share → Add to Home Screen.
            On Android, tap your browser's menu → Install app.
          </p>
          {permission === "denied" && (
            <p className="mt-2 text-rust-700">
              Notifications are blocked in your browser. You'll need to allow them
              in site settings before reminders can work.
            </p>
          )}
        </div>
      </div>

      {/* What's coming */}
      <div className="mt-8 rounded-2xl border border-dashed border-cream-300 bg-cream-100/40 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-rust-600 font-medium">
          coming soon
        </p>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rust-500" />
            <span>Voice input — talk instead of type when you're stuck</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rust-500" />
            <span>Calendar sync — pull in important dates as gentle reminders</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rust-500" />
            <span>Multiple reminder times — morning kick-off + afternoon check-in</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function formatTime(t: string) {
  const [hh, mm] = t.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return t;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  const ampm = hh < 12 ? "AM" : "PM";
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

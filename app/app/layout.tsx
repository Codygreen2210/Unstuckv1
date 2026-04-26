"use client";

import { useEffect } from "react";
import { AppNavTop, AppNavBottom } from "@/components/app-nav";
import { registerServiceWorker, pingCheckReminder } from "@/lib/reminders";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register the service worker as soon as the app shell mounts.
    // Then ping it to check if a reminder should fire (covers the case
    // where the user opens the app after their reminder time without
    // having received the periodic-sync notification).
    (async () => {
      await registerServiceWorker();
      await pingCheckReminder();
    })();
  }, []);

  return (
    <div className="min-h-dvh flex flex-col">
      <AppNavTop />
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto max-w-3xl w-full px-5 md:px-6">{children}</div>
      </main>
      <AppNavBottom />
    </div>
  );
}

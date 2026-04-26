// Client-side helpers for the daily reminder system.
// Communicates with the service worker via IndexedDB (shared storage)
// and via postMessage for "check now" pings.

const REMINDER_DB = "unstuck-reminders";

const isBrowser = () => typeof window !== "undefined";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(REMINDER_DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("prefs")) {
        db.createObjectStore("prefs");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getReminderPref<T = unknown>(key: string): Promise<T | undefined> {
  if (!isBrowser() || !("indexedDB" in window)) return undefined;
  try {
    const db = await openDB();
    return new Promise<T | undefined>((resolve) => {
      const tx = db.transaction("prefs", "readonly");
      const store = tx.objectStore("prefs");
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

export async function setReminderPref(key: string, value: unknown): Promise<void> {
  if (!isBrowser() || !("indexedDB" in window)) return;
  try {
    const db = await openDB();
    return new Promise<void>((resolve) => {
      const tx = db.transaction("prefs", "readwrite");
      const store = tx.objectStore("prefs");
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    return;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isBrowser() || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    // Wait until it's active
    if (reg.installing) {
      await new Promise<void>((resolve) => {
        const sw = reg.installing!;
        sw.addEventListener("statechange", () => {
          if (sw.state === "activated") resolve();
        });
      });
    }
    return reg;
  } catch (e) {
    console.error("[sw] register failed", e);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowser() || !("Notification" in window)) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export async function tryEnablePeriodicSync(reg: ServiceWorkerRegistration) {
  // Periodic Background Sync — Chrome Android only, requires installed PWA
  // and granted permission. Will silently fail elsewhere; that's fine because
  // the in-app check on open is our reliable fallback.
  try {
    // @ts-expect-error periodicSync is not in standard types yet
    if (!reg.periodicSync) return false;
    // @ts-expect-error
    const status = await navigator.permissions.query({ name: "periodic-background-sync" });
    if (status.state !== "granted") return false;
    // @ts-expect-error
    await reg.periodicSync.register("unstuck-daily-check", {
      minInterval: 60 * 60 * 1000, // check every hour
    });
    return true;
  } catch {
    return false;
  }
}

export async function pingCheckReminder() {
  if (!isBrowser() || !("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "CHECK_REMINDER" });
  } catch {
    /* fine */
  }
}

// One-shot setup helper used by the settings page
export async function enableReminders(time: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  if (!isBrowser()) return { ok: false, reason: "not in browser" };

  if (!("Notification" in window)) {
    return { ok: false, reason: "Your browser doesn't support notifications" };
  }

  const perm = await requestNotificationPermission();
  if (perm !== "granted") {
    return {
      ok: false,
      reason:
        "Notification permission was denied. You can change this in your browser's site settings.",
    };
  }

  const reg = await registerServiceWorker();
  if (!reg) {
    return { ok: false, reason: "Could not register the reminder helper" };
  }

  await setReminderPref("reminder_enabled", true);
  await setReminderPref("reminder_time", time);

  // Try periodic sync (works on Chrome Android for installed PWAs)
  await tryEnablePeriodicSync(reg);

  return { ok: true };
}

export async function disableReminders() {
  await setReminderPref("reminder_enabled", false);
}

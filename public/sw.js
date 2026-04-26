// Unstuck service worker — handles daily reminders.
//
// Strategy:
// 1. We register the SW from the client.
// 2. The client schedules a check by storing the user's chosen time in IndexedDB.
//    (We use IDB instead of localStorage because SW can't see localStorage.)
// 3. When the SW wakes up (push, periodic sync, or app open), it checks if
//    today's reminder should fire and hasn't yet, then fires it.
// 4. The client also fires a check on every app open as a backup.

const CACHE_NAME = "unstuck-v1";
const REMINDER_DB = "unstuck-reminders";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Open IndexedDB to read reminder prefs (the client writes them here)
function openDB() {
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

async function getPref(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("prefs", "readonly");
      const store = tx.objectStore("prefs");
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

async function setPref(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
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

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function maybeFireReminder() {
  const enabled = await getPref("reminder_enabled");
  if (!enabled) return;

  const time = await getPref("reminder_time"); // "HH:MM"
  if (!time || typeof time !== "string") return;

  const lastFired = await getPref("reminder_last_fired");
  const today = todayKey();
  if (lastFired === today) return; // already fired today

  // Has the chosen time passed today?
  const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return;

  const now = new Date();
  const target = new Date();
  target.setHours(hh, mm, 0, 0);

  if (now < target) return; // not time yet today

  const messages = [
    "Anything getting in the way today?",
    "Even one tiny step counts. Pick one.",
    "What does 'stuck' look like right now?",
    "Hey. The smallest move is still a move.",
    "One task. One timer. That's the whole trick.",
  ];
  const body = messages[Math.floor(Math.random() * messages.length)];

  await self.registration.showNotification("Unstuck", {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "unstuck-daily",
    data: { url: "/app" },
  });

  await setPref("reminder_last_fired", today);
}

// Periodic sync (Chrome Android, registered PWAs only)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "unstuck-daily-check") {
    event.waitUntil(maybeFireReminder());
  }
});

// Fire on tap → open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/app";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Allow the page to ping the SW to check now
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_REMINDER") {
    event.waitUntil(maybeFireReminder());
  }
});

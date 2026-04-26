// Client-only localStorage helpers. All functions are safe to call on the
// server (they return sensible defaults) so pages can mount without blowing up.

export type Task = {
  id: string;
  title: string;
  steps: TaskStep[];
  createdAt: number;
  completedAt?: number;
};

export type TaskStep = {
  id: string;
  text: string;
  done: boolean;
};

export type Stats = {
  streak: number;
  lastActiveDay: string | null; // YYYY-MM-DD
  tasksCompletedToday: number;
  sessionsCompleted: number;
};

export type Prefs = {
  defaultMinutes: 5 | 15 | 25 | 45;
  spiciness: number; // 0..3
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  at: number;
};

const KEYS = {
  tasks: "unstuck.tasks",
  stats: "unstuck.stats",
  prefs: "unstuck.prefs",
  chat: "unstuck.chat",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota errors: swallow — MVP */
  }
}

export function uid() {
  // Small collision-safe-ish id for client-side use
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Tasks ------------------------------------------------------------
export function getTasks(): Task[] {
  return read<Task[]>(KEYS.tasks, []);
}

export function saveTasks(tasks: Task[]) {
  write(KEYS.tasks, tasks);
}

export function addTask(task: Task) {
  const tasks = getTasks();
  tasks.unshift(task);
  saveTasks(tasks);
  return tasks;
}

export function updateTask(id: string, patch: Partial<Task>) {
  const tasks = getTasks().map((t) => (t.id === id ? { ...t, ...patch } : t));
  saveTasks(tasks);
  return tasks;
}

export function toggleStep(taskId: string, stepId: string) {
  const tasks = getTasks().map((t) => {
    if (t.id !== taskId) return t;
    return {
      ...t,
      steps: t.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    };
  });
  saveTasks(tasks);
  return tasks;
}

export function completeTask(id: string) {
  const tasks = getTasks().map((t) =>
    t.id === id ? { ...t, completedAt: Date.now() } : t,
  );
  saveTasks(tasks);
  const stats = getStats();
  stats.tasksCompletedToday += 1;
  saveStats(stats);
  bumpStreak();
  return tasks;
}

export function firstIncompleteTask(): Task | null {
  return getTasks().find((t) => !t.completedAt) ?? null;
}

// Stats ------------------------------------------------------------
const defaultStats: Stats = {
  streak: 0,
  lastActiveDay: null,
  tasksCompletedToday: 0,
  sessionsCompleted: 0,
};

export function getStats(): Stats {
  const stats = read<Stats>(KEYS.stats, defaultStats);
  // Reset tasksCompletedToday at day rollover
  if (stats.lastActiveDay && stats.lastActiveDay !== todayKey()) {
    stats.tasksCompletedToday = 0;
  }
  return stats;
}

export function saveStats(stats: Stats) {
  write(KEYS.stats, stats);
}

export function bumpStreak() {
  const stats = getStats();
  const today = todayKey();
  if (stats.lastActiveDay === today) {
    // already counted today
    saveStats(stats);
    return stats;
  }
  if (stats.lastActiveDay === yesterdayKey()) {
    stats.streak += 1;
  } else {
    stats.streak = 1;
  }
  stats.lastActiveDay = today;
  saveStats(stats);
  return stats;
}

export function incSessions() {
  const stats = getStats();
  stats.sessionsCompleted += 1;
  saveStats(stats);
  bumpStreak();
  return stats;
}

// Prefs ------------------------------------------------------------
const defaultPrefs: Prefs = { defaultMinutes: 25, spiciness: 1 };

export function getPrefs(): Prefs {
  return read<Prefs>(KEYS.prefs, defaultPrefs);
}

export function savePrefs(patch: Partial<Prefs>) {
  const next = { ...getPrefs(), ...patch };
  write(KEYS.prefs, next);
  return next;
}

// Chat ------------------------------------------------------------
export function getChat(): ChatMessage[] {
  return read<ChatMessage[]>(KEYS.chat, []);
}

export function saveChat(msgs: ChatMessage[]) {
  write(KEYS.chat, msgs);
}

export function clearChat() {
  write(KEYS.chat, []);
}

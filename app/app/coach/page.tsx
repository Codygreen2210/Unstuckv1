"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, Leaf } from "lucide-react";
import { clearChat, getChat, saveChat, type ChatMessage } from "@/lib/storage";

const OPENING: ChatMessage = {
  role: "assistant",
  content:
    "Hey. I'm glad you're here. No agenda — we can just sit with whatever's going on. What's on your mind right now?",
  at: 0,
};

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    const saved = getChat();
    if (saved.length === 0) {
      const seeded = [{ ...OPENING, at: Date.now() }];
      setMessages(seeded);
      saveChat(seeded);
    } else {
      setMessages(saved);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);

    const next: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, at: Date.now() },
    ];
    setMessages(next);
    saveChat(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Something went wrong");
      }
      const data = (await res.json()) as { reply: string };
      const after: ChatMessage[] = [
        ...next,
        { role: "assistant", content: data.reply, at: Date.now() },
      ];
      setMessages(after);
      saveChat(after);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function reset() {
    if (!confirm("Start a fresh conversation? This can't be undone.")) return;
    clearChat();
    const seeded = [{ ...OPENING, at: Date.now() }];
    setMessages(seeded);
    saveChat(seeded);
    setError(null);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="pt-6 md:pt-10 flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-rust-600 font-medium">
            body double
          </p>
          <h1 className="font-display text-3xl md:text-4xl mt-2 leading-tight">
            A quiet presence,{" "}
            <span className="italic text-rust-600">always here.</span>
          </h1>
          <p className="mt-2 text-sm text-ink-muted max-w-md">
            Not a coach who lectures. Not a chatbot that cheers. Just someone to think alongside.
          </p>
        </div>
        <button
          onClick={reset}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-cream-300 px-3 py-2 text-xs text-ink-muted hover:text-ink hover:border-ink-light transition-colors"
          aria-label="Reset conversation"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Reset
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 mt-6">
        <ul className="space-y-3">
          {messages.map((m, i) => (
            <li
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {m.role === "assistant" && (
                <div className="shrink-0 mr-2 mt-1 h-8 w-8 rounded-full bg-sage-400/20 text-sage-600 grid place-items-center">
                  <Leaf className="h-4 w-4" />
                </div>
              )}
              <div
                className={
                  "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed animate-fade-up " +
                  (m.role === "user"
                    ? "bg-ink text-cream-50 rounded-br-sm"
                    : "bg-cream-50 border border-cream-200 rounded-bl-sm")
                }
              >
                <div className="whitespace-pre-wrap text-[15px]">{m.content}</div>
              </div>
            </li>
          ))}
          {sending && (
            <li className="flex justify-start">
              <div className="shrink-0 mr-2 mt-1 h-8 w-8 rounded-full bg-sage-400/20 text-sage-600 grid place-items-center">
                <Leaf className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-cream-50 border border-cream-200 px-4 py-3">
                <TypingDots />
              </div>
            </li>
          )}
        </ul>
        {error && (
          <div className="mt-4 rounded-xl border border-rust-400/40 bg-rust-400/10 px-4 py-3 text-sm text-rust-700">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-20 md:bottom-6 mt-6">
        <div className="rounded-2xl border border-cream-200 bg-cream-50 shadow-soft p-2 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Say whatever comes up…"
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed placeholder:text-ink-light focus:outline-none max-h-40"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="shrink-0 rounded-xl bg-rust-600 hover:bg-rust-700 disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 px-4 py-2.5 text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-light">
          Conversations are saved locally on your device. Reset anytime.
        </p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 h-5">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-light animate-pulse-soft" />
      <span className="h-1.5 w-1.5 rounded-full bg-ink-light animate-pulse-soft [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-ink-light animate-pulse-soft [animation-delay:400ms]" />
    </div>
  );
}

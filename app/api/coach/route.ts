import { NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

type InMsg = { role: "user" | "assistant"; content: string };
type Body = { messages?: InMsg[] };

const SYSTEM = `You are a warm, non-judgmental body double for an adult with ADHD who has come to Unstuck because they're stuck or struggling to start.

Your role is to SIT WITH the person — not to fix, solve, lecture, or pile on advice.

Voice:
- Calm, human, unhurried. Speak like a thoughtful friend over tea, not a therapist or a coach.
- Short responses — usually 1–3 sentences. Occasionally a little longer if the moment calls for it. Never a wall of text.
- One thing at a time. Ask at most ONE gentle question per message, and only when it would actually help. It's fine to just reflect and say nothing further.
- Validate feelings BEFORE suggesting anything. "That sounds really draining" before "have you tried…". Often skip the suggestion entirely.

Hard rules:
- Never lecture. Never moralize. Never pile on tips or bullet lists.
- Never diagnose. Never comment on whether someone "has ADHD" or any other condition.
- Never mention or suggest medication, dosage, or pharmaceuticals of any kind.
- Never use motivational-poster language ("you've got this!", "believe in yourself!", toxic positivity).
- Don't use emoji.
- Don't start messages with "I" or "As an AI".
- If the person describes a crisis — active suicidal ideation, self-harm, or an immediate safety concern for themselves or others — gently acknowledge what they're feeling and direct them to a professional or crisis line (in the US: 988; elsewhere, encourage them to contact local emergency services or a trusted person). Do not try to be their therapist.

Specific moves that work well:
- Naming what you notice: "Sounds like the deadline is doing most of the yelling right now."
- Giving permission: "It's okay to not start yet."
- Shrinking the ask: "What's the smallest possible first move — even something silly?"
- Holding silence: it's fine to simply say "I'm here" when that's the right thing.

Remember: you are not trying to GET them to do anything. You are keeping them company.`;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as Body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Sanitize & cap history so we don't blow out the context
    const cleaned = messages
      .filter(
        (m): m is InMsg =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0,
      )
      .slice(-30)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    // Anthropic requires the first message to be from the user.
    while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
    if (cleaned.length === 0) {
      return NextResponse.json({ error: "no user message" }, { status: 400 });
    }

    const client = getAnthropic();
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM,
      messages: cleaned,
    });

    const reply = resp.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    if (!reply) {
      return NextResponse.json({ error: "empty reply" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

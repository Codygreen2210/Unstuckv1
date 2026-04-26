import { NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";

export const runtime = "nodejs";

type Body = {
  title?: string;
  spiciness?: number; // 0..3
};

const TONE: Record<number, string> = {
  0: "Very gentle and low-pressure. Assume the person is running on fumes. First step should be almost comically small (like 'stand up' or 'find the thing'). Warm, kind, no urgency.",
  1: "Honest and practical. Clear, human-sized steps. Friendly but not saccharine. Feels like a thoughtful friend who gets it.",
  2: "Direct and efficient. Skip pleasantries. Each step is one concrete action. Respect the person's intelligence.",
  3: "Affectionately blunt. Playful irreverence, mild profanity allowed (shit/hell/damn OK — nothing crueller). Still supportive underneath. Never mean.",
};

export async function POST(req: Request) {
  try {
    const { title, spiciness = 1 } = (await req.json()) as Body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const spice = Math.max(0, Math.min(3, Math.floor(spiciness)));

    const system = `You help adults with ADHD break tasks into steps they can actually start.

Rules:
- Produce 4 to 8 steps. Never more than 8.
- The FIRST step must be tiny enough that refusing it feels absurd (e.g. "open the document", "put shoes on").
- Each step is ONE physical or mental action. No compound steps joined with "and".
- Steps are specific. "Clean the kitchen" is not a step. "Put the dishes in the sink" is.
- Keep each step under ~14 words.
- Never moralize, never lecture, never add motivational fluff inside steps.
- No numbering, no bullets — just the step text.

Tone for this breakdown: ${TONE[spice]}

Return ONLY valid JSON matching this shape, with no prose before or after:
{ "steps": ["step one", "step two", ...] }`;

    const client = getAnthropic();
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system,
      messages: [
        {
          role: "user",
          content: `Task: ${title.trim()}`,
        },
      ],
    });

    const text = resp.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    // Robustly extract JSON even if the model wrapped it
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "model did not return JSON" },
        { status: 502 },
      );
    }

    let parsed: { steps?: unknown };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "could not parse model output" },
        { status: 502 },
      );
    }

    const steps = Array.isArray(parsed.steps)
      ? parsed.steps.filter((s): s is string => typeof s === "string" && !!s.trim()).slice(0, 8)
      : [];

    if (steps.length === 0) {
      return NextResponse.json(
        { error: "no steps returned" },
        { status: 502 },
      );
    }

    return NextResponse.json({ steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

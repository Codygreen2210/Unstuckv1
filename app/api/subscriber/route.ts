import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { email?: string };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 200;
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as Body;
    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    const clean = email.trim().toLowerCase();

    // If Vercel KV env vars are present, store there. Otherwise, just log.
    // This way the form works even before you set up KV — you'll see emails
    // in your Vercel deployment logs.
    const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

    if (hasKV) {
      try {
        // Lazy import so this works even when @vercel/kv isn't installed yet
        const { kv } = await import("@vercel/kv");
        await kv.sadd("unstuck:emails", clean);
        await kv.hset(`unstuck:email:${clean}`, {
          email: clean,
          createdAt: Date.now(),
          source: "landing",
        });
      } catch (e) {
        // KV import or call failed — fall through to logging
        console.error("[subscribe] KV error:", e);
      }
    }

    // Always log so you can see it in Vercel function logs as a backup
    console.log(`[subscribe] new email: ${clean}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Optional: GET endpoint to retrieve all emails (protected by a query token)
// so you can pull them out without going to the KV dashboard
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
  if (!hasKV) {
    return NextResponse.json({ error: "KV not configured" }, { status: 503 });
  }

  try {
    const { kv } = await import("@vercel/kv");
    const emails = await kv.smembers("unstuck:emails");
    return NextResponse.json({ count: emails.length, emails });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

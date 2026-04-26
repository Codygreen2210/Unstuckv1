import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (local) or to your Vercel project's environment variables.",
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export const MODEL = "claude-sonnet-4-5";

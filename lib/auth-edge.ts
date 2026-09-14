// Edge-safe (Web Crypto) helpers so the same logic works in both
// middleware (edge runtime) and server actions (node runtime).

const SESSION_COOKIE = "routine_session";
const SESSION_MESSAGE = "authenticated";

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Buffer.from(signature).toString("hex");
}

function getSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw new Error("Missing APP_SECRET environment variable.");
  }
  return secret;
}

export async function expectedSessionValue(): Promise<string> {
  return hmac(getSecret(), SESSION_MESSAGE);
}

export async function isValidSession(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const expected = await expectedSessionValue();
  return timingSafeEqual(value, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export { SESSION_COOKIE };

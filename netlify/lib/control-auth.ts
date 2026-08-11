import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "pracht_control_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

type SessionPayload = { exp: number; scope: "admin" };

function secret() {
  return process.env.CONTROL_SESSION_SECRET ?? "";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  return cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function controlIsConfigured() {
  return Boolean(process.env.CONTROL_ADMIN_PASSWORD && secret());
}

export function passwordMatches(value: string) {
  const expected = process.env.CONTROL_ADMIN_PASSWORD ?? "";
  if (!expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function createSessionCookie() {
  const payload = encode(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000, scope: "admin" } satisfies SessionPayload));
  const token = `${payload}.${signature(payload)}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function hasControlSession(request: Request) {
  if (!controlIsConfigured()) return false;
  const token = cookieValue(request, COOKIE_NAME);
  if (!token) return false;
  const [payload, receivedSignature] = token.split(".");
  if (!payload || !receivedSignature) return false;
  const expectedSignature = signature(payload);
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) return false;
  try {
    const session = JSON.parse(decode(payload)) as SessionPayload;
    return session.scope === "admin" && session.exp > Date.now();
  } catch {
    return false;
  }
}

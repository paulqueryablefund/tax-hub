import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Team gate, not authentication: one shared credential lets the firm's own
 * people in. It has nothing to do with the demonstration identity the product
 * shows (Miriam Radtke and colleagues), which is unchanged.
 */
export type GateSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env.SESSION_SECRET!,
    name: "taxhub-gate",
    maxAge: 60 * 60 * 24 * 30,
    // SameSite=None so the cookie also works when the workspace is viewed
    // inside the preview iframe (a third-party context in the browser's eyes).
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

export function getGateSession() {
  return useSession<GateSession>(sessionConfig());
}

/** Equal-length digests first: timingSafeEqual throws on a length mismatch. */
function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function credentialsMatch(email: string, password: string): boolean {
  const expectedEmail = process.env.SITE_EMAIL;
  const expectedPassword = process.env.SITE_PASSWORD;
  if (!expectedEmail || !expectedPassword) throw new Error("Site gate is not configured");
  const emailOk = matches(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = matches(password, expectedPassword);
  return emailOk && passwordOk;
}

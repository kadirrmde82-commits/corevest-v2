// Local email/password authentication
import { createHash, randomBytes } from "crypto";
import * as cookie from "cookie";
import * as jose from "jose";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.APP_SECRET || "corevest-local-auth-secret-key-2024"
);

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return hash === check;
}

export async function signLocalToken(userId: number): Promise<string> {
  return new jose.SignJWT({ userId, type: "local" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET_KEY);
}

export async function verifyLocalToken(
  token: string
): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET_KEY, {
      clockTolerance: 60,
    });
    if (payload.type !== "local" || typeof payload.userId !== "number") {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies["local_session"];
  if (!token) return null;

  const claim = await verifyLocalToken(token);
  if (!claim) return null;

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, claim.userId),
  });
  return user || null;
}

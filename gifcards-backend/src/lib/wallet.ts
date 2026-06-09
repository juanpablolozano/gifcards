import { SignJWT, jwtVerify } from "jose";

export async function createWalletToken(
  secret: string,
  email: string,
  expiresInHours = 24,
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ email, purpose: "wallet" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiresInHours}h`)
    .sign(key);
}

export async function verifyWalletToken(
  secret: string,
  token: string,
): Promise<{ email: string } | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    if (payload.purpose !== "wallet" || typeof payload.email !== "string") {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}

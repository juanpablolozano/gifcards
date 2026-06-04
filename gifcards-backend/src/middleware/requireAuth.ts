import { createMiddleware } from "hono/factory";
import type { Env } from "../env";
import { verifyIdToken, type VerifiedFirebaseToken } from "../lib/firebaseAuth";

export type AuthVariables = {
  auth: VerifiedFirebaseToken;
};

export const requireAuth = createMiddleware<{
  Bindings: Env;
  Variables: AuthVariables;
}>(async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ error: "missing_token" }, 401);
  }

  const idToken = authorization.slice("Bearer ".length).trim();
  if (!idToken) {
    return c.json({ error: "missing_token" }, 401);
  }

  try {
    const auth = await verifyIdToken(idToken, c.env.FIREBASE_PROJECT_ID);
    c.set("auth", auth);
    await next();
  } catch {
    return c.json({ error: "invalid_token" }, 401);
  }
});

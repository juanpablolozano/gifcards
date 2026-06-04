import { Hono } from "hono";
import type { Env } from "../env";
import { getMerchantByUid } from "../lib/firestore";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import type { SessionResponse } from "../types/merchant";

const authRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

authRoutes.get("/session", requireAuth, async (c) => {
  const { uid, email } = c.get("auth");

  try {
    const merchant = await getMerchantByUid(
      c.env.FIREBASE_PROJECT_ID,
      c.env.FIREBASE_SERVICE_ACCOUNT,
      uid,
    );

    const response: SessionResponse = {
      user: { uid, email },
      merchant,
    };

    return c.json(response);
  } catch {
    return c.json({ error: "session_lookup_failed" }, 500);
  }
});

export default authRoutes;

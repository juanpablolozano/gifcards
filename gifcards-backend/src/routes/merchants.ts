import { Hono } from "hono";
import type { Env } from "../env";
import { createMerchantBootstrap } from "../lib/firestore";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import type { CreateMerchantRequest } from "../types/merchant";

const merchantRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

merchantRoutes.post("/", requireAuth, async (c) => {
  const { uid, email } = c.get("auth");

  let body: CreateMerchantRequest = {};
  try {
    body = await c.req.json<CreateMerchantRequest>();
  } catch {
    body = {};
  }

  const preferredLanguage =
    body.preferredLanguage === "es" ? "es" : "en";

  try {
    const { merchant, created } = await createMerchantBootstrap(
      c.env.FIREBASE_PROJECT_ID,
      c.env.FIREBASE_SERVICE_ACCOUNT,
      {
        uid,
        email,
        displayName: body.displayName?.trim() || undefined,
        preferredLanguage,
        acceptedTermsAt: body.acceptedTermsAt,
      },
    );

    return c.json(merchant, created ? 201 : 200);
  } catch {
    return c.json({ error: "merchant_bootstrap_failed" }, 500);
  }
});

export default merchantRoutes;

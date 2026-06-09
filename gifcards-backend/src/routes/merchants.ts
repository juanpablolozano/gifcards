import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import {
  createMerchantBootstrap,
  getMerchantProfile,
  isSlugAvailable,
  updateMerchant,
} from "../lib/firestore/merchants";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import { updateMerchantSchema } from "../schemas";
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

  const preferredLanguage = body.preferredLanguage === "es" ? "es" : "en";

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

merchantRoutes.patch("/:id", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const merchantId = c.req.param("id");

  if (merchantId !== uid) {
    return c.json({ error: "forbidden" }, 403);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateMerchantSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const ctx = getFirestoreContext(c.env);

  if (parsed.data.slug) {
    const available = await isSlugAvailable(ctx, parsed.data.slug, uid);
    if (!available) {
      return c.json({ error: "slug_taken" }, 409);
    }
  }

  try {
    const merchant = await updateMerchant(ctx, uid, parsed.data);
    return c.json(merchant);
  } catch {
    return c.json({ error: "merchant_update_failed" }, 500);
  }
});

merchantRoutes.get("/:id/payments", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const merchantId = c.req.param("id");

  if (merchantId !== uid) {
    return c.json({ error: "forbidden" }, 403);
  }

  return c.json({
    mode: "test",
    enabled: Boolean(c.env.STRIPE_SECRET_KEY),
    stripeConnectAvailable: false,
    payoutsEnabled: false,
    requirementsDue: [],
    message: "Payments are processed via platform Stripe account in test mode.",
  });
});

merchantRoutes.get("/slug/:slug/availability", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const slug = c.req.param("slug");
  const ctx = getFirestoreContext(c.env);

  try {
    const available = await isSlugAvailable(ctx, slug, uid);
    return c.json({ slug, available });
  } catch {
    return c.json({ error: "slug_check_failed" }, 500);
  }
});

merchantRoutes.get("/:id", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const merchantId = c.req.param("id");

  if (merchantId !== uid) {
    return c.json({ error: "forbidden" }, 403);
  }

  const ctx = getFirestoreContext(c.env);
  const profile = await getMerchantProfile(ctx, uid);
  if (!profile) return c.json({ error: "not_found" }, 404);
  return c.json(profile);
});

export default merchantRoutes;

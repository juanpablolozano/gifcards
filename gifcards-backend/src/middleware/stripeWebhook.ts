import { createMiddleware } from "hono/factory";
import type { Env } from "../env";
import { verifyStripeWebhook } from "../lib/stripe";

export type StripeWebhookVariables = {
  stripeEvent: { type: string; id: string; data: Record<string, unknown> };
};

export const stripeWebhookMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: StripeWebhookVariables;
}>(async (c, next) => {
  const signature = c.req.header("stripe-signature");
  const secret = c.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return c.json({ error: "missing_stripe_signature" }, 400);
  }

  const payload = await c.req.text();

  try {
    const event = await verifyStripeWebhook(payload, signature, secret);
    c.set("stripeEvent", event);
    await next();
  } catch {
    return c.json({ error: "invalid_stripe_signature" }, 400);
  }
});

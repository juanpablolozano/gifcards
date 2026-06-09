import { Hono } from "hono";
import type { Env } from "../env";
import { generateId } from "../lib/codes";
import { getFirestoreContext, getAppUrl } from "../lib/context";
import { getGiftCard } from "../lib/firestore/giftCards";
import { getMerchantBySlug } from "../lib/firestore/merchants";
import {
  createPaymentSession,
  getPaymentSession,
} from "../lib/firestore/paymentSessions";
import { createStripeCheckoutSession } from "../lib/stripe";
import { checkoutSessionSchema } from "../schemas";

const checkoutRoutes = new Hono<{ Bindings: Env }>();

checkoutRoutes.post("/sessions", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = checkoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const ctx = getFirestoreContext(c.env);
  const appUrl = getAppUrl(c.env);

  try {
    const merchant = await getMerchantBySlug(ctx, parsed.data.merchantSlug);
    if (!merchant) return c.json({ error: "merchant_not_found" }, 404);

    const card = await getGiftCard(ctx, parsed.data.giftCardId);
    if (!card || card.merchantId !== merchant.id || card.status !== "active") {
      return c.json({ error: "gift_card_not_found" }, 404);
    }

    if (card.valueType === "fixed" && card.fixedAmount && parsed.data.amount !== card.fixedAmount) {
      return c.json({ error: "invalid_amount" }, 400);
    }
    if (card.valueType === "variable") {
      const min = card.minAmount ?? 0;
      const max = card.maxAmount ?? Infinity;
      if (parsed.data.amount < min || parsed.data.amount > max) {
        return c.json({ error: "invalid_amount" }, 400);
      }
    }

    const sessionId = generateId();
    const session = await createPaymentSession(ctx, {
      id: sessionId,
      merchantId: merchant.id,
      giftCardId: card.id,
      giftCardName: card.name,
      merchantSlug: parsed.data.merchantSlug,
      amount: parsed.data.amount,
      buyerEmail: parsed.data.buyerEmail,
      isGift: parsed.data.isGift ?? false,
      recipientEmail: parsed.data.recipientEmail,
      recipientName: parsed.data.recipientName,
      giftMessage: parsed.data.giftMessage,
    });

    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: "stripe_not_configured" }, 503);
    }

    const stripeSession = await createStripeCheckoutSession(c.env.STRIPE_SECRET_KEY, {
      amountCents: Math.round(parsed.data.amount * 100),
      currency: card.currency,
      successUrl: `${appUrl}/checkout/success?session_id=${sessionId}`,
      cancelUrl: `${appUrl}/checkout?cancelled=1`,
      customerEmail: parsed.data.buyerEmail,
      metadata: {
        paymentSessionId: sessionId,
        giftCardId: card.id,
        merchantId: merchant.id,
      },
    });

    return c.json({
      sessionId: session.id,
      stripeSessionId: stripeSession.id,
      checkoutUrl: stripeSession.url,
    }, 201);
  } catch {
    return c.json({ error: "checkout_session_failed" }, 500);
  }
});

checkoutRoutes.get("/sessions/:id", async (c) => {
  const id = c.req.param("id");
  const ctx = getFirestoreContext(c.env);

  try {
    const session = await getPaymentSession(ctx, id);
    if (!session) return c.json({ error: "not_found" }, 404);

    return c.json({
      id: session.id,
      status: session.status,
      amount: session.amount,
      giftCardName: session.giftCardName,
      issuedCardToken: session.issuedCardToken,
      emailSent: session.emailSent,
    });
  } catch {
    return c.json({ error: "session_lookup_failed" }, 500);
  }
});

export default checkoutRoutes;

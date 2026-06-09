import { Hono } from "hono";
import type { Env } from "../env";
import { generateGiftCode, generateId, generateToken } from "../lib/codes";
import { getFirestoreContext, getAppUrl } from "../lib/context";
import { sendGiftCardEmail } from "../lib/beely";
import { getGiftCard, incrementGiftCardSales } from "../lib/firestore/giftCards";
import { mintIssuedCard } from "../lib/firestore/issuedCards";
import { getMerchantProfile } from "../lib/firestore/merchants";
import { completePaymentSession, getPaymentSession } from "../lib/firestore/paymentSessions";
import { createTransaction } from "../lib/firestore/transactions";
import { isWebhookProcessed, markWebhookProcessed } from "../lib/firestore/webhookEvents";
import { stripeWebhookMiddleware } from "../middleware/stripeWebhook";

const webhookRoutes = new Hono<{ Bindings: Env }>();

webhookRoutes.post("/stripe", stripeWebhookMiddleware, async (c) => {
  const event = c.get("stripeEvent");
  const ctx = getFirestoreContext(c.env);
  const appUrl = getAppUrl(c.env);

  if (await isWebhookProcessed(ctx, event.id)) {
    return c.json({ received: true });
  }

  if (event.type !== "checkout.session.completed") {
    await markWebhookProcessed(ctx, event.id, event.type);
    return c.json({ received: true });
  }

  const metadata = (event.data.metadata ?? {}) as Record<string, string>;
  const paymentSessionId = metadata.paymentSessionId;
  const stripeSessionId = String(event.data.id ?? "");

  if (!paymentSessionId) {
    return c.json({ error: "missing_metadata" }, 400);
  }

  try {
    const session = await getPaymentSession(ctx, paymentSessionId);
    if (!session || session.status === "completed") {
      await markWebhookProcessed(ctx, event.id, event.type);
      return c.json({ received: true });
    }

    const issuedCardId = generateId();
    const token = generateToken();
    const code = generateGiftCode();

    const deliveryEmail = session.isGift && session.recipientEmail
      ? session.recipientEmail
      : session.buyerEmail;

    await mintIssuedCard(ctx, {
      id: issuedCardId,
      token,
      code,
      giftCardId: session.giftCardId,
      merchantId: session.merchantId,
      amount: session.amount,
      currency: "USD",
      ownerEmail: session.buyerEmail,
      recipientEmail: session.recipientEmail ?? undefined,
      giftMessage: session.giftMessage ?? undefined,
      paymentSessionId: session.id,
      appUrl,
    });

    const card = await getGiftCard(ctx, session.giftCardId);
    const merchant = await getMerchantProfile(ctx, session.merchantId);

    await createTransaction(ctx, {
      id: generateId(),
      type: "purchase",
      amount: session.amount,
      merchantId: session.merchantId,
      giftCardId: session.giftCardId,
      giftCardName: card?.name ?? session.giftCardName,
      issuedCardId,
      customerEmail: session.buyerEmail,
      code,
    });

    await incrementGiftCardSales(ctx, session.giftCardId, session.amount);

    const viewGiftUrl = `${appUrl}/gift/${token}`;
    let emailSent = false;
    if (c.env.BEELY_API_KEY) {
      emailSent = await sendGiftCardEmail(c.env.BEELY_API_KEY, {
        to: deliveryEmail,
        merchantName: merchant?.businessName ?? "Merchant",
        amount: `$${session.amount.toFixed(2)}`,
        viewGiftUrl,
        giftMessage: session.giftMessage ?? undefined,
      });
    }

    await completePaymentSession(ctx, paymentSessionId, {
      stripeSessionId,
      issuedCardId,
      issuedCardToken: token,
      emailSent,
    });

    await markWebhookProcessed(ctx, event.id, event.type);
    return c.json({ received: true });
  } catch {
    return c.json({ error: "webhook_processing_failed" }, 500);
  }
});

export default webhookRoutes;

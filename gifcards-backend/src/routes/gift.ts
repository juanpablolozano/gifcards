import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import { getGiftCard } from "../lib/firestore/giftCards";
import { getIssuedCardByToken } from "../lib/firestore/issuedCards";
import { getMerchantProfile } from "../lib/firestore/merchants";
import { listTransactionsByIssuedCard } from "../lib/firestore/transactions";

const giftRoutes = new Hono<{ Bindings: Env }>();

giftRoutes.get("/:token", async (c) => {
  const token = c.req.param("token");
  const ctx = getFirestoreContext(c.env);

  try {
    const issued = await getIssuedCardByToken(ctx, token);
    if (!issued) return c.json({ error: "not_found" }, 404);

    const [card, merchant, history] = await Promise.all([
      getGiftCard(ctx, issued.giftCardId),
      getMerchantProfile(ctx, issued.merchantId),
      listTransactionsByIssuedCard(ctx, issued.id),
    ]);

    return c.json({
      issuedCard: {
        id: issued.id,
        token: issued.token,
        code: issued.code,
        balance: issued.balance,
        initialAmount: issued.initialAmount,
        currency: issued.currency,
        status: issued.status,
        giftMessage: issued.giftMessage,
        createdAt: issued.createdAt,
      },
      giftCard: card
        ? { id: card.id, name: card.name, message: card.message }
        : null,
      merchant: merchant
        ? {
            businessName: merchant.businessName,
            logoUrl: merchant.logoUrl,
            primaryColor: merchant.primaryColor ?? "#111827",
            secondaryColor: merchant.secondaryColor ?? "#4F46E5",
            contactEmail: merchant.contactEmail,
          }
        : null,
      history: history.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        createdAt: t.createdAt,
      })),
    });
  } catch {
    return c.json({ error: "gift_lookup_failed" }, 500);
  }
});

export default giftRoutes;

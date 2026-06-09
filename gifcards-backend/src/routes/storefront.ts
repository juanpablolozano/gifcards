import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import { getGiftCard, listGiftCards } from "../lib/firestore/giftCards";
import { getMerchantBySlug } from "../lib/firestore/merchants";

const storefrontRoutes = new Hono<{ Bindings: Env }>();

storefrontRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const ctx = getFirestoreContext(c.env);

  try {
    const merchant = await getMerchantBySlug(ctx, slug);
    if (!merchant || merchant.status !== "active") {
      return c.json({ error: "not_found" }, 404);
    }

    const giftCards = (await listGiftCards(ctx, merchant.id, "active")).map((card) => ({
      id: card.id,
      name: card.name,
      valueType: card.valueType,
      fixedAmount: card.fixedAmount,
      minAmount: card.minAmount,
      maxAmount: card.maxAmount,
      currency: card.currency,
      message: card.message,
      publicUrl: card.publicUrl,
    }));

    return c.json({
      merchant: {
        id: merchant.id,
        slug: merchant.slug,
        businessName: merchant.businessName,
        logoUrl: merchant.logoUrl,
        primaryColor: merchant.primaryColor ?? "#111827",
        secondaryColor: merchant.secondaryColor ?? "#4F46E5",
        contactEmail: merchant.contactEmail,
      },
      giftCards,
    });
  } catch {
    return c.json({ error: "storefront_failed" }, 500);
  }
});

storefrontRoutes.get("/:slug/cards/:cardId", async (c) => {
  const slug = c.req.param("slug");
  const cardId = c.req.param("cardId");
  const ctx = getFirestoreContext(c.env);

  try {
    const merchant = await getMerchantBySlug(ctx, slug);
    if (!merchant) return c.json({ error: "not_found" }, 404);

    const card = await getGiftCard(ctx, cardId);
    if (!card || card.merchantId !== merchant.id || card.status !== "active") {
      return c.json({ error: "not_found" }, 404);
    }

    return c.json({
      merchant: {
        slug: merchant.slug,
        businessName: merchant.businessName,
        logoUrl: merchant.logoUrl,
        primaryColor: merchant.primaryColor ?? "#111827",
        secondaryColor: merchant.secondaryColor ?? "#4F46E5",
      },
      giftCard: card,
    });
  } catch {
    return c.json({ error: "storefront_card_failed" }, 500);
  }
});

export default storefrontRoutes;

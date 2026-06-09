import { Hono } from "hono";
import type { Env } from "../env";
import { generateId } from "../lib/codes";
import { getFirestoreContext, getAppUrl } from "../lib/context";
import {
  createGiftCard,
  getGiftCard,
  listGiftCards,
  updateGiftCard,
} from "../lib/firestore/giftCards";
import { getMerchantByUid } from "../lib/firestore/merchants";
import { listTransactions } from "../lib/firestore/transactions";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import { createGiftCardSchema, updateGiftCardSchema } from "../schemas";

const giftCardRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

giftCardRoutes.post("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const body = await c.req.json().catch(() => null);
  const parsed = createGiftCardSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const merchant = await getMerchantByUid(
    c.env.FIREBASE_PROJECT_ID,
    c.env.FIREBASE_SERVICE_ACCOUNT,
    uid,
  );
  if (!merchant?.slug) {
    return c.json({ error: "onboarding_required" }, 400);
  }

  const ctx = getFirestoreContext(c.env);
  const cardId = generateId();

  try {
    const card = await createGiftCard(
      ctx,
      uid,
      merchant.slug,
      cardId,
      parsed.data,
      getAppUrl(c.env),
    );
    return c.json(card, 201);
  } catch {
    return c.json({ error: "gift_card_create_failed" }, 500);
  }
});

giftCardRoutes.get("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const status = c.req.query("status") as "active" | "paused" | "draft" | "archived" | undefined;
  const ctx = getFirestoreContext(c.env);

  try {
    const cards = await listGiftCards(ctx, uid, status);
    return c.json({ items: cards });
  } catch {
    return c.json({ error: "gift_cards_list_failed" }, 500);
  }
});

giftCardRoutes.get("/:id", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const cardId = c.req.param("id");
  const ctx = getFirestoreContext(c.env);

  try {
    const card = await getGiftCard(ctx, cardId);
    if (!card || card.merchantId !== uid) {
      return c.json({ error: "not_found" }, 404);
    }

    const transactions = await listTransactions(ctx, {
      merchantId: uid,
      giftCardId: cardId,
      limit: 20,
    });

    const soldCount = card.salesCount;
    const redeemedAmount = transactions
      .filter((t) => t.type === "redemption")
      .reduce((sum, t) => sum + t.amount, 0);

    return c.json({
      ...card,
      metrics: {
        soldCount,
        redeemedAmount,
        outstandingBalance: card.totalRevenue - redeemedAmount,
      },
      transactions,
    });
  } catch {
    return c.json({ error: "gift_card_get_failed" }, 500);
  }
});

giftCardRoutes.patch("/:id", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const cardId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateGiftCardSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const ctx = getFirestoreContext(c.env);
  const existing = await getGiftCard(ctx, cardId);
  if (!existing || existing.merchantId !== uid) {
    return c.json({ error: "not_found" }, 404);
  }

  try {
    const card = await updateGiftCard(ctx, cardId, parsed.data, existing);
    return c.json(card);
  } catch (e) {
    if (e instanceof Error && e.message === "cannot_change_amounts_after_sales") {
      return c.json({ error: "cannot_change_amounts_after_sales" }, 400);
    }
    return c.json({ error: "gift_card_update_failed" }, 500);
  }
});

export default giftCardRoutes;

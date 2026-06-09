import { Hono } from "hono";
import type { Env } from "../env";
import { generateId } from "../lib/codes";
import { getFirestoreContext } from "../lib/context";
import { getGiftCard } from "../lib/firestore/giftCards";
import {
  getIssuedCardByCode,
  getIssuedCardById,
  updateIssuedCardBalance,
} from "../lib/firestore/issuedCards";
import { createTransaction } from "../lib/firestore/transactions";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import { redeemSchema } from "../schemas";
import type { IssuedCardStatus } from "../types/issuedCard";

const redeemRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

redeemRoutes.get("/validate", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const code = c.req.query("code")?.trim();
  if (!code) return c.json({ error: "missing_code" }, 400);

  const ctx = getFirestoreContext(c.env);

  try {
    const issued = await getIssuedCardByCode(ctx, code);
    if (!issued || issued.merchantId !== uid) {
      return c.json({ valid: false, errorCode: "not_found" });
    }

    if (!["active", "partially_redeemed"].includes(issued.status)) {
      return c.json({
        valid: false,
        errorCode: issued.status === "redeemed" ? "already_redeemed" : "invalid_status",
        balance: issued.balance,
        status: issued.status,
      });
    }

    const card = await getGiftCard(ctx, issued.giftCardId);

    return c.json({
      valid: true,
      issuedCardId: issued.id,
      code: issued.code,
      balance: issued.balance,
      status: issued.status,
      giftCardName: card?.name ?? null,
      currency: issued.currency,
    });
  } catch {
    return c.json({ error: "validation_failed" }, 500);
  }
});

redeemRoutes.post("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const body = await c.req.json().catch(() => null);
  const parsed = redeemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const ctx = getFirestoreContext(c.env);

  try {
    const issued = await getIssuedCardById(ctx, parsed.data.issuedCardId);
    if (!issued || issued.merchantId !== uid) {
      return c.json({ error: "not_found" }, 404);
    }

    if (!["active", "partially_redeemed"].includes(issued.status)) {
      return c.json({ error: "invalid_status" }, 400);
    }

    if (parsed.data.amount > issued.balance) {
      return c.json({ error: "insufficient_balance" }, 400);
    }

    const newBalance = Math.round((issued.balance - parsed.data.amount) * 100) / 100;
    const newStatus: IssuedCardStatus = newBalance === 0 ? "redeemed" : "partially_redeemed";

    const updated = await updateIssuedCardBalance(
      ctx,
      issued.id,
      newBalance,
      newStatus,
    );

    const card = await getGiftCard(ctx, issued.giftCardId);
    const transactionId = generateId();

    await createTransaction(ctx, {
      id: transactionId,
      type: "redemption",
      amount: parsed.data.amount,
      merchantId: uid,
      giftCardId: issued.giftCardId,
      giftCardName: card?.name,
      issuedCardId: issued.id,
      code: issued.code,
      performedByUserId: uid,
      notes: parsed.data.notes,
    });

    return c.json({
      transactionId,
      newBalance: updated.balance,
      status: updated.status,
      redeemedAt: new Date().toISOString(),
    });
  } catch {
    return c.json({ error: "redemption_failed" }, 500);
  }
});

export default redeemRoutes;

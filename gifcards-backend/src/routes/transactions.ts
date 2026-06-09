import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import { listTransactions } from "../lib/firestore/transactions";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import type { TransactionType } from "../types/transaction";

const transactionRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

transactionRoutes.get("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const type = c.req.query("type") as TransactionType | undefined;
  const giftCardId = c.req.query("giftCardId");
  const limit = Number(c.req.query("limit") ?? "50");
  const ctx = getFirestoreContext(c.env);

  try {
    const items = await listTransactions(ctx, {
      merchantId: uid,
      type,
      giftCardId: giftCardId ?? undefined,
      limit: Math.min(limit, 100),
    });
    return c.json({ items, total: items.length });
  } catch {
    return c.json({ error: "transactions_failed" }, 500);
  }
});

export default transactionRoutes;

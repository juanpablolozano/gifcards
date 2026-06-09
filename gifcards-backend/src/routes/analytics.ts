import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import { listTransactions } from "../lib/firestore/transactions";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";

const analyticsRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

analyticsRoutes.get("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const days = Number(c.req.query("days") ?? "30");
  const giftCardId = c.req.query("giftCardId");
  const ctx = getFirestoreContext(c.env);

  try {
    const transactions = await listTransactions(ctx, {
      merchantId: uid,
      giftCardId: giftCardId ?? undefined,
      limit: 500,
    });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const byDate = new Map<string, { salesAmount: number; redemptionAmount: number }>();

    for (const t of transactions) {
      const date = t.createdAt.slice(0, 10);
      const entry = byDate.get(date) ?? { salesAmount: 0, redemptionAmount: 0 };
      if (new Date(t.createdAt) < cutoff) continue;
      if (t.type === "purchase") entry.salesAmount += t.amount;
      if (t.type === "redemption") entry.redemptionAmount += t.amount;
      byDate.set(date, entry);
    }

    const series = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    const totalSales = series.reduce((s, d) => s + d.salesAmount, 0);
    const totalRedemptions = series.reduce((s, d) => s + d.redemptionAmount, 0);

    return c.json({
      series,
      totals: {
        totalSales,
        totalRedemptions,
        netOutstanding: totalSales - totalRedemptions,
      },
    });
  } catch {
    return c.json({ error: "analytics_failed" }, 500);
  }
});

export default analyticsRoutes;

import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext } from "../lib/context";
import { listGiftCards } from "../lib/firestore/giftCards";
import { getMerchantByUid } from "../lib/firestore/merchants";
import { listTransactions } from "../lib/firestore/transactions";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";

const dashboardRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

dashboardRoutes.get("/", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const ctx = getFirestoreContext(c.env);

  try {
    const [merchant, transactions, giftCards] = await Promise.all([
      getMerchantByUid(c.env.FIREBASE_PROJECT_ID, c.env.FIREBASE_SERVICE_ACCOUNT, uid),
      listTransactions(ctx, { merchantId: uid, limit: 200 }),
      listGiftCards(ctx, uid),
    ]);

    const purchases = transactions.filter((t) => t.type === "purchase");
    const redemptions = transactions.filter((t) => t.type === "redemption");

    const totalSales = purchases.reduce((s, t) => s + t.amount, 0);
    const totalRedemptions = redemptions.reduce((s, t) => s + t.amount, 0);
    const outstandingBalance = totalSales - totalRedemptions;

    const hasPublishedCard = giftCards.some((g) => g.status === "active");

    return c.json({
      merchant,
      kpis: {
        totalSales,
        totalRedemptions,
        outstandingBalance,
        salesTrend: 12.5,
        redemptionsTrend: 4.2,
      },
      recentActivity: transactions.slice(0, 5).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        giftCardName: t.giftCardName,
        createdAt: t.createdAt,
        status: t.status,
      })),
      onboardingChecklist: {
        accountCreated: true,
        profileCompleted: merchant?.onboardingCompleted ?? false,
        firstGiftCardPublished: hasPublishedCard,
      },
      giftCardsCount: giftCards.length,
      hasPublishedCard,
    });
  } catch {
    return c.json({ error: "dashboard_failed" }, 500);
  }
});

export default dashboardRoutes;

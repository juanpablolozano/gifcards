import { Hono } from "hono";
import type { Env } from "../env";
import { getFirestoreContext, getAppUrl } from "../lib/context";
import { getGiftCard } from "../lib/firestore/giftCards";
import { listIssuedCardsByEmail } from "../lib/firestore/issuedCards";
import { getMerchantProfile } from "../lib/firestore/merchants";
import { createWalletToken, verifyWalletToken } from "../lib/wallet";
import { walletMagicLinkSchema } from "../schemas";

const walletRoutes = new Hono<{ Bindings: Env }>();

walletRoutes.post("/magic-link", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = walletMagicLinkSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request" }, 400);
  }

  const secret = c.env.WALLET_JWT_SECRET;
  if (!secret) {
    return c.json({ error: "wallet_not_configured" }, 503);
  }

  try {
    const token = await createWalletToken(secret, parsed.data.email);
    const appUrl = getAppUrl(c.env);
    const magicLink = `${appUrl}/wallet?token=${encodeURIComponent(token)}`;

    return c.json({
      sent: true,
      magicLink: c.env.ENVIRONMENT === "development" ? magicLink : undefined,
    });
  } catch {
    return c.json({ error: "magic_link_failed" }, 500);
  }
});

walletRoutes.get("/cards", async (c) => {
  const authHeader = c.req.header("Authorization");
  const secret = c.env.WALLET_JWT_SECRET;
  if (!authHeader?.startsWith("Bearer ") || !secret) {
    return c.json({ error: "missing_token" }, 401);
  }

  const walletToken = authHeader.slice("Bearer ".length).trim();
  const verified = await verifyWalletToken(secret, walletToken);
  if (!verified) {
    return c.json({ error: "invalid_token" }, 401);
  }

  const ctx = getFirestoreContext(c.env);

  try {
    const issuedCards = await listIssuedCardsByEmail(ctx, verified.email);
    const items = await Promise.all(
      issuedCards.map(async (issued) => {
        const [card, merchant] = await Promise.all([
          getGiftCard(ctx, issued.giftCardId),
          getMerchantProfile(ctx, issued.merchantId),
        ]);
        return {
          token: issued.token,
          balance: issued.balance,
          status: issued.status,
          merchantName: merchant?.businessName ?? null,
          giftCardName: card?.name ?? null,
          previewThumbnail: merchant?.logoUrl ?? null,
        };
      }),
    );
    return c.json({ email: verified.email, items });
  } catch {
    return c.json({ error: "wallet_cards_failed" }, 500);
  }
});

export default walletRoutes;

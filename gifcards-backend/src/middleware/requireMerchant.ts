import { createMiddleware } from "hono/factory";
import type { Env } from "../env";
import { getMerchantByUid } from "../lib/firestore/merchants";
import type { AuthVariables } from "./requireAuth";

export type MerchantVariables = AuthVariables & {
  merchantId: string;
};

export const requireMerchant = createMiddleware<{
  Bindings: Env;
  Variables: MerchantVariables;
}>(async (c, next) => {
  const { uid } = c.get("auth");
  const merchantId = c.req.param("id") ?? uid;

  if (merchantId !== uid) {
    return c.json({ error: "forbidden" }, 403);
  }

  const merchant = await getMerchantByUid(
    c.env.FIREBASE_PROJECT_ID,
    c.env.FIREBASE_SERVICE_ACCOUNT,
    uid,
  );

  if (!merchant) {
    return c.json({ error: "merchant_not_found" }, 404);
  }

  c.set("merchantId", uid);
  await next();
});

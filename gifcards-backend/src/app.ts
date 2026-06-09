import { Hono } from "hono";
import type { Env } from "./env";
import { corsMiddleware } from "./middleware/cors";
import analyticsRoutes from "./routes/analytics";
import authRoutes from "./routes/auth";
import checkoutRoutes from "./routes/checkout";
import dashboardRoutes from "./routes/dashboard";
import giftRoutes from "./routes/gift";
import giftCardRoutes from "./routes/giftCards";
import merchantRoutes from "./routes/merchants";
import redeemRoutes from "./routes/redeem";
import storefrontRoutes from "./routes/storefront";
import transactionRoutes from "./routes/transactions";
import uploadRoutes from "./routes/uploads";
import walletRoutes from "./routes/wallet";
import webhookRoutes from "./routes/webhooks";

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

const apiV1 = new Hono<{ Bindings: Env }>();
apiV1.route("/auth", authRoutes);
apiV1.route("/merchants", merchantRoutes);
apiV1.route("/gift-cards", giftCardRoutes);
apiV1.route("/storefront", storefrontRoutes);
apiV1.route("/checkout", checkoutRoutes);
apiV1.route("/webhooks", webhookRoutes);
apiV1.route("/gift", giftRoutes);
apiV1.route("/redeem", redeemRoutes);
apiV1.route("/dashboard", dashboardRoutes);
apiV1.route("/transactions", transactionRoutes);
apiV1.route("/analytics", analyticsRoutes);
apiV1.route("/wallet", walletRoutes);
apiV1.route("/uploads", uploadRoutes);

app.route("/api/v1", apiV1);

export default app;

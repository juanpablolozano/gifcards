import { Hono } from "hono";
import type { Env } from "./env";
import { corsMiddleware } from "./middleware/cors";
import authRoutes from "./routes/auth";
import merchantRoutes from "./routes/merchants";

const app = new Hono<{ Bindings: Env }>();

app.use("*", corsMiddleware);

app.get("/health", (c) => c.json({ status: "ok" }));

const apiV1 = new Hono<{ Bindings: Env }>();
apiV1.route("/auth", authRoutes);
apiV1.route("/merchants", merchantRoutes);

app.route("/api/v1", apiV1);

export default app;

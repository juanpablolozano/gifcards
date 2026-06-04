import type { MiddlewareHandler } from "hono";
import type { Env } from "../env";

export const corsMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (
  c,
  next,
) => {
  const origin = c.env.CORS_ORIGIN;

  c.header("Access-Control-Allow-Origin", origin);
  c.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  c.header(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
  c.header("Access-Control-Max-Age", "86400");

  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }

  await next();
};

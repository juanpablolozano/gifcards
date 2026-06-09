import { Hono } from "hono";
import type { Env } from "../env";
import { generateId } from "../lib/codes";
import { buildPublicUrl, createPresignedPutUrl } from "../lib/s3";
import { requireAuth, type AuthVariables } from "../middleware/requireAuth";
import { presignSchema } from "../schemas";

const uploadRoutes = new Hono<{
  Bindings: Env;
  Variables: AuthVariables;
}>();

uploadRoutes.post("/presign", requireAuth, async (c) => {
  const { uid } = c.get("auth");
  const body = await c.req.json().catch(() => null);
  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }

  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET } = c.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET) {
    return c.json({ error: "s3_not_configured" }, 503);
  }

  const ext = parsed.data.fileName.split(".").pop() ?? "bin";
  const key = `merchants/${uid}/${parsed.data.purpose}-${generateId()}.${ext}`;

  try {
    const uploadUrl = await createPresignedPutUrl({
      bucket: S3_BUCKET,
      key,
      contentType: parsed.data.contentType,
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    return c.json({
      uploadUrl,
      publicUrl: buildPublicUrl(S3_BUCKET, key),
      key,
    });
  } catch {
    return c.json({ error: "presign_failed" }, 500);
  }
});

export default uploadRoutes;

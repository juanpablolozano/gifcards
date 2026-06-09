import {
  type FirestoreContext,
  encodeString,
  encodeTimestamp,
  getDocument,
  createDocument,
} from "./client";

export async function isWebhookProcessed(
  ctx: FirestoreContext,
  eventId: string,
): Promise<boolean> {
  const doc = await getDocument(ctx, "webhookEvents", eventId);
  return doc !== null;
}

export async function markWebhookProcessed(
  ctx: FirestoreContext,
  eventId: string,
  eventType: string,
): Promise<void> {
  await createDocument(ctx, "webhookEvents", eventId, {
    type: encodeString(eventType),
    processedAt: encodeTimestamp(new Date().toISOString()),
  });
}

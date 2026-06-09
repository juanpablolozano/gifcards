import type { CreateGiftCardInput, GiftCard, GiftCardStatus, UpdateGiftCardInput } from "../../types/giftCard";
import {
  type FirestoreContext,
  type FirestoreDocument,
  encodeDouble,
  encodeInteger,
  encodeString,
  encodeTimestamp,
  getDocument,
  getDocumentId,
  getNumberField,
  getStringField,
  getTimestampField,
  createDocument,
  patchDocument,
  queryCollection,
} from "./client";

function parseGiftCard(doc: FirestoreDocument): GiftCard {
  const fields = doc.fields ?? {};
  return {
    id: getDocumentId(doc),
    merchantId: getStringField(fields, "merchantId") ?? "",
    name: getStringField(fields, "name") ?? "",
    valueType: (getStringField(fields, "valueType") as GiftCard["valueType"]) ?? "fixed",
    fixedAmount: getNumberField(fields, "fixedAmount") || null,
    minAmount: getNumberField(fields, "minAmount") || null,
    maxAmount: getNumberField(fields, "maxAmount") || null,
    currency: getStringField(fields, "currency") ?? "USD",
    message: getStringField(fields, "message"),
    status: (getStringField(fields, "status") as GiftCardStatus) ?? "draft",
    publicUrl: getStringField(fields, "publicUrl"),
    salesCount: getNumberField(fields, "salesCount"),
    totalRevenue: getNumberField(fields, "totalRevenue"),
    createdAt: getTimestampField(fields, "createdAt") ?? "",
    updatedAt: getTimestampField(fields, "updatedAt") ?? "",
  };
}

function buildGiftCardFields(
  merchantId: string,
  input: CreateGiftCardInput,
  slug: string,
  cardId: string,
  appUrl: string,
): Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeDouble> | ReturnType<typeof encodeInteger> | ReturnType<typeof encodeTimestamp>> {
  const now = new Date().toISOString();
  const status = input.status ?? "active";
  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeDouble> | ReturnType<typeof encodeInteger> | ReturnType<typeof encodeTimestamp>> = {
    id: encodeString(cardId),
    merchantId: encodeString(merchantId),
    name: encodeString(input.name),
    valueType: encodeString(input.valueType),
    currency: encodeString(input.currency ?? "USD"),
    status: encodeString(status),
    publicUrl: encodeString(`${appUrl}/${slug}/${cardId}`),
    salesCount: encodeInteger(0),
    totalRevenue: encodeDouble(0),
    createdAt: encodeTimestamp(now),
    updatedAt: encodeTimestamp(now),
  };

  if (input.message) fields.message = encodeString(input.message);
  if (input.valueType === "fixed" && input.fixedAmount !== undefined) {
    fields.fixedAmount = encodeDouble(input.fixedAmount);
  }
  if (input.valueType === "variable") {
    if (input.minAmount !== undefined) fields.minAmount = encodeDouble(input.minAmount);
    if (input.maxAmount !== undefined) fields.maxAmount = encodeDouble(input.maxAmount);
  }

  return fields;
}

export async function createGiftCard(
  ctx: FirestoreContext,
  merchantId: string,
  slug: string,
  cardId: string,
  input: CreateGiftCardInput,
  appUrl: string,
): Promise<GiftCard> {
  const fields = buildGiftCardFields(merchantId, input, slug, cardId, appUrl);
  const doc = await createDocument(ctx, "giftCards", cardId, fields);
  return parseGiftCard(doc);
}

export async function getGiftCard(
  ctx: FirestoreContext,
  cardId: string,
): Promise<GiftCard | null> {
  const doc = await getDocument(ctx, "giftCards", cardId);
  if (!doc) return null;
  return parseGiftCard(doc);
}

export async function listGiftCards(
  ctx: FirestoreContext,
  merchantId: string,
  status?: GiftCardStatus,
): Promise<GiftCard[]> {
  const filters = [{ field: "merchantId", op: "EQUAL" as const, value: encodeString(merchantId) }];
  if (status) {
    filters.push({ field: "status", op: "EQUAL", value: encodeString(status) });
  }
  const docs = await queryCollection(ctx, "giftCards", filters);
  return docs
    .map(parseGiftCard)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateGiftCard(
  ctx: FirestoreContext,
  cardId: string,
  input: UpdateGiftCardInput,
  existing?: GiftCard,
): Promise<GiftCard> {
  const card = existing ?? (await getGiftCard(ctx, cardId));
  if (!card) throw new Error("gift_card_not_found");

  if (card.salesCount > 0 && (input.valueType || input.fixedAmount || input.minAmount || input.maxAmount)) {
    throw new Error("cannot_change_amounts_after_sales");
  }

  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeDouble> | ReturnType<typeof encodeTimestamp>> = {
    updatedAt: encodeTimestamp(new Date().toISOString()),
  };

  if (input.name !== undefined) fields.name = encodeString(input.name);
  if (input.message !== undefined) fields.message = encodeString(input.message);
  if (input.status !== undefined) fields.status = encodeString(input.status);
  if (card.salesCount === 0) {
    if (input.valueType !== undefined) fields.valueType = encodeString(input.valueType);
    if (input.fixedAmount !== undefined) fields.fixedAmount = encodeDouble(input.fixedAmount);
    if (input.minAmount !== undefined) fields.minAmount = encodeDouble(input.minAmount);
    if (input.maxAmount !== undefined) fields.maxAmount = encodeDouble(input.maxAmount);
  }

  const doc = await patchDocument(ctx, "giftCards", cardId, fields);
  return parseGiftCard(doc);
}

export async function incrementGiftCardSales(
  ctx: FirestoreContext,
  cardId: string,
  amount: number,
): Promise<void> {
  const card = await getGiftCard(ctx, cardId);
  if (!card) return;
  await patchDocument(ctx, "giftCards", cardId, {
    salesCount: encodeInteger(card.salesCount + 1),
    totalRevenue: encodeDouble(card.totalRevenue + amount),
    updatedAt: encodeTimestamp(new Date().toISOString()),
  });
}

import type { IssuedCard, IssuedCardStatus } from "../../types/issuedCard";
import {
  type FirestoreContext,
  type FirestoreDocument,
  encodeDouble,
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

function parseIssuedCard(doc: FirestoreDocument): IssuedCard {
  const fields = doc.fields ?? {};
  return {
    id: getDocumentId(doc),
    token: getStringField(fields, "token") ?? "",
    code: getStringField(fields, "code") ?? "",
    giftCardId: getStringField(fields, "giftCardId") ?? "",
    merchantId: getStringField(fields, "merchantId") ?? "",
    balance: getNumberField(fields, "balance"),
    initialAmount: getNumberField(fields, "initialAmount"),
    currency: getStringField(fields, "currency") ?? "USD",
    status: (getStringField(fields, "status") as IssuedCardStatus) ?? "active",
    ownerEmail: getStringField(fields, "ownerEmail"),
    recipientEmail: getStringField(fields, "recipientEmail"),
    giftMessage: getStringField(fields, "giftMessage"),
    qrPayload: getStringField(fields, "qrPayload") ?? "",
    paymentSessionId: getStringField(fields, "paymentSessionId"),
    createdAt: getTimestampField(fields, "createdAt") ?? "",
    updatedAt: getTimestampField(fields, "updatedAt") ?? "",
  };
}

export type MintIssuedCardInput = {
  id: string;
  token: string;
  code: string;
  giftCardId: string;
  merchantId: string;
  amount: number;
  currency: string;
  ownerEmail: string;
  recipientEmail?: string;
  giftMessage?: string;
  paymentSessionId: string;
  appUrl: string;
};

export async function mintIssuedCard(
  ctx: FirestoreContext,
  input: MintIssuedCardInput,
): Promise<IssuedCard> {
  const now = new Date().toISOString();
  const qrPayload = `${input.appUrl}/gift/${input.token}`;

  const fields = {
    id: encodeString(input.id),
    token: encodeString(input.token),
    code: encodeString(input.code),
    giftCardId: encodeString(input.giftCardId),
    merchantId: encodeString(input.merchantId),
    balance: encodeDouble(input.amount),
    initialAmount: encodeDouble(input.amount),
    currency: encodeString(input.currency),
    status: encodeString("active"),
    ownerEmail: encodeString(input.ownerEmail),
    qrPayload: encodeString(qrPayload),
    paymentSessionId: encodeString(input.paymentSessionId),
    createdAt: encodeTimestamp(now),
    updatedAt: encodeTimestamp(now),
    ...(input.recipientEmail ? { recipientEmail: encodeString(input.recipientEmail) } : {}),
    ...(input.giftMessage ? { giftMessage: encodeString(input.giftMessage) } : {}),
  };

  const doc = await createDocument(ctx, "issuedCards", input.id, fields);
  return parseIssuedCard(doc);
}

export async function getIssuedCardById(
  ctx: FirestoreContext,
  id: string,
): Promise<IssuedCard | null> {
  const doc = await getDocument(ctx, "issuedCards", id);
  if (!doc) return null;
  return parseIssuedCard(doc);
}

export async function getIssuedCardByToken(
  ctx: FirestoreContext,
  token: string,
): Promise<IssuedCard | null> {
  const docs = await queryCollection(ctx, "issuedCards", [
    { field: "token", op: "EQUAL", value: encodeString(token) },
  ], undefined, 1);
  const doc = docs[0];
  if (!doc) return null;
  return parseIssuedCard(doc);
}

export async function getIssuedCardByCode(
  ctx: FirestoreContext,
  code: string,
): Promise<IssuedCard | null> {
  const docs = await queryCollection(ctx, "issuedCards", [
    { field: "code", op: "EQUAL", value: encodeString(code) },
  ], undefined, 1);
  const doc = docs[0];
  if (!doc) return null;
  return parseIssuedCard(doc);
}

export async function listIssuedCardsByEmail(
  ctx: FirestoreContext,
  email: string,
): Promise<IssuedCard[]> {
  const ownerDocs = await queryCollection(ctx, "issuedCards", [
    { field: "ownerEmail", op: "EQUAL", value: encodeString(email) },
  ]);
  const recipientDocs = await queryCollection(ctx, "issuedCards", [
    { field: "recipientEmail", op: "EQUAL", value: encodeString(email) },
  ]);
  const seen = new Set<string>();
  const results: IssuedCard[] = [];
  for (const doc of [...ownerDocs, ...recipientDocs]) {
    const card = parseIssuedCard(doc);
    if (!seen.has(card.id)) {
      seen.add(card.id);
      results.push(card);
    }
  }
  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateIssuedCardBalance(
  ctx: FirestoreContext,
  id: string,
  newBalance: number,
  status: IssuedCardStatus,
): Promise<IssuedCard> {
  const doc = await patchDocument(ctx, "issuedCards", id, {
    balance: encodeDouble(newBalance),
    status: encodeString(status),
    updatedAt: encodeTimestamp(new Date().toISOString()),
  });
  return parseIssuedCard(doc);
}

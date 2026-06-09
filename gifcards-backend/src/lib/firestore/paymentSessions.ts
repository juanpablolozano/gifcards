import {
  type FirestoreContext,
  type FirestoreDocument,
  encodeBoolean,
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
} from "./client";

export type PaymentSessionStatus = "pending" | "completed" | "expired" | "failed";

export type PaymentSession = {
  id: string;
  stripeSessionId: string | null;
  merchantId: string;
  giftCardId: string;
  giftCardName: string;
  merchantSlug: string;
  amount: number;
  buyerEmail: string;
  recipientEmail: string | null;
  recipientName: string | null;
  giftMessage: string | null;
  isGift: boolean;
  status: PaymentSessionStatus;
  issuedCardId: string | null;
  issuedCardToken: string | null;
  emailSent: boolean;
  createdAt: string;
};

function parsePaymentSession(doc: FirestoreDocument): PaymentSession {
  const fields = doc.fields ?? {};
  return {
    id: getDocumentId(doc),
    stripeSessionId: getStringField(fields, "stripeSessionId"),
    merchantId: getStringField(fields, "merchantId") ?? "",
    giftCardId: getStringField(fields, "giftCardId") ?? "",
    giftCardName: getStringField(fields, "giftCardName") ?? "",
    merchantSlug: getStringField(fields, "merchantSlug") ?? "",
    amount: getNumberField(fields, "amount"),
    buyerEmail: getStringField(fields, "buyerEmail") ?? "",
    recipientEmail: getStringField(fields, "recipientEmail"),
    recipientName: getStringField(fields, "recipientName"),
    giftMessage: getStringField(fields, "giftMessage"),
    isGift: fields.isGift && "booleanValue" in fields.isGift ? fields.isGift.booleanValue : false,
    status: (getStringField(fields, "status") as PaymentSessionStatus) ?? "pending",
    issuedCardId: getStringField(fields, "issuedCardId"),
    issuedCardToken: getStringField(fields, "issuedCardToken"),
    emailSent: fields.emailSent && "booleanValue" in fields.emailSent ? fields.emailSent.booleanValue : false,
    createdAt: getTimestampField(fields, "createdAt") ?? "",
  };
}

export type CreatePaymentSessionInput = {
  id: string;
  merchantId: string;
  giftCardId: string;
  giftCardName: string;
  merchantSlug: string;
  amount: number;
  buyerEmail: string;
  isGift: boolean;
  recipientEmail?: string;
  recipientName?: string;
  giftMessage?: string;
};

export async function createPaymentSession(
  ctx: FirestoreContext,
  input: CreatePaymentSessionInput,
): Promise<PaymentSession> {
  const now = new Date().toISOString();
  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeDouble> | ReturnType<typeof encodeBoolean> | ReturnType<typeof encodeTimestamp>> = {
    id: encodeString(input.id),
    merchantId: encodeString(input.merchantId),
    giftCardId: encodeString(input.giftCardId),
    giftCardName: encodeString(input.giftCardName),
    merchantSlug: encodeString(input.merchantSlug),
    amount: encodeDouble(input.amount),
    buyerEmail: encodeString(input.buyerEmail),
    isGift: encodeBoolean(input.isGift),
    status: encodeString("pending"),
    emailSent: encodeBoolean(false),
    createdAt: encodeTimestamp(now),
  };

  if (input.recipientEmail) fields.recipientEmail = encodeString(input.recipientEmail);
  if (input.recipientName) fields.recipientName = encodeString(input.recipientName);
  if (input.giftMessage) fields.giftMessage = encodeString(input.giftMessage);

  const doc = await createDocument(ctx, "paymentSessions", input.id, fields);
  return parsePaymentSession(doc);
}

export async function getPaymentSession(
  ctx: FirestoreContext,
  id: string,
): Promise<PaymentSession | null> {
  const doc = await getDocument(ctx, "paymentSessions", id);
  if (!doc) return null;
  return parsePaymentSession(doc);
}

export async function completePaymentSession(
  ctx: FirestoreContext,
  id: string,
  data: {
    stripeSessionId: string;
    issuedCardId: string;
    issuedCardToken: string;
    emailSent: boolean;
  },
): Promise<PaymentSession> {
  const doc = await patchDocument(ctx, "paymentSessions", id, {
    stripeSessionId: encodeString(data.stripeSessionId),
    issuedCardId: encodeString(data.issuedCardId),
    issuedCardToken: encodeString(data.issuedCardToken),
    status: encodeString("completed"),
    emailSent: encodeBoolean(data.emailSent),
  });
  return parsePaymentSession(doc);
}

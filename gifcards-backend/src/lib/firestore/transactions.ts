import type { Transaction, TransactionType } from "../../types/transaction";
import {
  type FirestoreContext,
  type FirestoreDocument,
  encodeDouble,
  encodeString,
  encodeTimestamp,
  getDocumentId,
  getNumberField,
  getStringField,
  getTimestampField,
  createDocument,
  queryCollection,
} from "./client";

function parseTransaction(doc: FirestoreDocument): Transaction {
  const fields = doc.fields ?? {};
  return {
    id: getDocumentId(doc),
    type: (getStringField(fields, "type") as TransactionType) ?? "purchase",
    amount: getNumberField(fields, "amount"),
    merchantId: getStringField(fields, "merchantId") ?? "",
    giftCardId: getStringField(fields, "giftCardId"),
    giftCardName: getStringField(fields, "giftCardName"),
    issuedCardId: getStringField(fields, "issuedCardId"),
    customerEmail: getStringField(fields, "customerEmail"),
    code: getStringField(fields, "code"),
    status: (getStringField(fields, "status") as Transaction["status"]) ?? "completed",
    performedByUserId: getStringField(fields, "performedByUserId"),
    notes: getStringField(fields, "notes"),
    createdAt: getTimestampField(fields, "createdAt") ?? "",
  };
}

export type CreateTransactionInput = {
  id: string;
  type: TransactionType;
  amount: number;
  merchantId: string;
  giftCardId?: string;
  giftCardName?: string;
  issuedCardId?: string;
  customerEmail?: string;
  code?: string;
  performedByUserId?: string;
  notes?: string;
};

export async function createTransaction(
  ctx: FirestoreContext,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const now = new Date().toISOString();
  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeDouble> | ReturnType<typeof encodeTimestamp>> = {
    id: encodeString(input.id),
    type: encodeString(input.type),
    amount: encodeDouble(input.amount),
    merchantId: encodeString(input.merchantId),
    status: encodeString("completed"),
    createdAt: encodeTimestamp(now),
  };

  if (input.giftCardId) fields.giftCardId = encodeString(input.giftCardId);
  if (input.giftCardName) fields.giftCardName = encodeString(input.giftCardName);
  if (input.issuedCardId) fields.issuedCardId = encodeString(input.issuedCardId);
  if (input.customerEmail) fields.customerEmail = encodeString(input.customerEmail);
  if (input.code) fields.code = encodeString(input.code);
  if (input.performedByUserId) fields.performedByUserId = encodeString(input.performedByUserId);
  if (input.notes) fields.notes = encodeString(input.notes);

  const doc = await createDocument(ctx, "transactions", input.id, fields);
  return parseTransaction(doc);
}

export type ListTransactionsOptions = {
  merchantId: string;
  type?: TransactionType;
  giftCardId?: string;
  limit?: number;
};

export async function listTransactions(
  ctx: FirestoreContext,
  options: ListTransactionsOptions,
): Promise<Transaction[]> {
  const filters = [
    { field: "merchantId", op: "EQUAL" as const, value: encodeString(options.merchantId) },
  ];
  if (options.type) {
    filters.push({ field: "type", op: "EQUAL", value: encodeString(options.type) });
  }
  if (options.giftCardId) {
    filters.push({ field: "giftCardId", op: "EQUAL", value: encodeString(options.giftCardId) });
  }

  const limit = options.limit ?? 100;
  const docs = await queryCollection(ctx, "transactions", filters);
  return docs
    .map(parseTransaction)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listTransactionsByIssuedCard(
  ctx: FirestoreContext,
  issuedCardId: string,
): Promise<Transaction[]> {
  const docs = await queryCollection(ctx, "transactions", [
    { field: "issuedCardId", op: "EQUAL", value: encodeString(issuedCardId) },
  ]);
  return docs
    .map(parseTransaction)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
}

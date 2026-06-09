export type TransactionType = "purchase" | "redemption" | "refund" | "adjustment";
export type TransactionStatus = "completed" | "failed" | "pending";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  merchantId: string;
  giftCardId: string | null;
  giftCardName: string | null;
  issuedCardId: string | null;
  customerEmail: string | null;
  code: string | null;
  status: TransactionStatus;
  performedByUserId: string | null;
  notes: string | null;
  createdAt: string;
};

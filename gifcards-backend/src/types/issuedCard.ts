export type IssuedCardStatus =
  | "active"
  | "partially_redeemed"
  | "redeemed"
  | "expired"
  | "void";

export type IssuedCard = {
  id: string;
  token: string;
  code: string;
  giftCardId: string;
  merchantId: string;
  balance: number;
  initialAmount: number;
  currency: string;
  status: IssuedCardStatus;
  ownerEmail: string | null;
  recipientEmail: string | null;
  giftMessage: string | null;
  qrPayload: string;
  paymentSessionId: string | null;
  createdAt: string;
  updatedAt: string;
};

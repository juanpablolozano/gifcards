export type CheckoutCart = {
  giftCardId: string;
  merchantSlug: string;
  merchantName: string;
  giftCardName: string;
  amount: number;
  currency: string;
};

export type CreateCheckoutSessionPayload = {
  giftCardId: string;
  merchantSlug: string;
  amount: number;
  buyerEmail: string;
  isGift?: boolean;
  recipientEmail?: string;
  recipientName?: string;
  giftMessage?: string;
};

export type CheckoutSessionResponse = {
  sessionId: string;
  stripeSessionId: string;
  checkoutUrl: string;
};

export type CheckoutSessionStatus = {
  id: string;
  status: string;
  amount: number;
  giftCardName: string;
  issuedCardToken: string | null;
  emailSent: boolean;
};

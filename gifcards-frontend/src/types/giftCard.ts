export type GiftCardStatus = "draft" | "active" | "paused" | "archived";
export type ValueType = "fixed" | "variable";

export type GiftCard = {
  id: string;
  merchantId: string;
  name: string;
  valueType: ValueType;
  fixedAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  currency: string;
  message: string | null;
  status: GiftCardStatus;
  publicUrl: string | null;
  salesCount: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
};

export type GiftCardDetail = GiftCard & {
  metrics: {
    soldCount: number;
    redeemedAmount: number;
    outstandingBalance: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
    status: string;
  }>;
};

export type CreateGiftCardPayload = {
  name: string;
  valueType: ValueType;
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  message?: string;
  status?: GiftCardStatus;
};

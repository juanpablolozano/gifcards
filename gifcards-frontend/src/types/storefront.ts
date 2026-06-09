import type { GiftCard } from "./giftCard";

export type StorefrontMerchant = {
  id: string;
  slug: string | null;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string | null;
};

export type StorefrontResponse = {
  merchant: StorefrontMerchant;
  giftCards: Pick<
    GiftCard,
    "id" | "name" | "valueType" | "fixedAmount" | "minAmount" | "maxAmount" | "currency" | "message" | "publicUrl"
  >[];
};

import { apiFetch } from "../lib/apiClient";

export type GiftViewResponse = {
  issuedCard: {
    id: string;
    token: string;
    code: string;
    balance: number;
    initialAmount: number;
    currency: string;
    status: string;
    giftMessage: string | null;
    createdAt: string;
  };
  giftCard: { id: string; name: string; message: string | null } | null;
  merchant: {
    businessName: string | null;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string | null;
  } | null;
  history: Array<{ id: string; type: string; amount: number; createdAt: string }>;
};

export async function getGiftView(token: string): Promise<GiftViewResponse> {
  return apiFetch(`/api/v1/gift/${token}`);
}

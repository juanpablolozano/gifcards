import { apiFetch } from "../lib/apiClient";

export type Transaction = {
  id: string;
  type: string;
  amount: number;
  merchantId: string;
  giftCardId: string | null;
  giftCardName: string | null;
  issuedCardId: string | null;
  customerEmail: string | null;
  code: string | null;
  status: string;
  createdAt: string;
};

export async function listTransactions(
  token: string,
  params?: { type?: string; giftCardId?: string; limit?: number },
): Promise<{ items: Transaction[]; total: number }> {
  const search = new URLSearchParams();
  if (params?.type) search.set("type", params.type);
  if (params?.giftCardId) search.set("giftCardId", params.giftCardId);
  if (params?.limit) search.set("limit", String(params.limit));
  const q = search.toString();
  return apiFetch(`/api/v1/transactions${q ? `?${q}` : ""}`, { token });
}

import { apiFetch } from "../lib/apiClient";

export type ValidateRedemptionResponse = {
  valid: boolean;
  issuedCardId?: string;
  code?: string;
  balance?: number;
  status?: string;
  giftCardName?: string | null;
  currency?: string;
  errorCode?: string;
};

export async function validateRedemptionCode(
  token: string,
  code: string,
): Promise<ValidateRedemptionResponse> {
  return apiFetch(`/api/v1/redeem/validate?code=${encodeURIComponent(code)}`, { token });
}

export async function confirmRedemption(
  token: string,
  payload: { issuedCardId: string; amount: number; notes?: string },
): Promise<{ transactionId: string; newBalance: number; status: string; redeemedAt: string }> {
  return apiFetch("/api/v1/redeem", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

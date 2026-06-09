import { apiFetch } from "../lib/apiClient";
import type { MerchantSession } from "../types/auth";
import type { MerchantProfile, PaymentsStatus, UpdateMerchantPayload } from "../types/merchant";

export type BootstrapMerchantPayload = {
  displayName?: string;
  preferredLanguage?: "en" | "es";
  acceptedTermsAt?: string;
};

export async function bootstrapMerchant(
  token: string,
  payload: BootstrapMerchantPayload,
): Promise<MerchantSession> {
  return apiFetch<MerchantSession>("/api/v1/merchants", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateMerchant(
  token: string,
  merchantId: string,
  payload: UpdateMerchantPayload,
): Promise<MerchantProfile> {
  return apiFetch<MerchantProfile>(`/api/v1/merchants/${merchantId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function getMerchantProfile(
  token: string,
  merchantId: string,
): Promise<MerchantProfile> {
  return apiFetch<MerchantProfile>(`/api/v1/merchants/${merchantId}`, { token });
}

export async function checkSlugAvailability(
  token: string,
  slug: string,
): Promise<{ slug: string; available: boolean }> {
  return apiFetch(`/api/v1/merchants/slug/${slug}/availability`, { token });
}

export async function getPaymentsStatus(
  token: string,
  merchantId: string,
): Promise<PaymentsStatus> {
  return apiFetch<PaymentsStatus>(`/api/v1/merchants/${merchantId}/payments`, { token });
}

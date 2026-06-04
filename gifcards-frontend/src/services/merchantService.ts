import { apiFetch } from "../lib/apiClient";
import type { MerchantSession } from "../types/auth";

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

import { apiFetch } from "../lib/apiClient";
import type {
  CheckoutSessionResponse,
  CheckoutSessionStatus,
  CreateCheckoutSessionPayload,
} from "../types/checkout";

export async function createCheckoutSession(
  payload: CreateCheckoutSessionPayload,
): Promise<CheckoutSessionResponse> {
  return apiFetch("/api/v1/checkout/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCheckoutSession(
  sessionId: string,
): Promise<CheckoutSessionStatus> {
  return apiFetch(`/api/v1/checkout/sessions/${sessionId}`);
}

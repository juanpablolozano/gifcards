import { apiFetch } from "../lib/apiClient";
import type { CreateGiftCardPayload, GiftCard, GiftCardDetail, GiftCardStatus } from "../types/giftCard";

export async function listGiftCards(
  token: string,
  status?: GiftCardStatus,
): Promise<{ items: GiftCard[] }> {
  const query = status ? `?status=${status}` : "";
  return apiFetch(`/api/v1/gift-cards${query}`, { token });
}

export async function getGiftCard(
  token: string,
  cardId: string,
): Promise<GiftCardDetail> {
  return apiFetch(`/api/v1/gift-cards/${cardId}`, { token });
}

export async function createGiftCard(
  token: string,
  payload: CreateGiftCardPayload,
): Promise<GiftCard> {
  return apiFetch("/api/v1/gift-cards", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateGiftCard(
  token: string,
  cardId: string,
  payload: Partial<CreateGiftCardPayload> & { status?: GiftCardStatus },
): Promise<GiftCard> {
  return apiFetch(`/api/v1/gift-cards/${cardId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

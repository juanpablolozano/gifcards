import { apiFetch } from "../lib/apiClient";
import type { GiftCard } from "../types/giftCard";
import type { StorefrontMerchant, StorefrontResponse } from "../types/storefront";

export async function getStorefront(slug: string): Promise<StorefrontResponse> {
  return apiFetch(`/api/v1/storefront/${slug}`);
}

export async function getStorefrontCard(
  slug: string,
  cardId: string,
): Promise<{ merchant: StorefrontMerchant; giftCard: GiftCard }> {
  return apiFetch(`/api/v1/storefront/${slug}/cards/${cardId}`);
}

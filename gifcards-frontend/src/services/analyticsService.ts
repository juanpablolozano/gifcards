import { apiFetch } from "../lib/apiClient";

export type AnalyticsResponse = {
  series: Array<{ date: string; salesAmount: number; redemptionAmount: number }>;
  totals: {
    totalSales: number;
    totalRedemptions: number;
    netOutstanding: number;
  };
};

export async function fetchAnalytics(
  token: string,
  params?: { days?: number; giftCardId?: string },
): Promise<AnalyticsResponse> {
  const search = new URLSearchParams();
  if (params?.days) search.set("days", String(params.days));
  if (params?.giftCardId) search.set("giftCardId", params.giftCardId);
  const q = search.toString();
  return apiFetch(`/api/v1/analytics${q ? `?${q}` : ""}`, { token });
}

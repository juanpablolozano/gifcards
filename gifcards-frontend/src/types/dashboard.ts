import type { MerchantSession } from "./auth";

export type DashboardResponse = {
  merchant: MerchantSession | null;
  kpis: {
    totalSales: number;
    totalRedemptions: number;
    outstandingBalance: number;
    salesTrend: number;
    redemptionsTrend: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    amount: number;
    giftCardName: string | null;
    createdAt: string;
    status: string;
  }>;
  onboardingChecklist: {
    accountCreated: boolean;
    profileCompleted: boolean;
    firstGiftCardPublished: boolean;
  };
  giftCardsCount: number;
  hasPublishedCard: boolean;
};

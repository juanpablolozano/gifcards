import type { ComponentType } from "react";
import {
  DashboardIcon,
  GiftCardsIcon,
  RedeemIcon,
  SettingsIcon,
  TransactionsIcon,
} from "../components/dashboard/dashboardIcons";

export type MerchantNavItem = {
  path: string;
  labelKey: string;
  pageTitleKey: string;
  icon: ComponentType<{ size?: number }>;
  end?: boolean;
};

export const merchantNavItems: MerchantNavItem[] = [
  {
    path: "/dashboard",
    labelKey: "nav.dashboard",
    pageTitleKey: "pages.dashboard",
    icon: DashboardIcon,
    end: true,
  },
  {
    path: "/gift-cards",
    labelKey: "nav.giftCards",
    pageTitleKey: "pages.giftCards",
    icon: GiftCardsIcon,
  },
  {
    path: "/redeem",
    labelKey: "nav.redeem",
    pageTitleKey: "pages.redeem",
    icon: RedeemIcon,
  },
  {
    path: "/transactions",
    labelKey: "nav.transactions",
    pageTitleKey: "pages.transactions",
    icon: TransactionsIcon,
  },
  {
    path: "/analytics",
    labelKey: "nav.analytics",
    pageTitleKey: "pages.analytics",
    icon: TransactionsIcon,
  },
  {
    path: "/settings",
    labelKey: "nav.settings",
    pageTitleKey: "pages.settings",
    icon: SettingsIcon,
  },
];

export const createGiftCardPath = "/gift-cards/new";

export function getPageTitleKey(pathname: string): string {
  if (pathname === createGiftCardPath) return "pages.createGiftCard";
  if (pathname.startsWith("/gift-cards/") && pathname.endsWith("/edit")) {
    return "pages.editGiftCard";
  }
  if (pathname.startsWith("/gift-cards/") && pathname !== "/gift-cards/new") {
    return "pages.giftCardDetail";
  }
  if (pathname.startsWith("/settings/")) {
    if (pathname.includes("account")) return "pages.settingsAccount";
    if (pathname.includes("business")) return "pages.settingsBusiness";
    if (pathname.includes("payments")) return "pages.settingsPayments";
  }
  if (pathname === "/redeem/confirm") return "pages.redeemConfirm";

  const match = merchantNavItems.find((item) =>
    item.end ? pathname === item.path : pathname.startsWith(item.path),
  );

  return match?.pageTitleKey ?? "pages.dashboard";
}

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
    path: "/",
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
    path: "/settings",
    labelKey: "nav.settings",
    pageTitleKey: "pages.settings",
    icon: SettingsIcon,
  },
];

export const createGiftCardPath = "/gift-cards/new";

export function getPageTitleKey(pathname: string): string {
  if (pathname === createGiftCardPath) {
    return "pages.createGiftCard";
  }

  const match = merchantNavItems.find((item) =>
    item.end ? pathname === item.path : pathname.startsWith(item.path),
  );

  return match?.pageTitleKey ?? "pages.dashboard";
}

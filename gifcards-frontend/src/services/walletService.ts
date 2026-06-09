import { apiFetch } from "../lib/apiClient";

export async function requestMagicLink(email: string): Promise<{ sent: boolean; magicLink?: string }> {
  return apiFetch("/api/v1/wallet/magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export type WalletCard = {
  token: string;
  balance: number;
  status: string;
  merchantName: string | null;
  giftCardName: string | null;
  previewThumbnail: string | null;
};

export async function listWalletCards(walletToken: string): Promise<{ email: string; items: WalletCard[] }> {
  return apiFetch("/api/v1/wallet/cards", { token: walletToken });
}

import { create } from "zustand";

type WalletState = {
  walletToken: string | null;
  email: string | null;
  setWalletSession: (walletToken: string, email: string) => void;
  clear: () => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  walletToken: localStorage.getItem("gifcards_wallet_token"),
  email: localStorage.getItem("gifcards_wallet_email"),
  setWalletSession: (walletToken, email) => {
    localStorage.setItem("gifcards_wallet_token", walletToken);
    localStorage.setItem("gifcards_wallet_email", email);
    set({ walletToken, email });
  },
  clear: () => {
    localStorage.removeItem("gifcards_wallet_token");
    localStorage.removeItem("gifcards_wallet_email");
    set({ walletToken: null, email: null });
  },
}));

import { create } from "zustand";
import type { CheckoutCart } from "../types/checkout";

type CheckoutState = {
  cart: CheckoutCart | null;
  buyerEmail: string;
  isGift: boolean;
  recipientEmail: string;
  recipientName: string;
  giftMessage: string;
  setCart: (cart: CheckoutCart) => void;
  setBuyerEmail: (email: string) => void;
  setIsGift: (isGift: boolean) => void;
  setRecipientEmail: (email: string) => void;
  setRecipientName: (name: string) => void;
  setGiftMessage: (message: string) => void;
  clear: () => void;
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  cart: null,
  buyerEmail: "",
  isGift: false,
  recipientEmail: "",
  recipientName: "",
  giftMessage: "",
  setCart: (cart) => set({ cart }),
  setBuyerEmail: (buyerEmail) => set({ buyerEmail }),
  setIsGift: (isGift) => set({ isGift }),
  setRecipientEmail: (recipientEmail) => set({ recipientEmail }),
  setRecipientName: (recipientName) => set({ recipientName }),
  setGiftMessage: (giftMessage) => set({ giftMessage }),
  clear: () =>
    set({
      cart: null,
      buyerEmail: "",
      isGift: false,
      recipientEmail: "",
      recipientName: "",
      giftMessage: "",
    }),
}));

import { create } from "zustand";
import type { ValidateRedemptionResponse } from "../services/redemptionService";

type RedeemState = {
  validated: ValidateRedemptionResponse | null;
  amount: string;
  notes: string;
  setValidated: (validated: ValidateRedemptionResponse | null) => void;
  setAmount: (amount: string) => void;
  setNotes: (notes: string) => void;
  clear: () => void;
};

export const useRedeemStore = create<RedeemState>((set) => ({
  validated: null,
  amount: "",
  notes: "",
  setValidated: (validated) => set({ validated }),
  setAmount: (amount) => set({ amount }),
  setNotes: (notes) => set({ notes }),
  clear: () => set({ validated: null, amount: "", notes: "" }),
}));

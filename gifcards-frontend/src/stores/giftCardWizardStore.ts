import { create } from "zustand";
import type { ValueType } from "../types/giftCard";

type WizardState = {
  step: number;
  name: string;
  valueType: ValueType;
  fixedAmount: string;
  minAmount: string;
  maxAmount: string;
  message: string;
  publishedCardId: string | null;
  publicUrl: string | null;
  setStep: (step: number) => void;
  setName: (name: string) => void;
  setValueType: (valueType: ValueType) => void;
  setFixedAmount: (v: string) => void;
  setMinAmount: (v: string) => void;
  setMaxAmount: (v: string) => void;
  setMessage: (message: string) => void;
  setPublished: (cardId: string, publicUrl: string) => void;
  reset: () => void;
};

const initial = {
  step: 1,
  name: "",
  valueType: "fixed" as ValueType,
  fixedAmount: "50",
  minAmount: "25",
  maxAmount: "500",
  message: "",
  publishedCardId: null,
  publicUrl: null,
};

export const useGiftCardWizardStore = create<WizardState>((set) => ({
  ...initial,
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setValueType: (valueType) => set({ valueType }),
  setFixedAmount: (fixedAmount) => set({ fixedAmount }),
  setMinAmount: (minAmount) => set({ minAmount }),
  setMaxAmount: (maxAmount) => set({ maxAmount }),
  setMessage: (message) => set({ message }),
  setPublished: (publishedCardId, publicUrl) => set({ publishedCardId, publicUrl }),
  reset: () => set(initial),
}));

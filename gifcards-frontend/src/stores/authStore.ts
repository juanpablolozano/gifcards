import { create } from "zustand";
import type { AuthUser, MerchantSession } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  idToken: string | null;
  merchant: MerchantSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setSession: (payload: {
    user: AuthUser;
    idToken: string;
    merchant: MerchantSession | null;
  }) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  idToken: null,
  merchant: null,
  isLoading: true,
  isAuthenticated: false,
  setSession: ({ user, idToken, merchant }) =>
    set({
      user,
      idToken,
      merchant,
      isLoading: false,
      isAuthenticated: true,
    }),
  clearSession: () =>
    set({
      user: null,
      idToken: null,
      merchant: null,
      isLoading: false,
      isAuthenticated: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));

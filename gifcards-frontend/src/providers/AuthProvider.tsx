import type { ReactNode } from "react";
import { useAuthListener } from "../hooks/useAuth";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  useAuthListener();
  return children;
}

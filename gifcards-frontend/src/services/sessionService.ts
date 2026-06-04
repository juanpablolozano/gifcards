import { apiFetch } from "../lib/apiClient";
import type { SessionResponse } from "../types/auth";

export async function fetchSession(token: string): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/api/v1/auth/session", { token });
}

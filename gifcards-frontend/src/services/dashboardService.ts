import { apiFetch } from "../lib/apiClient";
import type { DashboardResponse } from "../types/dashboard";

export async function fetchDashboard(token: string): Promise<DashboardResponse> {
  return apiFetch("/api/v1/dashboard", { token });
}

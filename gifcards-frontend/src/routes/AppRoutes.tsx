import { Navigate, Route, Routes } from "react-router-dom";
import { MerchantLayout } from "../layouts/MerchantLayout";
import { DashboardPlaceholderPage } from "../pages/DashboardPlaceholderPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { StubPage } from "../pages/StubPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<MerchantLayout />}>
          <Route path="/" element={<DashboardPlaceholderPage />} />
          <Route path="/gift-cards" element={<DashboardPlaceholderPage />} />
          <Route path="/gift-cards/new" element={<DashboardPlaceholderPage />} />
          <Route path="/redeem" element={<DashboardPlaceholderPage />} />
          <Route path="/transactions" element={<DashboardPlaceholderPage />} />
          <Route path="/settings" element={<DashboardPlaceholderPage />} />
        </Route>
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="/forgot-password" element={<StubPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

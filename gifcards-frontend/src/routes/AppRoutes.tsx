import { Navigate, Route, Routes } from "react-router-dom";
import { MerchantLayout } from "../layouts/MerchantLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { CheckoutSuccessPage } from "../pages/CheckoutSuccessPage";
import { CreateGiftCardPage } from "../pages/CreateGiftCardPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EditGiftCardPage } from "../pages/EditGiftCardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { GiftCardDetailPage } from "../pages/GiftCardDetailPage";
import { GiftCardsListPage } from "../pages/GiftCardsListPage";
import { GiftViewPage } from "../pages/GiftViewPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { OnboardingPage } from "../pages/OnboardingPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { QrFullscreenPage } from "../pages/QrFullscreenPage";
import { RedeemConfirmPage } from "../pages/RedeemConfirmPage";
import { RedeemPage } from "../pages/RedeemPage";
import { SettingsAccountPage } from "../pages/SettingsAccountPage";
import { SettingsBusinessPage } from "../pages/SettingsBusinessPage";
import { SettingsLayout } from "../pages/SettingsLayout";
import { SettingsPaymentsPage } from "../pages/SettingsPaymentsPage";
import { SignupPage } from "../pages/SignupPage";
import { StorefrontPage } from "../pages/StorefrontPage";
import { TransactionsPage } from "../pages/TransactionsPage";
import { WalletLoginPage } from "../pages/WalletLoginPage";
import { WalletPage } from "../pages/WalletPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/gift/:token" element={<GiftViewPage />} />
        <Route path="/gift/:token/qr" element={<QrFullscreenPage />} />
        <Route path="/wallet/login" element={<WalletLoginPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<MerchantLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/gift-cards" element={<GiftCardsListPage />} />
          <Route path="/gift-cards/new" element={<CreateGiftCardPage />} />
          <Route path="/gift-cards/:id/edit" element={<EditGiftCardPage />} />
          <Route path="/gift-cards/:id" element={<GiftCardDetailPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/redeem/confirm" element={<RedeemConfirmPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<SettingsAccountPage />} />
            <Route path="business" element={<SettingsBusinessPage />} />
            <Route path="payments" element={<SettingsPaymentsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<StorefrontLayout />}>
        <Route path="/:merchantSlug/:cardId" element={<ProductDetailPage />} />
        <Route path="/:merchantSlug" element={<StorefrontPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

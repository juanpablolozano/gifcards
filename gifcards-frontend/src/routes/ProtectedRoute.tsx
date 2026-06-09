import { Spinner, VStack } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function ProtectedRoute() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const merchant = useAuthStore((state) => state.merchant);
  const location = useLocation();

  if (isLoading) {
    return (
      <VStack minH="100vh" justify="center">
        <Spinner size="lg" color="secondary" />
      </VStack>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const needsOnboarding =
    merchant && !merchant.onboardingCompleted && location.pathname !== "/onboarding";

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

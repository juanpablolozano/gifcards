import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFooter, AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuthActions } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthActions();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <AuthLayout footer={<AuthFooter />}>
      <LoginForm onSubmit={login} onGoogleSignIn={loginWithGoogle} />
    </AuthLayout>
  );
}

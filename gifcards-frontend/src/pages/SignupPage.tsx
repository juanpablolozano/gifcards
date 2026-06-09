import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFooter, AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";
import { useAuthActions } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, signupWithGoogle } = useAuthActions();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <AuthLayout footer={<AuthFooter />}>
      <SignupForm onSubmit={signup} onGoogleSignUp={signupWithGoogle} />
    </AuthLayout>
  );
}

import { useEffect } from "react";
import type { User } from "firebase/auth";
import { useTranslation } from "react-i18next";
import {
  getFirebaseErrorCode,
  getIdToken,
  mapFirebaseAuthError,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from "../lib/authService";
import { toaster } from "../lib/toaster";
import {
  bootstrapMerchant,
  type BootstrapMerchantPayload,
} from "../services/merchantService";
import { fetchSession } from "../services/sessionService";
import { useAuthStore } from "../stores/authStore";

async function hydrateSessionFromUser(firebaseUser: User) {
  const idToken = await getIdToken(firebaseUser);
  const session = await fetchSession(idToken);

  useAuthStore.getState().setSession({
    user: {
      uid: firebaseUser.uid,
      email: session.user.email ?? firebaseUser.email,
    },
    idToken,
    merchant: session.merchant,
  });
}

function getPreferredLanguage(language: string): "en" | "es" {
  return language.startsWith("es") ? "es" : "en";
}

async function ensureMerchantBootstrapped(
  firebaseUser: User,
  payload: BootstrapMerchantPayload,
) {
  const idToken = await getIdToken(firebaseUser);
  const session = await fetchSession(idToken);

  if (!session.merchant) {
    await bootstrapMerchant(idToken, payload);
  }

  await hydrateSessionFromUser(firebaseUser);
}

export function useAuthListener() {
  const { t } = useTranslation("auth");
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        clearSession();
        return;
      }

      setLoading(true);
      try {
        await hydrateSessionFromUser(firebaseUser);
      } catch {
        clearSession();
        toaster.create({
          title: t("errors.sessionFailed"),
          type: "error",
        });
      }
    });

    return unsubscribe;
  }, [clearSession, setLoading, t]);
}

export function useAuthActions() {
  const { t, i18n } = useTranslation("auth");
  const clearSession = useAuthStore((state) => state.clearSession);

  const login = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmail(email, password);
      await hydrateSessionFromUser(credential.user);
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      toaster.create({
        title: t(mapFirebaseAuthError(code)),
        type: "error",
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const credential = await signInWithGoogle();
      await hydrateSessionFromUser(credential.user);
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      toaster.create({
        title: t(mapFirebaseAuthError(code)),
        type: "error",
      });
      throw error;
    }
  };

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    acceptedTermsAt: string,
  ) => {
    try {
      const credential = await signUpWithEmail(email, password, fullName);
      await ensureMerchantBootstrapped(credential.user, {
        displayName: fullName,
        preferredLanguage: getPreferredLanguage(i18n.language),
        acceptedTermsAt,
      });
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      toaster.create({
        title: t(mapFirebaseAuthError(code)),
        type: "error",
      });
      throw error;
    }
  };

  const signupWithGoogle = async () => {
    try {
      const credential = await signInWithGoogle();
      await ensureMerchantBootstrapped(credential.user, {
        displayName: credential.user.displayName ?? undefined,
        preferredLanguage: getPreferredLanguage(i18n.language),
        acceptedTermsAt: new Date().toISOString(),
      });
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      toaster.create({
        title: t(mapFirebaseAuthError(code)),
        type: "error",
      });
      throw error;
    }
  };

  const logout = async () => {
    await signOutUser();
    clearSession();
  };

  return { login, loginWithGoogle, signup, signupWithGoogle, logout };
}

export function useAuth() {
  useAuthListener();

  const user = useAuthStore((state) => state.user);
  const merchant = useAuthStore((state) => state.merchant);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const actions = useAuthActions();

  return {
    user,
    merchant,
    isLoading,
    isAuthenticated,
    ...actions,
  };
}

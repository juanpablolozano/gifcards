import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  return credential;
}

export async function signOutUser() {
  return signOut(auth);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(onChange: (user: User | null) => void) {
  return onAuthStateChanged(auth, onChange);
}

export async function getIdToken(user: User): Promise<string> {
  return user.getIdToken();
}

export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "errors.invalidCredentials";
    case "auth/email-already-in-use":
      return "errors.emailAlreadyInUse";
    case "auth/weak-password":
      return "errors.weakPassword";
    case "auth/too-many-requests":
      return "errors.tooManyRequests";
    case "auth/popup-closed-by-user":
      return "errors.popupClosed";
    case "auth/network-request-failed":
      return "errors.network";
    case "auth/invalid-email":
      return "errors.validationEmail";
    default:
      return "errors.generic";
  }
}

export function getFirebaseErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return "auth/unknown";
}

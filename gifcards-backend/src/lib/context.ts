import type { Env } from "../env";
import type { FirestoreContext } from "./firestore/client";

export function getFirestoreContext(env: Env): FirestoreContext {
  return {
    projectId: env.FIREBASE_PROJECT_ID,
    serviceAccountJson: env.FIREBASE_SERVICE_ACCOUNT,
  };
}

export function getAppUrl(env: Env): string {
  return env.APP_URL ?? "http://localhost:5173";
}

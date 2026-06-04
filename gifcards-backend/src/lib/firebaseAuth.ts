import { createRemoteJWKSet, jwtVerify } from "jose";

export type VerifiedFirebaseToken = {
  uid: string;
  email: string | null;
};

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export async function verifyIdToken(
  idToken: string,
  projectId: string,
): Promise<VerifiedFirebaseToken> {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = payload.sub;
  if (!uid) {
    throw new Error("Token missing subject");
  }

  const email =
    typeof payload.email === "string" ? payload.email : null;

  return { uid, email };
}

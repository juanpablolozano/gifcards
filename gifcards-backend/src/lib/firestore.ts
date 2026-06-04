import { SignJWT, importPKCS8 } from "jose";
import type { MerchantSession } from "../types/merchant";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { nullValue: null }
  | { timestampValue: string };

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function parseServiceAccount(json: string): ServiceAccount {
  const parsed = JSON.parse(json) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }
  return parsed;
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.token;
  }

  const serviceAccount = parseServiceAccount(serviceAccountJson);
  const privateKey = await importPKCS8(serviceAccount.private_key, "RS256");
  const issuedAt = Math.floor(now / 1000);

  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + 3600)
    .sign(privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain Google access token: ${response.status}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

function getStringField(
  fields: Record<string, FirestoreValue>,
  key: string,
): string | null {
  const value = fields[key];
  if (!value || !("stringValue" in value)) {
    return null;
  }
  return value.stringValue;
}

function getBooleanField(
  fields: Record<string, FirestoreValue>,
  key: string,
): boolean {
  const value = fields[key];
  if (!value || !("booleanValue" in value)) {
    return false;
  }
  return value.booleanValue;
}

function parseMerchantDocument(
  document: FirestoreDocument,
  uid: string,
): MerchantSession {
  const fields = document.fields ?? {};

  return {
    id: uid,
    slug: getStringField(fields, "slug"),
    businessName: getStringField(fields, "businessName"),
    onboardingCompleted: getBooleanField(fields, "onboardingCompleted"),
    preferredLanguage: getStringField(fields, "preferredLanguage"),
  };
}

export async function getMerchantByUid(
  projectId: string,
  serviceAccountJson: string,
  uid: string,
): Promise<MerchantSession | null> {
  const accessToken = await getAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/merchants/${uid}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Firestore read failed: ${response.status}`);
  }

  const document = (await response.json()) as FirestoreDocument;
  return parseMerchantDocument(document, uid);
}

export type MerchantBootstrapInput = {
  uid: string;
  email: string | null;
  displayName?: string;
  preferredLanguage?: "en" | "es";
  acceptedTermsAt?: string;
};

function buildMerchantFields(input: MerchantBootstrapInput): Record<string, FirestoreValue> {
  const now = new Date().toISOString();
  const fields: Record<string, FirestoreValue> = {
    id: { stringValue: input.uid },
    ownerUserId: { stringValue: input.uid },
    onboardingCompleted: { booleanValue: false },
    preferredLanguage: { stringValue: input.preferredLanguage ?? "en" },
    status: { stringValue: "active" },
    slug: { nullValue: null },
    createdAt: { timestampValue: now },
    updatedAt: { timestampValue: now },
  };

  if (input.email) {
    fields.contactEmail = { stringValue: input.email };
  }

  if (input.displayName) {
    fields.businessName = { stringValue: input.displayName };
  }

  if (input.acceptedTermsAt) {
    fields.acceptedTermsAt = { timestampValue: input.acceptedTermsAt };
  }

  return fields;
}

export async function createMerchantBootstrap(
  projectId: string,
  serviceAccountJson: string,
  input: MerchantBootstrapInput,
): Promise<{ merchant: MerchantSession; created: boolean }> {
  const existing = await getMerchantByUid(
    projectId,
    serviceAccountJson,
    input.uid,
  );

  if (existing) {
    return { merchant: existing, created: false };
  }

  const accessToken = await getAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/merchants?documentId=${input.uid}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: buildMerchantFields(input),
    }),
  });

  if (!response.ok) {
    throw new Error(`Firestore create failed: ${response.status}`);
  }

  const document = (await response.json()) as FirestoreDocument;
  return {
    merchant: parseMerchantDocument(document, input.uid),
    created: true,
  };
}

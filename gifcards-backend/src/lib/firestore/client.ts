import { SignJWT, importPKCS8 } from "jose";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

export type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { nullValue: null }
  | { timestampValue: string };

export type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

export type FirestoreContext = {
  projectId: string;
  serviceAccountJson: string;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function parseServiceAccount(json: string): ServiceAccount {
  const parsed = JSON.parse(json) as ServiceAccount;
  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }
  return parsed;
}

export async function getAccessToken(serviceAccountJson: string): Promise<string> {
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

function baseUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

export function encodeString(value: string): FirestoreValue {
  return { stringValue: value };
}

export function encodeBoolean(value: boolean): FirestoreValue {
  return { booleanValue: value };
}

export function encodeInteger(value: number): FirestoreValue {
  return { integerValue: String(Math.trunc(value)) };
}

export function encodeDouble(value: number): FirestoreValue {
  return { doubleValue: value };
}

export function encodeNull(): FirestoreValue {
  return { nullValue: null };
}

export function encodeTimestamp(value: string | Date): FirestoreValue {
  const iso = value instanceof Date ? value.toISOString() : value;
  return { timestampValue: iso };
}

export function getStringField(
  fields: Record<string, FirestoreValue>,
  key: string,
): string | null {
  const value = fields[key];
  if (!value || !("stringValue" in value)) return null;
  return value.stringValue;
}

export function getBooleanField(
  fields: Record<string, FirestoreValue>,
  key: string,
): boolean {
  const value = fields[key];
  if (!value || !("booleanValue" in value)) return false;
  return value.booleanValue;
}

export function getNumberField(
  fields: Record<string, FirestoreValue>,
  key: string,
): number {
  const value = fields[key];
  if (!value) return 0;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  return 0;
}

export function getTimestampField(
  fields: Record<string, FirestoreValue>,
  key: string,
): string | null {
  const value = fields[key];
  if (!value || !("timestampValue" in value)) return null;
  return value.timestampValue;
}

export function getDocumentId(document: FirestoreDocument): string {
  const parts = document.name.split("/");
  return parts[parts.length - 1] ?? "";
}

export async function getDocument(
  ctx: FirestoreContext,
  collection: string,
  id: string,
): Promise<FirestoreDocument | null> {
  const token = await getAccessToken(ctx.serviceAccountJson);
  const url = `${baseUrl(ctx.projectId)}/${collection}/${id}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Firestore get failed: ${response.status}`);
  }
  return (await response.json()) as FirestoreDocument;
}

export async function createDocument(
  ctx: FirestoreContext,
  collection: string,
  id: string,
  fields: Record<string, FirestoreValue>,
): Promise<FirestoreDocument> {
  const token = await getAccessToken(ctx.serviceAccountJson);
  const url = `${baseUrl(ctx.projectId)}/${collection}?documentId=${id}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    throw new Error(`Firestore create failed: ${response.status}`);
  }
  return (await response.json()) as FirestoreDocument;
}

export async function patchDocument(
  ctx: FirestoreContext,
  collection: string,
  id: string,
  fields: Record<string, FirestoreValue>,
): Promise<FirestoreDocument> {
  const token = await getAccessToken(ctx.serviceAccountJson);
  const fieldPaths = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${k}`)
    .join("&");
  const url = `${baseUrl(ctx.projectId)}/${collection}/${id}?${fieldPaths}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!response.ok) {
    throw new Error(`Firestore patch failed: ${response.status}`);
  }
  return (await response.json()) as FirestoreDocument;
}

export type QueryFilter = {
  field: string;
  op: "EQUAL" | "LESS_THAN" | "GREATER_THAN";
  value: FirestoreValue;
};

export type QueryOrder = {
  field: string;
  direction: "ASCENDING" | "DESCENDING";
};

export async function queryCollection(
  ctx: FirestoreContext,
  collection: string,
  filters: QueryFilter[] = [],
  orderBy?: QueryOrder,
  limit?: number,
): Promise<FirestoreDocument[]> {
  const token = await getAccessToken(ctx.serviceAccountJson);
  const url = `${baseUrl(ctx.projectId)}:runQuery`;

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: collection }],
  };

  if (filters.length > 0) {
    if (filters.length === 1) {
      const f = filters[0];
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: f.field },
          op: f.op,
          value: f.value,
        },
      };
    } else {
      structuredQuery.where = {
        compositeFilter: {
          op: "AND",
          filters: filters.map((f) => ({
            fieldFilter: {
              field: { fieldPath: f.field },
              op: f.op,
              value: f.value,
            },
          })),
        },
      };
    }
  }

  if (orderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: orderBy.field },
        direction: orderBy.direction,
      },
    ];
  }

  if (limit) {
    structuredQuery.limit = limit;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structuredQuery }),
  });

  if (!response.ok) {
    throw new Error(`Firestore query failed: ${response.status}`);
  }

  const results = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return results
    .filter((r) => r.document)
    .map((r) => r.document as FirestoreDocument);
}

export type TransactionWrite = {
  collection: string;
  id: string;
  fields: Record<string, FirestoreValue>;
  type: "update" | "create";
};

export async function runTransaction(
  ctx: FirestoreContext,
  writes: TransactionWrite[],
): Promise<void> {
  const token = await getAccessToken(ctx.serviceAccountJson);
  const beginUrl = `${baseUrl(ctx.projectId)}:beginTransaction`;

  const beginResponse = await fetch(beginUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!beginResponse.ok) {
    throw new Error(`Firestore beginTransaction failed: ${beginResponse.status}`);
  }

  const { transaction } = (await beginResponse.json()) as { transaction: string };
  const commitUrl = `${baseUrl(ctx.projectId)}:commit`;

  const commitResponse = await fetch(commitUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transaction,
      writes: writes.map((w) => ({
        ...(w.type === "create"
          ? {
              transform: undefined,
            }
          : {}),
        update: {
          name: `${baseUrl(ctx.projectId)}/${w.collection}/${w.id}`,
          fields: w.fields,
        },
        updateMask: { fieldPaths: Object.keys(w.fields) },
        currentDocument: w.type === "create" ? { exists: false } : { exists: true },
      })),
    }),
  });

  if (!commitResponse.ok) {
    const errText = await commitResponse.text();
    throw new Error(`Firestore commit failed: ${commitResponse.status} ${errText}`);
  }
}

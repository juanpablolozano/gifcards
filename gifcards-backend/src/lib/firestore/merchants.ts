import type { MerchantSession } from "../../types/merchant";
import {
  type FirestoreContext,
  type FirestoreDocument,
  encodeBoolean,
  encodeNull,
  encodeString,
  encodeTimestamp,
  getBooleanField,
  getDocument,
  getStringField,
  createDocument,
  patchDocument,
  queryCollection,
  encodeString as es,
} from "./client";

export type MerchantProfile = MerchantSession & {
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
};

export type MerchantBootstrapInput = {
  uid: string;
  email: string | null;
  displayName?: string;
  preferredLanguage?: "en" | "es";
  acceptedTermsAt?: string;
};

export type UpdateMerchantInput = {
  businessName?: string;
  slug?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  onboardingCompleted?: boolean;
  preferredLanguage?: "en" | "es";
};

function parseMerchantSession(
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

function parseMerchantProfile(
  document: FirestoreDocument,
  uid: string,
): MerchantProfile {
  const fields = document.fields ?? {};
  return {
    ...parseMerchantSession(document, uid),
    logoUrl: getStringField(fields, "logoUrl"),
    primaryColor: getStringField(fields, "primaryColor"),
    secondaryColor: getStringField(fields, "secondaryColor"),
    contactEmail: getStringField(fields, "contactEmail"),
    contactPhone: getStringField(fields, "contactPhone"),
    status: getStringField(fields, "status") ?? "active",
  };
}

export async function getMerchantByUid(
  projectId: string,
  serviceAccountJson: string,
  uid: string,
): Promise<MerchantSession | null> {
  const ctx: FirestoreContext = { projectId, serviceAccountJson };
  const doc = await getDocument(ctx, "merchants", uid);
  if (!doc) return null;
  return parseMerchantSession(doc, uid);
}

export async function getMerchantProfile(
  ctx: FirestoreContext,
  uid: string,
): Promise<MerchantProfile | null> {
  const doc = await getDocument(ctx, "merchants", uid);
  if (!doc) return null;
  return parseMerchantProfile(doc, uid);
}

export async function getMerchantBySlug(
  ctx: FirestoreContext,
  slug: string,
): Promise<MerchantProfile | null> {
  const docs = await queryCollection(ctx, "merchants", [
    { field: "slug", op: "EQUAL", value: es(slug) },
  ]);
  const doc = docs[0];
  if (!doc) return null;
  const id = doc.name.split("/").pop() ?? "";
  return parseMerchantProfile(doc, id);
}

export async function isSlugAvailable(
  ctx: FirestoreContext,
  slug: string,
  excludeMerchantId?: string,
): Promise<boolean> {
  const existing = await getMerchantBySlug(ctx, slug);
  if (!existing) return true;
  return excludeMerchantId ? existing.id === excludeMerchantId : false;
}

function buildMerchantFields(input: MerchantBootstrapInput): Record<string, ReturnType<typeof encodeString>> {
  const now = new Date().toISOString();
  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeBoolean> | ReturnType<typeof encodeNull> | ReturnType<typeof encodeTimestamp>> = {
    id: encodeString(input.uid),
    ownerUserId: encodeString(input.uid),
    onboardingCompleted: encodeBoolean(false),
    preferredLanguage: encodeString(input.preferredLanguage ?? "en"),
    status: encodeString("active"),
    slug: encodeNull(),
    createdAt: encodeTimestamp(now),
    updatedAt: encodeTimestamp(now),
  };

  if (input.email) fields.contactEmail = encodeString(input.email);
  if (input.displayName) fields.businessName = encodeString(input.displayName);
  if (input.acceptedTermsAt) fields.acceptedTermsAt = encodeTimestamp(input.acceptedTermsAt);

  return fields as Record<string, ReturnType<typeof encodeString>>;
}

export async function createMerchantBootstrap(
  projectId: string,
  serviceAccountJson: string,
  input: MerchantBootstrapInput,
): Promise<{ merchant: MerchantSession; created: boolean }> {
  const existing = await getMerchantByUid(projectId, serviceAccountJson, input.uid);
  if (existing) return { merchant: existing, created: false };

  const ctx: FirestoreContext = { projectId, serviceAccountJson };
  const doc = await createDocument(ctx, "merchants", input.uid, buildMerchantFields(input));
  return { merchant: parseMerchantSession(doc, input.uid), created: true };
}

export async function updateMerchant(
  ctx: FirestoreContext,
  merchantId: string,
  input: UpdateMerchantInput,
): Promise<MerchantProfile> {
  const fields: Record<string, ReturnType<typeof encodeString> | ReturnType<typeof encodeBoolean> | ReturnType<typeof encodeTimestamp>> = {
    updatedAt: encodeTimestamp(new Date().toISOString()),
  };

  if (input.businessName !== undefined) fields.businessName = encodeString(input.businessName);
  if (input.slug !== undefined) fields.slug = encodeString(input.slug);
  if (input.logoUrl !== undefined) fields.logoUrl = encodeString(input.logoUrl);
  if (input.primaryColor !== undefined) fields.primaryColor = encodeString(input.primaryColor);
  if (input.secondaryColor !== undefined) fields.secondaryColor = encodeString(input.secondaryColor);
  if (input.contactEmail !== undefined) fields.contactEmail = encodeString(input.contactEmail);
  if (input.contactPhone !== undefined) fields.contactPhone = encodeString(input.contactPhone);
  if (input.onboardingCompleted !== undefined) {
    fields.onboardingCompleted = encodeBoolean(input.onboardingCompleted);
  }
  if (input.preferredLanguage !== undefined) {
    fields.preferredLanguage = encodeString(input.preferredLanguage);
  }

  const doc = await patchDocument(ctx, "merchants", merchantId, fields);
  return parseMerchantProfile(doc, merchantId);
}

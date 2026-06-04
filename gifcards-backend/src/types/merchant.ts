export type MerchantSession = {
  id: string;
  slug: string | null;
  businessName: string | null;
  onboardingCompleted: boolean;
  preferredLanguage: string | null;
};

export type CreateMerchantRequest = {
  displayName?: string;
  preferredLanguage?: "en" | "es";
  acceptedTermsAt?: string;
};

export type SessionUser = {
  uid: string;
  email: string | null;
};

export type SessionResponse = {
  user: SessionUser;
  merchant: MerchantSession | null;
};

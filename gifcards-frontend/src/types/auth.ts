export type AuthUser = {
  uid: string;
  email: string | null;
};

export type MerchantSession = {
  id: string;
  slug: string | null;
  businessName: string | null;
  onboardingCompleted: boolean;
  preferredLanguage: string | null;
};

export type SessionResponse = {
  user: AuthUser;
  merchant: MerchantSession | null;
};

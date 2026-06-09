export type MerchantProfile = {
  id: string;
  slug: string | null;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  onboardingCompleted: boolean;
  preferredLanguage: string | null;
  status?: string;
};

export type UpdateMerchantPayload = {
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

export type PaymentsStatus = {
  mode: string;
  enabled: boolean;
  stripeConnectAvailable: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  message?: string;
};

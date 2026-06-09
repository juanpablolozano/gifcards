import { z } from "zod";

export const updateMerchantSchema = z.object({
  businessName: z.string().min(1).max(120).optional(),
  slug: z.string().min(2).max(48).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
  onboardingCompleted: z.boolean().optional(),
  preferredLanguage: z.enum(["en", "es"]).optional(),
});

export const createGiftCardSchema = z.object({
  name: z.string().min(1).max(120),
  valueType: z.enum(["fixed", "variable"]),
  fixedAmount: z.number().positive().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  message: z.string().max(500).optional(),
  status: z.enum(["draft", "active", "paused", "archived"]).optional(),
});

export const updateGiftCardSchema = createGiftCardSchema.partial();

export const checkoutSessionSchema = z.object({
  giftCardId: z.string().min(1),
  merchantSlug: z.string().min(1),
  amount: z.number().positive(),
  buyerEmail: z.string().email(),
  isGift: z.boolean().optional(),
  recipientEmail: z.string().email().optional(),
  recipientName: z.string().max(120).optional(),
  giftMessage: z.string().max(500).optional(),
});

export const redeemSchema = z.object({
  issuedCardId: z.string().min(1),
  amount: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const presignSchema = z.object({
  purpose: z.enum(["logo", "preview"]),
  contentType: z.string().min(1),
  fileName: z.string().min(1),
});

export const walletMagicLinkSchema = z.object({
  email: z.string().email(),
});

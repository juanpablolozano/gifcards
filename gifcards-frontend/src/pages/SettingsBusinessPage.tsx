import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { toaster } from "../lib/toaster";
import {
  checkSlugAvailability,
  getMerchantProfile,
  updateMerchant,
} from "../services/merchantService";
import { getPresignedUploadUrl, uploadFileToS3 } from "../services/uploadService";
import { useAuthStore } from "../stores/authStore";

const businessSchema = z.object({
  businessName: z.string().min(1).max(120),
  slug: z.string().min(2).max(48).regex(/^[a-z0-9-]+$/),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(30).optional().or(z.literal("")),
});

const defaultPrimaryColor = "#4F46E5";
const defaultSecondaryColor = "#10B981";

export function SettingsBusinessPage() {
  const { t } = useTranslation("dashboard");
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [initialSlug, setInitialSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(defaultPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultSecondaryColor);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!idToken || !merchant) return;

    getMerchantProfile(idToken, merchant.id)
      .then((profile) => {
        setBusinessName(profile.businessName ?? "");
        setSlug(profile.slug ?? "");
        setInitialSlug(profile.slug ?? "");
        setLogoUrl(profile.logoUrl ?? "");
        setPrimaryColor(profile.primaryColor ?? defaultPrimaryColor);
        setSecondaryColor(profile.secondaryColor ?? defaultSecondaryColor);
        setContactEmail(profile.contactEmail ?? "");
        setContactPhone(profile.contactPhone ?? "");
      })
      .catch(() => {
        toaster.create({ title: t("settings.loadError"), type: "error" });
      })
      .finally(() => setIsLoading(false));
  }, [idToken, merchant, t]);

  useEffect(() => {
    if (!idToken || !slug || slug === initialSlug) {
      setSlugAvailable(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      checkSlugAvailability(idToken, slug)
        .then((result) => setSlugAvailable(result.available))
        .catch(() => setSlugAvailable(null));
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [idToken, initialSlug, slug]);

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !idToken) return;

    setIsUploadingLogo(true);
    try {
      const presigned = await getPresignedUploadUrl(idToken, {
        purpose: "logo",
        contentType: file.type,
        fileName: file.name,
      });
      await uploadFileToS3(presigned.uploadUrl, file);
      setLogoUrl(presigned.publicUrl);
    } catch {
      toaster.create({ title: t("settings.uploadError"), type: "error" });
    } finally {
      setIsUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!idToken || !merchant) return;

    const parsed = businessSchema.safeParse({
      businessName,
      slug,
      primaryColor,
      secondaryColor,
      contactEmail,
      contactPhone,
    });

    if (!parsed.success) {
      toaster.create({ title: t("settings.validationError"), type: "error" });
      return;
    }

    if (slug !== initialSlug && slugAvailable === false) {
      toaster.create({ title: t("settings.slugTaken"), type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateMerchant(idToken, merchant.id, {
        businessName: parsed.data.businessName,
        slug: parsed.data.slug,
        logoUrl: logoUrl || undefined,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        contactEmail: parsed.data.contactEmail || undefined,
        contactPhone: parsed.data.contactPhone || undefined,
      });

      setInitialSlug(updated.slug ?? slug);
      if (user) {
        setSession({
          user,
          idToken,
          merchant: {
            ...merchant,
            businessName: updated.businessName,
            slug: updated.slug,
            preferredLanguage: updated.preferredLanguage,
            onboardingCompleted: updated.onboardingCompleted,
          },
        });
      }

      toaster.create({ title: t("settings.saveSuccess"), type: "success" });
    } catch {
      toaster.create({ title: t("settings.saveError"), type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={(event) => void handleSubmit(event)}
      bg="white"
      borderWidth="1px"
      borderColor="border"
      borderRadius="card"
      p={{ base: 6, md: 8 }}
    >
      <VStack align="stretch" gap={6}>
        <Heading size="md" color="primary">
          {t("settings.businessTitle")}
        </Heading>

        {slug !== initialSlug ? (
          <Text fontSize="sm" color="orange.600">
            {t("settings.slugWarning")}
          </Text>
        ) : null}

        <Field.Root required>
          <Field.Label color="primary">{t("settings.businessName")}</Field.Label>
          <Input
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            bg="surface"
            borderColor="border"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label color="primary">{t("settings.slug")}</Field.Label>
          <Input
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            bg="surface"
            borderColor="border"
          />
          {slug !== initialSlug && slugAvailable !== null ? (
            <Field.HelperText color={slugAvailable ? "green.600" : "red.500"}>
              {slugAvailable ? t("settings.slugAvailable") : t("settings.slugTaken")}
            </Field.HelperText>
          ) : (
            <Field.HelperText>{t("settings.slugHint")}</Field.HelperText>
          )}
        </Field.Root>

        <Field.Root>
          <Field.Label color="primary">{t("settings.logo")}</Field.Label>
          <HStack gap={4} align="center">
            {logoUrl ? (
              <Image src={logoUrl} alt="" boxSize="64px" objectFit="contain" borderRadius="md" />
            ) : null}
            <Input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              display="none"
              onChange={(event) => void handleLogoChange(event)}
            />
            <Button
              variant="outline"
              loading={isUploadingLogo}
              onClick={() => logoInputRef.current?.click()}
            >
              {t("settings.uploadLogo")}
            </Button>
          </HStack>
        </Field.Root>

        <HStack gap={4} align="start">
          <Field.Root flex="1">
            <Field.Label color="primary">{t("settings.primaryColor")}</Field.Label>
            <Input
              type="color"
              value={primaryColor}
              onChange={(event) => setPrimaryColor(event.target.value)}
              p={1}
              h="44px"
            />
          </Field.Root>
          <Field.Root flex="1">
            <Field.Label color="primary">{t("settings.secondaryColor")}</Field.Label>
            <Input
              type="color"
              value={secondaryColor}
              onChange={(event) => setSecondaryColor(event.target.value)}
              p={1}
              h="44px"
            />
          </Field.Root>
        </HStack>

        <Field.Root>
          <Field.Label color="primary">{t("settings.contactEmail")}</Field.Label>
          <Input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            bg="surface"
            borderColor="border"
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="primary">{t("settings.contactPhone")}</Field.Label>
          <Input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            bg="surface"
            borderColor="border"
          />
        </Field.Root>

        <Button
          type="submit"
          alignSelf="flex-start"
          bg="secondary"
          color="white"
          _hover={{ bg: "#4338CA" }}
          loading={isSaving}
        >
          {t("settings.save")}
        </Button>
      </VStack>
    </Box>
  );
}

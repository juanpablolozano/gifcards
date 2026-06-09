import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { toaster } from "../lib/toaster";
import {
  checkSlugAvailability,
  updateMerchant,
} from "../services/merchantService";
import {
  getPresignedUploadUrl,
  uploadFileToS3,
} from "../services/uploadService";
import { useAuthStore } from "../stores/authStore";

const onboardingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

function slugifyBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);
  const user = useAuthStore((state) => state.user);

  const [businessName, setBusinessName] = useState(merchant?.businessName ?? "");
  const [slug, setSlug] = useState(merchant?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(merchant?.slug));
  const [primaryColor, setPrimaryColor] = useState("#111827");
  const [secondaryColor, setSecondaryColor] = useState("#4F46E5");
  const [logoUrl, setLogoUrl] = useState("");
  const [useLogoUrl, setUseLogoUrl] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (merchant?.onboardingCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [merchant?.onboardingCompleted, navigate]);

  useEffect(() => {
    if (!slugTouched && businessName) {
      setSlug(slugifyBusinessName(businessName));
    }
  }, [businessName, slugTouched]);

  const handleLogoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !idToken) {
      return;
    }

    try {
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl(idToken, {
        purpose: "logo",
        contentType: file.type,
        fileName: file.name,
      });
      await uploadFileToS3(uploadUrl, file);
      setLogoUrl(publicUrl);
      setUseLogoUrl(false);
      toaster.create({
        title: "Logo uploaded",
        type: "success",
      });
    } catch {
      setUseLogoUrl(true);
      toaster.create({
        title: "Upload unavailable",
        description: "Enter a logo URL instead.",
        type: "warning",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    if (!idToken || !merchant?.id) {
      toaster.create({
        title: "Session expired",
        description: "Please log in again.",
        type: "error",
      });
      return;
    }

    const parsed = onboardingSchema.safeParse({
      businessName,
      slug,
      primaryColor,
      secondaryColor,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0]);
        errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const availability = await checkSlugAvailability(idToken, parsed.data.slug);
      if (!availability.available) {
        setFieldErrors({ slug: "This storefront URL is already taken" });
        return;
      }

      const profile = await updateMerchant(idToken, merchant.id, {
        businessName: parsed.data.businessName,
        slug: parsed.data.slug,
        primaryColor: parsed.data.primaryColor,
        secondaryColor: parsed.data.secondaryColor,
        logoUrl: logoUrl || undefined,
        onboardingCompleted: true,
      });

      if (user) {
        useAuthStore.getState().setSession({
          user,
          idToken,
          merchant: {
            id: merchant.id,
            slug: profile.slug,
            businessName: profile.businessName,
            onboardingCompleted: true,
            preferredLanguage: merchant.preferredLanguage,
          },
        });
      }

      toaster.create({
        title: "Welcome aboard!",
        description: "Your business profile is ready.",
        type: "success",
      });
      navigate("/dashboard", { replace: true });
    } catch {
      toaster.create({
        title: "Could not complete onboarding",
        description: "Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="surface" px={4} py={8}>
      <Box maxW="720px" mx="auto">
        <VStack gap={6} align="stretch">
          <VStack gap={1} align="start">
            <Heading size="xl" color="primary">
              Set up your business
            </Heading>
            <Text color="textSecondary">
              Tell us about your brand so customers recognize your gift cards.
            </Text>
          </VStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="white"
            borderWidth="1px"
            borderColor="border"
            borderRadius="card"
            boxShadow="sm"
            p={{ base: 6, md: 8 }}
          >
            <VStack gap={5} align="stretch">
              <Field.Root invalid={Boolean(fieldErrors.businessName)}>
                <Field.Label color="primary">Business name</Field.Label>
                <Input
                  value={businessName}
                  placeholder="Acme Coffee Shop"
                  bg="surface"
                  borderColor="border"
                  onChange={(event) => setBusinessName(event.target.value)}
                />
                {fieldErrors.businessName ? (
                  <Field.ErrorText>{fieldErrors.businessName}</Field.ErrorText>
                ) : null}
              </Field.Root>

              <Field.Root invalid={Boolean(fieldErrors.slug)}>
                <Field.Label color="primary">Storefront URL</Field.Label>
                <Flex align="center" gap={2}>
                  <Text color="textSecondary" fontSize="sm" flexShrink={0}>
                    gifcards.app/
                  </Text>
                  <Input
                    value={slug}
                    placeholder="acme-coffee"
                    bg="surface"
                    borderColor="border"
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(event.target.value);
                    }}
                  />
                </Flex>
                {fieldErrors.slug ? (
                  <Field.ErrorText>{fieldErrors.slug}</Field.ErrorText>
                ) : null}
              </Field.Root>

              <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                <Field.Root flex="1" invalid={Boolean(fieldErrors.primaryColor)}>
                  <Field.Label color="primary">Primary color</Field.Label>
                  <Flex gap={2} align="center">
                    <Input
                      type="color"
                      value={primaryColor}
                      w="48px"
                      h="40px"
                      p={1}
                      borderColor="border"
                      onChange={(event) => setPrimaryColor(event.target.value)}
                    />
                    <Input
                      value={primaryColor}
                      bg="surface"
                      borderColor="border"
                      onChange={(event) => setPrimaryColor(event.target.value)}
                    />
                  </Flex>
                </Field.Root>

                <Field.Root flex="1" invalid={Boolean(fieldErrors.secondaryColor)}>
                  <Field.Label color="primary">Secondary color</Field.Label>
                  <Flex gap={2} align="center">
                    <Input
                      type="color"
                      value={secondaryColor}
                      w="48px"
                      h="40px"
                      p={1}
                      borderColor="border"
                      onChange={(event) => setSecondaryColor(event.target.value)}
                    />
                    <Input
                      value={secondaryColor}
                      bg="surface"
                      borderColor="border"
                      onChange={(event) => setSecondaryColor(event.target.value)}
                    />
                  </Flex>
                </Field.Root>
              </Flex>

              <Field.Root>
                <Field.Label color="primary">Logo (optional)</Field.Label>
                <Input
                  type="file"
                  accept="image/*"
                  borderColor="border"
                  onChange={handleLogoFileChange}
                />
                {useLogoUrl ? (
                  <Input
                    mt={2}
                    value={logoUrl}
                    placeholder="https://example.com/logo.png"
                    bg="surface"
                    borderColor="border"
                    onChange={(event) => setLogoUrl(event.target.value)}
                  />
                ) : null}
                {logoUrl && !useLogoUrl ? (
                  <Text fontSize="sm" color="accent" mt={1}>
                    Logo ready
                  </Text>
                ) : null}
              </Field.Root>

              <Box>
                <Text fontSize="sm" color="textSecondary" mb={2}>
                  Preview
                </Text>
                <GiftCardPreview
                  name="Gift Card"
                  amount="$25.00"
                  merchantName={businessName || "Your Business"}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                />
              </Box>

              <Button
                type="submit"
                width="full"
                bg="secondary"
                color="white"
                _hover={{ bg: "#4338CA" }}
                loading={isSubmitting}
              >
                Complete setup
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

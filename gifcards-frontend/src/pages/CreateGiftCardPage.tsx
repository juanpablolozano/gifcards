import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  Input,
  SegmentGroup,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { toaster } from "../lib/toaster";
import { createGiftCard } from "../services/giftCardService";
import { useAuthStore } from "../stores/authStore";
import { useGiftCardWizardStore } from "../stores/giftCardWizardStore";
import type { CreateGiftCardPayload } from "../types/giftCard";

const STEPS = [
  { id: 1, label: "Value" },
  { id: 2, label: "Design" },
  { id: 3, label: "Publish" },
];

function formatPreviewAmount(
  valueType: "fixed" | "variable",
  fixedAmount: string,
  minAmount: string,
  maxAmount: string,
): string {
  if (valueType === "fixed") {
    const amount = Number.parseFloat(fixedAmount);
    if (Number.isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  }

  const min = Number.parseFloat(minAmount);
  const max = Number.parseFloat(maxAmount);
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  if (Number.isNaN(min) || Number.isNaN(max)) return "$0.00 – $0.00";
  return `${formatter.format(min)} – ${formatter.format(max)}`;
}

function buildPayload(
  state: ReturnType<typeof useGiftCardWizardStore.getState>,
  status: "active" = "active",
): CreateGiftCardPayload {
  const payload: CreateGiftCardPayload = {
    name: state.name.trim(),
    valueType: state.valueType,
    message: state.message.trim() || undefined,
    currency: "USD",
    status,
  };

  if (state.valueType === "fixed") {
    payload.fixedAmount = Number.parseFloat(state.fixedAmount);
  } else {
    payload.minAmount = Number.parseFloat(state.minAmount);
    payload.maxAmount = Number.parseFloat(state.maxAmount);
  }

  return payload;
}

function validateStep1(state: ReturnType<typeof useGiftCardWizardStore.getState>): string | null {
  if (!state.name.trim()) return "Gift card name is required.";

  if (state.valueType === "fixed") {
    const amount = Number.parseFloat(state.fixedAmount);
    if (Number.isNaN(amount) || amount <= 0) return "Enter a valid fixed amount.";
    return null;
  }

  const min = Number.parseFloat(state.minAmount);
  const max = Number.parseFloat(state.maxAmount);
  if (Number.isNaN(min) || min <= 0) return "Enter a valid minimum amount.";
  if (Number.isNaN(max) || max <= 0) return "Enter a valid maximum amount.";
  if (min >= max) return "Maximum amount must be greater than minimum.";
  return null;
}

export function CreateGiftCardPage() {
  const navigate = useNavigate();
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);

  const step = useGiftCardWizardStore((state) => state.step);
  const name = useGiftCardWizardStore((state) => state.name);
  const valueType = useGiftCardWizardStore((state) => state.valueType);
  const fixedAmount = useGiftCardWizardStore((state) => state.fixedAmount);
  const minAmount = useGiftCardWizardStore((state) => state.minAmount);
  const maxAmount = useGiftCardWizardStore((state) => state.maxAmount);
  const message = useGiftCardWizardStore((state) => state.message);
  const publishedCardId = useGiftCardWizardStore((state) => state.publishedCardId);
  const publicUrl = useGiftCardWizardStore((state) => state.publicUrl);

  const setStep = useGiftCardWizardStore((state) => state.setStep);
  const setName = useGiftCardWizardStore((state) => state.setName);
  const setValueType = useGiftCardWizardStore((state) => state.setValueType);
  const setFixedAmount = useGiftCardWizardStore((state) => state.setFixedAmount);
  const setMinAmount = useGiftCardWizardStore((state) => state.setMinAmount);
  const setMaxAmount = useGiftCardWizardStore((state) => state.setMaxAmount);
  const setMessage = useGiftCardWizardStore((state) => state.setMessage);
  const setPublished = useGiftCardWizardStore((state) => state.setPublished);
  const reset = useGiftCardWizardStore((state) => state.reset);

  const [stepError, setStepError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    reset();
  }, [reset]);

  const previewAmount = useMemo(
    () => formatPreviewAmount(valueType, fixedAmount, minAmount, maxAmount),
    [valueType, fixedAmount, minAmount, maxAmount],
  );

  const handleNext = () => {
    const state = useGiftCardWizardStore.getState();
    if (step === 1) {
      const error = validateStep1(state);
      if (error) {
        setStepError(error);
        return;
      }
    }
    setStepError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setStepError(null);
    setStep(step - 1);
  };

  const handlePublish = async () => {
    if (!idToken) return;

    const state = useGiftCardWizardStore.getState();
    const error = validateStep1(state);
    if (error) {
      setStepError(error);
      setStep(1);
      return;
    }

    setIsPublishing(true);
    setStepError(null);

    try {
      const card = await createGiftCard(idToken, buildPayload(state));
      setPublished(card.id, card.publicUrl ?? "");
      toaster.create({
        title: "Gift card published",
        description: "Your gift card is now live.",
        type: "success",
      });
    } catch {
      toaster.create({
        title: "Failed to publish gift card",
        type: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toaster.create({ title: "Link copied", type: "success" });
    } catch {
      toaster.create({ title: "Could not copy link", type: "error" });
    }
  };

  return (
    <VStack align="stretch" gap={6}>
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 6, md: 8 }}
      >
        <VStack align="stretch" gap={6}>
          <VStack align="start" gap={1}>
            <Heading size="md" color="primary">
              Create gift card
            </Heading>
            <Text color="textSecondary">
              Set the value, design your card, and publish it to your storefront.
            </Text>
          </VStack>

          <Flex gap={2} flexWrap="wrap">
            {STEPS.map((wizardStep) => {
              const isActive = step === wizardStep.id;
              const isComplete = step > wizardStep.id || Boolean(publishedCardId);
              return (
                <Flex
                  key={wizardStep.id}
                  align="center"
                  gap={2}
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={isActive ? "secondary" : isComplete ? "green.50" : "surface"}
                  color={isActive ? "white" : isComplete ? "green.700" : "textSecondary"}
                  fontSize="sm"
                  fontWeight="600"
                >
                  <Text>{wizardStep.id}</Text>
                  <Text>{wizardStep.label}</Text>
                </Flex>
              );
            })}
          </Flex>

          {stepError && (
            <Text color="red.500" fontSize="sm">
              {stepError}
            </Text>
          )}

          {step === 1 && (
            <VStack align="stretch" gap={4}>
              <Field.Root required>
                <Field.Label color="primary">Gift card name</Field.Label>
                <Input
                  value={name}
                  placeholder="e.g. Holiday Special"
                  bg="surface"
                  borderColor="border"
                  onChange={(event) => setName(event.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="primary">Value type</Field.Label>
                <SegmentGroup.Root
                  value={valueType}
                  onValueChange={(details) => {
                    if (details.value === "fixed" || details.value === "variable") {
                      setValueType(details.value);
                    }
                  }}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item value="fixed">
                    <SegmentGroup.ItemText>Fixed amount</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item value="variable">
                    <SegmentGroup.ItemText>Variable amount</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
              </Field.Root>

              {valueType === "fixed" ? (
                <Field.Root required>
                  <Field.Label color="primary">Amount (USD)</Field.Label>
                  <Input
                    type="number"
                    min={1}
                    step="0.01"
                    value={fixedAmount}
                    bg="surface"
                    borderColor="border"
                    onChange={(event) => setFixedAmount(event.target.value)}
                  />
                </Field.Root>
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Field.Root required>
                    <Field.Label color="primary">Minimum (USD)</Field.Label>
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      value={minAmount}
                      bg="surface"
                      borderColor="border"
                      onChange={(event) => setMinAmount(event.target.value)}
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label color="primary">Maximum (USD)</Field.Label>
                    <Input
                      type="number"
                      min={1}
                      step="0.01"
                      value={maxAmount}
                      bg="surface"
                      borderColor="border"
                      onChange={(event) => setMaxAmount(event.target.value)}
                    />
                  </Field.Root>
                </Grid>
              )}
            </VStack>
          )}

          {step === 2 && (
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label color="primary">Personal message</Field.Label>
                <Field.HelperText color="textSecondary">
                  Optional message shown on the gift card preview.
                </Field.HelperText>
                <Textarea
                  value={message}
                  placeholder="Thank you for your support!"
                  bg="surface"
                  borderColor="border"
                  rows={4}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </Field.Root>

              <GiftCardPreview
                name={name}
                amount={previewAmount}
                message={message}
                merchantName={merchant?.businessName ?? undefined}
              />
            </VStack>
          )}

          {step === 3 && !publishedCardId && (
            <VStack align="stretch" gap={4}>
              <GiftCardPreview
                name={name}
                amount={previewAmount}
                message={message}
                merchantName={merchant?.businessName ?? undefined}
              />
              <Text color="textSecondary" fontSize="sm">
                Review your gift card before publishing. You can edit it later from the gift cards
                list.
              </Text>
            </VStack>
          )}

          {publishedCardId && (
            <VStack align="stretch" gap={4}>
              <Box
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="md"
                p={4}
              >
                <Heading size="sm" color="green.800" mb={2}>
                  Gift card published
                </Heading>
                <Text color="green.700" fontSize="sm">
                  Your gift card is live and ready to share.
                </Text>
              </Box>

              {publicUrl && (
                <Field.Root>
                  <Field.Label color="primary">Public link</Field.Label>
                  <Flex gap={2}>
                    <Input value={publicUrl} readOnly bg="surface" borderColor="border" />
                    <Button variant="outline" onClick={handleCopyLink}>
                      Copy
                    </Button>
                  </Flex>
                </Field.Root>
              )}

              <Flex gap={3} flexWrap="wrap">
                <Button
                  bg="secondary"
                  color="white"
                  _hover={{ bg: "#4338CA" }}
                  onClick={() => navigate(`/gift-cards/${publishedCardId}`)}
                >
                  View details
                </Button>
                <Button variant="outline" onClick={() => navigate("/gift-cards")}>
                  Back to gift cards
                </Button>
              </Flex>
            </VStack>
          )}

          {!publishedCardId && (
            <Flex justify="space-between" gap={3} flexWrap="wrap">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <RouterLink to="/gift-cards">Cancel</RouterLink>
                </Button>
              )}

              {step < 3 ? (
                <Button bg="secondary" color="white" _hover={{ bg: "#4338CA" }} onClick={handleNext}>
                  Continue
                </Button>
              ) : (
                <Button
                  bg="secondary"
                  color="white"
                  _hover={{ bg: "#4338CA" }}
                  loading={isPublishing}
                  onClick={handlePublish}
                >
                  Publish gift card
                </Button>
              )}
            </Flex>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}

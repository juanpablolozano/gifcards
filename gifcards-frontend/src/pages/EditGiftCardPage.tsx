import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  Heading,
  Input,
  SegmentGroup,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { toaster } from "../lib/toaster";
import { getGiftCard, updateGiftCard } from "../services/giftCardService";
import { useAuthStore } from "../stores/authStore";
import type { CreateGiftCardPayload, GiftCardDetail, ValueType } from "../types/giftCard";

function formatPreviewAmount(
  valueType: ValueType,
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

function validateForm(
  name: string,
  valueType: ValueType,
  fixedAmount: string,
  minAmount: string,
  maxAmount: string,
): string | null {
  if (!name.trim()) return "Gift card name is required.";

  if (valueType === "fixed") {
    const amount = Number.parseFloat(fixedAmount);
    if (Number.isNaN(amount) || amount <= 0) return "Enter a valid fixed amount.";
    return null;
  }

  const min = Number.parseFloat(minAmount);
  const max = Number.parseFloat(maxAmount);
  if (Number.isNaN(min) || min <= 0) return "Enter a valid minimum amount.";
  if (Number.isNaN(max) || max <= 0) return "Enter a valid maximum amount.";
  if (min >= max) return "Maximum amount must be greater than minimum.";
  return null;
}

function cardToForm(card: GiftCardDetail) {
  return {
    name: card.name,
    valueType: card.valueType,
    fixedAmount: card.fixedAmount != null ? String(card.fixedAmount) : "50",
    minAmount: card.minAmount != null ? String(card.minAmount) : "25",
    maxAmount: card.maxAmount != null ? String(card.maxAmount) : "500",
    message: card.message ?? "",
  };
}

export function EditGiftCardPage() {
  const { id: cardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [valueType, setValueType] = useState<ValueType>("fixed");
  const [fixedAmount, setFixedAmount] = useState("50");
  const [minAmount, setMinAmount] = useState("25");
  const [maxAmount, setMaxAmount] = useState("500");
  const [message, setMessage] = useState("");

  const loadCard = useCallback(async () => {
    if (!idToken || !cardId) return;

    setIsLoading(true);
    setLoadError(null);

    try {
      const card = await getGiftCard(idToken, cardId);
      const form = cardToForm(card);
      setName(form.name);
      setValueType(form.valueType);
      setFixedAmount(form.fixedAmount);
      setMinAmount(form.minAmount);
      setMaxAmount(form.maxAmount);
      setMessage(form.message);
    } catch {
      setLoadError("Could not load gift card.");
    } finally {
      setIsLoading(false);
    }
  }, [cardId, idToken]);

  useEffect(() => {
    void loadCard();
  }, [loadCard]);

  const previewAmount = useMemo(
    () => formatPreviewAmount(valueType, fixedAmount, minAmount, maxAmount),
    [valueType, fixedAmount, minAmount, maxAmount],
  );

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!idToken || !cardId) return;

    const error = validateForm(name, valueType, fixedAmount, minAmount, maxAmount);
    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    setIsSaving(true);

    const payload: Partial<CreateGiftCardPayload> = {
      name: name.trim(),
      valueType,
      message: message.trim() || undefined,
    };

    if (valueType === "fixed") {
      payload.fixedAmount = Number.parseFloat(fixedAmount);
      payload.minAmount = undefined;
      payload.maxAmount = undefined;
    } else {
      payload.minAmount = Number.parseFloat(minAmount);
      payload.maxAmount = Number.parseFloat(maxAmount);
      payload.fixedAmount = undefined;
    }

    try {
      await updateGiftCard(idToken, cardId, payload);
      toaster.create({ title: "Gift card updated", type: "success" });
      navigate(`/gift-cards/${cardId}`);
    } catch {
      toaster.create({ title: "Failed to update gift card", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="240px">
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        title="Gift card not found"
        description={loadError}
        action={
          <Button asChild variant="outline">
            <RouterLink to="/gift-cards">Back to gift cards</RouterLink>
          </Button>
        }
      />
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Box
        as="form"
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 6, md: 8 }}
        onSubmit={handleSave}
      >
        <VStack align="stretch" gap={6}>
          <VStack align="start" gap={1}>
            <Heading size="md" color="primary">
              Edit gift card
            </Heading>
            <Text color="textSecondary">
              Update the value, message, and preview for this gift card.
            </Text>
          </VStack>

          {formError && (
            <Text color="red.500" fontSize="sm">
              {formError}
            </Text>
          )}

          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            <VStack align="stretch" gap={4}>
              <Field.Root required>
                <Field.Label color="primary">Gift card name</Field.Label>
                <Input
                  value={name}
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
                <Grid templateColumns="1fr 1fr" gap={4}>
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

              <Field.Root>
                <Field.Label color="primary">Personal message</Field.Label>
                <Textarea
                  value={message}
                  bg="surface"
                  borderColor="border"
                  rows={4}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </Field.Root>
            </VStack>

            <GiftCardPreview
              name={name}
              amount={previewAmount}
              message={message}
              merchantName={merchant?.businessName ?? undefined}
            />
          </Grid>

          <Flex justify="space-between" gap={3} flexWrap="wrap">
            <Button asChild variant="outline">
              <RouterLink to={`/gift-cards/${cardId}`}>Cancel</RouterLink>
            </Button>
            <Button
              type="submit"
              bg="secondary"
              color="white"
              _hover={{ bg: "#4338CA" }}
              loading={isSaving}
            >
              Save changes
            </Button>
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
}

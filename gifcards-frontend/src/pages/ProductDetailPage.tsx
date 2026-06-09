import {
  Button,
  Container,
  Field,
  Heading,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { EmptyState } from "../components/shared/EmptyState";
import { ApiError } from "../lib/apiClient";
import { getStorefrontCard } from "../services/storefrontService";
import { useCheckoutStore } from "../stores/checkoutStore";
import type { GiftCard } from "../types/giftCard";

type ProductData = {
  merchant: {
    slug: string | null;
    businessName: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  giftCard: GiftCard;
};

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function ProductDetailPage() {
  const { merchantSlug: slug, cardId } = useParams<{ merchantSlug: string; cardId: string }>();
  const navigate = useNavigate();
  const setCart = useCheckoutStore((state) => state.setCart);

  const [data, setData] = useState<ProductData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !cardId) {
      setError("not_found");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getStorefrontCard(slug, cardId)
      .then((response) => {
        if (cancelled) return;
        setData(response);
        if (response.giftCard.valueType === "fixed" && response.giftCard.fixedAmount != null) {
          setAmount(String(response.giftCard.fixedAmount));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.code : "not_found");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, cardId]);

  const parsedAmount = useMemo(() => Number.parseFloat(amount), [amount]);

  const handleContinue = () => {
    if (!data || !slug) return;

    const { giftCard, merchant } = data;

    if (giftCard.valueType === "fixed") {
      if (giftCard.fixedAmount == null) {
        setAmountError("Invalid gift card amount");
        return;
      }
    } else {
      const min = giftCard.minAmount ?? 0;
      const max = giftCard.maxAmount ?? Infinity;
      if (Number.isNaN(parsedAmount) || parsedAmount < min || parsedAmount > max) {
        setAmountError(
          max === Infinity
            ? `Enter an amount of at least ${formatMoney(min, giftCard.currency)}`
            : `Enter an amount between ${formatMoney(min, giftCard.currency)} and ${formatMoney(max, giftCard.currency)}`,
        );
        return;
      }
    }

    const finalAmount =
      giftCard.valueType === "fixed" ? giftCard.fixedAmount! : parsedAmount;

    setAmountError(null);
    setCart({
      giftCardId: giftCard.id,
      merchantSlug: slug,
      merchantName: merchant.businessName ?? "Gift Cards",
      giftCardName: giftCard.name,
      amount: finalAmount,
      currency: giftCard.currency,
    });
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <VStack minH="60vh" justify="center">
        <Spinner size="lg" color="secondary" />
      </VStack>
    );
  }

  if (error || !data) {
    return (
      <Container maxW="lg" py={16}>
        <EmptyState
          title="Gift card not found"
          description="This gift card is unavailable or no longer exists."
        />
      </Container>
    );
  }

  const { giftCard, merchant } = data;
  const displayAmount = Number.isNaN(parsedAmount)
    ? giftCard.valueType === "fixed" && giftCard.fixedAmount != null
      ? formatMoney(giftCard.fixedAmount, giftCard.currency)
      : formatMoney(0, giftCard.currency)
    : formatMoney(parsedAmount, giftCard.currency);

  return (
    <Container maxW="md" py={10}>
      <VStack gap={8} align="stretch">
        <VStack gap={1} align="start">
          <Heading size="lg" color="primary">
            {giftCard.name}
          </Heading>
          {giftCard.message ? (
            <Text color="textSecondary">{giftCard.message}</Text>
          ) : null}
        </VStack>

        <GiftCardPreview
          name={giftCard.name}
          amount={displayAmount}
          message={giftCard.message ?? undefined}
          merchantName={merchant.businessName ?? undefined}
          primaryColor={merchant.primaryColor}
          secondaryColor={merchant.secondaryColor}
        />

        {giftCard.valueType === "variable" ? (
          <Field.Root invalid={Boolean(amountError)}>
            <Field.Label color="primary">Amount</Field.Label>
            <Input
              type="number"
              min={giftCard.minAmount ?? 0}
              max={giftCard.maxAmount ?? undefined}
              step="0.01"
              value={amount}
              bg="white"
              borderColor="border"
              onChange={(event) => {
                setAmount(event.target.value);
                setAmountError(null);
              }}
            />
            <Field.HelperText color="textSecondary">
              {giftCard.maxAmount != null
                ? `${formatMoney(giftCard.minAmount ?? 0, giftCard.currency)} – ${formatMoney(giftCard.maxAmount, giftCard.currency)}`
                : `Minimum ${formatMoney(giftCard.minAmount ?? 0, giftCard.currency)}`}
            </Field.HelperText>
            {amountError ? <Field.ErrorText>{amountError}</Field.ErrorText> : null}
          </Field.Root>
        ) : (
          <Text color="textSecondary">
            Fixed amount: {formatMoney(giftCard.fixedAmount ?? 0, giftCard.currency)}
          </Text>
        )}

        <Button
          width="full"
          bg="secondary"
          color="white"
          _hover={{ bg: "#4338CA" }}
          onClick={handleContinue}
        >
          Continue to checkout
        </Button>
      </VStack>
    </Container>
  );
}

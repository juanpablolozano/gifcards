import {
  Box,
  Container,
  Heading,
  Image,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { ApiError } from "../lib/apiClient";
import { getStorefront } from "../services/storefrontService";
import type { StorefrontResponse } from "../types/storefront";

const RESERVED_SLUGS = new Set([
  "dashboard",
  "gift-cards",
  "redeem",
  "transactions",
  "analytics",
  "settings",
  "checkout",
  "gift",
  "wallet",
  "login",
  "signup",
  "onboarding",
  "forgot-password",
]);

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

function formatCardPrice(
  card: StorefrontResponse["giftCards"][number],
): string {
  if (card.valueType === "fixed" && card.fixedAmount != null) {
    return formatMoney(card.fixedAmount, card.currency);
  }
  const min = card.minAmount ?? 0;
  const max = card.maxAmount;
  if (max != null) {
    return `${formatMoney(min, card.currency)} – ${formatMoney(max, card.currency)}`;
  }
  return `From ${formatMoney(min, card.currency)}`;
}

export function StorefrontPage() {
  const { merchantSlug } = useParams<{ merchantSlug: string }>();
  const [data, setData] = useState<StorefrontResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (merchantSlug && RESERVED_SLUGS.has(merchantSlug)) return;
    if (!merchantSlug) {
      setError("Store not found");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getStorefront(merchantSlug)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.code : "storefront_failed");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [merchantSlug]);

  if (merchantSlug && RESERVED_SLUGS.has(merchantSlug)) {
    return <Navigate to="/" replace />;
  }

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
          title="Store not found"
          description="This gift card store is unavailable or does not exist."
        />
      </Container>
    );
  }

  const { merchant, giftCards } = data;
  const slug = merchant.slug ?? merchantSlug ?? "";

  return (
    <Box minH="100vh" bg="surface">
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="border"
        py={6}
        px={4}
        style={{ borderBottomColor: merchant.primaryColor }}
      >
        <Container maxW="6xl">
          <VStack gap={3} align="start">
            {merchant.logoUrl ? (
              <Image
                src={merchant.logoUrl}
                alt={merchant.businessName ?? "Store logo"}
                maxH="12"
                objectFit="contain"
              />
            ) : null}
            <Heading size="lg" color="primary">
              {merchant.businessName ?? "Gift Cards"}
            </Heading>
            {merchant.contactEmail ? (
              <Text fontSize="sm" color="textSecondary">
                {merchant.contactEmail}
              </Text>
            ) : null}
          </VStack>
        </Container>
      </Box>

      <Container maxW="6xl" py={10}>
        {giftCards.length === 0 ? (
          <EmptyState
            title="No gift cards available"
            description="Check back later for new gift card options."
          />
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
            {giftCards.map((card) => (
              <RouterLink key={card.id} to={`/${slug}/${card.id}`}>
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="card"
                  p={6}
                  h="full"
                  transition="box-shadow 0.2s"
                  _hover={{ boxShadow: "md", borderColor: merchant.secondaryColor }}
                >
                  <VStack align="start" gap={3}>
                    <Heading size="md" color="primary">
                      {card.name}
                    </Heading>
                    <Text fontWeight="semibold" color={merchant.secondaryColor}>
                      {formatCardPrice(card)}
                    </Text>
                    {card.message ? (
                      <Text fontSize="sm" color="textSecondary" lineClamp={2}>
                        {card.message}
                      </Text>
                    ) : null}
                    <Text fontSize="sm" color="secondary" fontWeight="medium">
                      Buy now →
                    </Text>
                  </VStack>
                </Box>
              </RouterLink>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

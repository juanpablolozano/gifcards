import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ApiError } from "../lib/apiClient";
import { toaster } from "../lib/toaster";
import { getGiftView, type GiftViewResponse } from "../services/giftViewService";

const TERMINAL_STATUSES = new Set(["redeemed", "expired", "void"]);

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function buildQrUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function GiftViewPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<GiftViewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("not_found");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getGiftView(token)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.code : "gift_lookup_failed");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toaster.create({
        title: "Code copied",
        description: "Gift card code copied to clipboard.",
        type: "success",
      });
    } catch {
      toaster.create({
        title: "Copy failed",
        description: "Unable to copy code. Please copy it manually.",
        type: "error",
      });
    }
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
          description="This gift card link is invalid or has been removed."
        />
      </Container>
    );
  }

  const { issuedCard, giftCard, merchant, history } = data;
  const isTerminal = TERMINAL_STATUSES.has(issuedCard.status);
  const primaryColor = merchant?.primaryColor ?? "#111827";
  const secondaryColor = merchant?.secondaryColor ?? "#4F46E5";
  const giftUrl = `${window.location.origin}/gift/${issuedCard.token}`;

  return (
    <Box minH="100vh" bg="surface">
      <Box bg="white" borderBottom="1px solid" borderColor="border" py={6}>
        <Container maxW="lg">
          <HStack gap={4}>
            {merchant?.logoUrl ? (
              <Image
                src={merchant.logoUrl}
                alt={merchant.businessName ?? "Merchant"}
                maxH="10"
                objectFit="contain"
              />
            ) : null}
            <Heading size="md" color="primary">
              {merchant?.businessName ?? "Gift Card"}
            </Heading>
          </HStack>
        </Container>
      </Box>

      <Container maxW="lg" py={10}>
        <VStack gap={8} align="stretch">
          {isTerminal ? (
            <Box
              bg="white"
              border="1px solid"
              borderColor="border"
              borderRadius="card"
              p={6}
            >
              <VStack gap={3} align="start">
                <StatusBadge status={issuedCard.status} />
                <Heading size="md" color="primary">
                  {issuedCard.status === "redeemed"
                    ? "This gift card has been fully redeemed"
                    : issuedCard.status === "expired"
                      ? "This gift card has expired"
                      : "This gift card is no longer active"}
                </Heading>
                <Text color="textSecondary">
                  Original value:{" "}
                  {formatMoney(issuedCard.initialAmount, issuedCard.currency)}
                </Text>
              </VStack>
            </Box>
          ) : null}

          <Box
            borderRadius="xl"
            overflow="hidden"
            bg={`linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}
            color="white"
            p={8}
          >
            <VStack align="start" gap={4}>
              <HStack justify="space-between" width="full">
                <Text fontSize="sm" opacity={0.85}>
                  {giftCard?.name ?? "Gift Card"}
                </Text>
                <StatusBadge status={issuedCard.status} />
              </HStack>
              <Heading size="3xl">
                {formatMoney(issuedCard.balance, issuedCard.currency)}
              </Heading>
              <Text fontSize="sm" opacity={0.85}>
                of {formatMoney(issuedCard.initialAmount, issuedCard.currency)}
              </Text>
              {issuedCard.giftMessage ? (
                <Text fontSize="sm" fontStyle="italic" opacity={0.9}>
                  &ldquo;{issuedCard.giftMessage}&rdquo;
                </Text>
              ) : null}
            </VStack>
          </Box>

          {!isTerminal ? (
            <Box
              bg="white"
              border="1px solid"
              borderColor="border"
              borderRadius="card"
              p={6}
            >
              <VStack gap={5}>
                <Heading size="sm" color="primary" alignSelf="start">
                  Redemption code
                </Heading>
                <Image
                  src={buildQrUrl(issuedCard.code)}
                  alt="Gift card QR code"
                  boxSize="200px"
                />
                <HStack
                  width="full"
                  justify="space-between"
                  bg="surface"
                  border="1px solid"
                  borderColor="border"
                  borderRadius="md"
                  px={4}
                  py={3}
                >
                  <Text fontFamily="mono" fontWeight="semibold" color="primary">
                    {issuedCard.code}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="border"
                    onClick={() => handleCopyCode(issuedCard.code)}
                  >
                    Copy
                  </Button>
                </HStack>
                <Button asChild variant="outline" borderColor="border" width="full">
                  <RouterLink to={`/gift/${issuedCard.token}/qr`}>
                    Open fullscreen QR
                  </RouterLink>
                </Button>
              </VStack>
            </Box>
          ) : (
            <Box
              bg="white"
              border="1px solid"
              borderColor="border"
              borderRadius="card"
              p={6}
            >
              <Text fontFamily="mono" color="textSecondary">
                Code: {issuedCard.code}
              </Text>
            </Box>
          )}

          {history.length > 0 ? (
            <Box
              bg="white"
              border="1px solid"
              borderColor="border"
              borderRadius="card"
              p={6}
            >
              <VStack gap={4} align="stretch">
                <Heading size="sm" color="primary">
                  Activity
                </Heading>
                {history.map((entry) => (
                  <HStack
                    key={entry.id}
                    justify="space-between"
                    py={2}
                    borderBottom="1px solid"
                    borderColor="border"
                    _last={{ borderBottom: "none" }}
                  >
                    <VStack align="start" gap={0}>
                      <StatusBadge status={entry.type} />
                      <Text fontSize="sm" color="textSecondary">
                        {formatDate(entry.createdAt)}
                      </Text>
                    </VStack>
                    <Text fontWeight="semibold" color="primary">
                      {formatMoney(entry.amount, issuedCard.currency)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          ) : null}

          <Text fontSize="xs" color="textSecondary" textAlign="center">
            Share link: {giftUrl}
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}

import {
  Box,
  Button,
  Heading,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ApiError } from "../lib/apiClient";
import { getGiftView, type GiftViewResponse } from "../services/giftViewService";

function buildQrUrl(data: string, size = 400): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function QrFullscreenPage() {
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

  if (isLoading) {
    return (
      <VStack minH="100vh" justify="center" bg="black">
        <Spinner size="xl" color="white" />
      </VStack>
    );
  }

  if (error || !data) {
    return (
      <VStack minH="100vh" justify="center" bg="black" gap={4} px={6}>
        <Text color="white">Gift card not found</Text>
        <Button asChild variant="outline" color="white" borderColor="whiteAlpha.400">
          <RouterLink to="/">Go home</RouterLink>
        </Button>
      </VStack>
    );
  }

  const { issuedCard, merchant } = data;

  return (
    <Box
      minH="100vh"
      bg="black"
      color="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={6}
      py={10}
      position="relative"
    >
      <VStack gap={8} maxW="md" width="full" textAlign="center">
        <Heading size="lg">
          {merchant?.businessName ?? "Gift Card"}
        </Heading>

        <Box bg="white" p={4} borderRadius="lg">
          <Image
            src={buildQrUrl(issuedCard.code, 400)}
            alt="Gift card QR code"
            maxW="100%"
            width="400px"
            height="400px"
          />
        </Box>

        <Text fontFamily="mono" fontSize="2xl" letterSpacing="wider">
          {issuedCard.code}
        </Text>

        <Text fontSize="sm" color="whiteAlpha.700">
          Show this code at checkout to redeem your gift card
        </Text>

        <Button
          asChild
          variant="outline"
          color="white"
          borderColor="whiteAlpha.400"
        >
          <RouterLink to={`/gift/${issuedCard.token}`}>Back to gift card</RouterLink>
        </Button>
      </VStack>
    </Box>
  );
}

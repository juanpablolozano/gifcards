import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { StatusBadge } from "../components/shared/StatusBadge";
import { toaster } from "../lib/toaster";
import { listWalletCards, type WalletCard } from "../services/walletService";
import { useWalletStore } from "../stores/walletStore";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function WalletPage() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walletToken = useWalletStore((state) => state.walletToken);
  const email = useWalletStore((state) => state.email);
  const setWalletSession = useWalletStore((state) => state.setWalletSession);
  const clearWallet = useWalletStore((state) => state.clear);

  const [cards, setCards] = useState<WalletCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tokenFromUrl = searchParams.get("token");
  const activeToken = tokenFromUrl ?? walletToken;

  useEffect(() => {
    if (!activeToken) {
      navigate("/wallet/login", { replace: true });
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    listWalletCards(activeToken)
      .then((response) => {
        if (cancelled) return;
        setWalletSession(activeToken, response.email);
        setCards(response.items);
        if (tokenFromUrl) {
          navigate("/wallet", { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toaster.create({ title: t("wallet.loadError"), type: "error" });
          clearWallet();
          navigate("/wallet/login", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeToken, clearWallet, navigate, setWalletSession, t, tokenFromUrl]);

  const handleLogout = () => {
    clearWallet();
    navigate("/wallet/login", { replace: true });
  };

  if (isLoading) {
    return (
      <Flex minH="60vh" justify="center" align="center">
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  return (
    <Box maxW="720px" mx="auto" px={4} py={8}>
      <VStack align="stretch" gap={6}>
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <VStack align="start" gap={1}>
            <Heading size="lg" color="primary">
              {t("wallet.title")}
            </Heading>
            {email ? (
              <Text fontSize="sm" color="textSecondary">
                {email}
              </Text>
            ) : null}
          </VStack>
          <Button variant="outline" colorPalette="gray" onClick={handleLogout}>
            {t("wallet.logout")}
          </Button>
        </Flex>

        {cards.length === 0 ? (
          <EmptyState
            title={t("wallet.emptyTitle")}
            description={t("wallet.emptyDescription")}
          />
        ) : (
          <VStack align="stretch" gap={3}>
            {cards.map((card) => (
              <RouterLink
                key={card.token}
                to={`/gift/${card.token}`}
                style={{ textDecoration: "none" }}
              >
                <Box
                  bg="white"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="card"
                  p={4}
                  _hover={{ borderColor: "secondary", boxShadow: "sm" }}
                  transition="border-color 0.15s, box-shadow 0.15s"
                >
                  <HStack gap={4} align="center">
                    {card.previewThumbnail ? (
                      <Image
                        src={card.previewThumbnail}
                        alt=""
                        boxSize="48px"
                        objectFit="contain"
                        borderRadius="md"
                      />
                    ) : (
                      <Flex
                        boxSize="48px"
                        align="center"
                        justify="center"
                        bg="surface"
                        borderRadius="md"
                        color="secondary"
                        fontWeight="bold"
                      >
                        G
                      </Flex>
                    )}

                    <VStack align="start" gap={1} flex="1" minW={0}>
                      <Text fontWeight="semibold" color="primary" truncate w="full">
                        {card.giftCardName ?? t("wallet.unnamedCard")}
                      </Text>
                      <Text fontSize="sm" color="textSecondary" truncate w="full">
                        {card.merchantName ?? t("wallet.unknownMerchant")}
                      </Text>
                    </VStack>

                    <VStack align="end" gap={1} flexShrink={0}>
                      <Text fontWeight="bold" color="primary">
                        {formatMoney(card.balance)}
                      </Text>
                      <StatusBadge status={card.status} />
                    </VStack>
                  </HStack>
                </Box>
              </RouterLink>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

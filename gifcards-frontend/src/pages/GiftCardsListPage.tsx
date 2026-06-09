import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { StatusBadge } from "../components/shared/StatusBadge";
import { toaster } from "../lib/toaster";
import { listGiftCards } from "../services/giftCardService";
import { useAuthStore } from "../stores/authStore";
import type { GiftCard, GiftCardStatus } from "../types/giftCard";

type FilterValue = "all" | "active" | "paused";

const filters: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatCardValue(card: GiftCard): string {
  if (card.valueType === "fixed" && card.fixedAmount !== null) {
    return formatCurrency(card.fixedAmount, card.currency);
  }
  if (card.minAmount !== null && card.maxAmount !== null) {
    return `${formatCurrency(card.minAmount, card.currency)} – ${formatCurrency(card.maxAmount, card.currency)}`;
  }
  return "Variable";
}

export function GiftCardsListPage() {
  const idToken = useAuthStore((state) => state.idToken);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!idToken) {
      return;
    }

    let cancelled = false;

    async function loadCards() {
      setIsLoading(true);
      setLoadError(false);
      try {
        const status: GiftCardStatus | undefined =
          filter === "all" ? undefined : filter;
        const response = await listGiftCards(idToken!, status);
        if (!cancelled) {
          setCards(response.items);
        }
      } catch {
        if (!cancelled) {
          setCards([]);
          setLoadError(true);
          toaster.create({
            title: "Could not load gift cards",
            type: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCards();
    return () => {
      cancelled = true;
    };
  }, [idToken, filter]);

  return (
    <VStack align="stretch" gap={6}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Flex gap={2} flexWrap="wrap">
          {filters.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={filter === item.value ? "solid" : "outline"}
              bg={filter === item.value ? "secondary" : "white"}
              color={filter === item.value ? "white" : "primary"}
              borderColor="border"
              _hover={{
                bg: filter === item.value ? "#4338CA" : "surface",
              }}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </Flex>
        <Button
          asChild
          bg="secondary"
          color="white"
          size="sm"
          _hover={{ bg: "#4338CA" }}
        >
          <RouterLink to="/gift-cards/new">Create gift card</RouterLink>
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="240px">
          <Spinner size="lg" color="secondary" />
        </Flex>
      ) : loadError ? (
        <EmptyState
          title="Unable to load gift cards"
          description="Something went wrong while fetching your gift cards. Please refresh the page."
        />
      ) : cards.length === 0 ? (
        <EmptyState
          title="No gift cards yet"
          description={
            filter === "all"
              ? "Create your first gift card to start selling."
              : `No ${filter} gift cards found. Try a different filter or create a new card.`
          }
          action={
            <Button asChild bg="secondary" color="white" _hover={{ bg: "#4338CA" }}>
              <RouterLink to="/gift-cards/new">Create gift card</RouterLink>
            </Button>
          }
        />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
          {cards.map((card) => (
            <RouterLink key={card.id} to={`/gift-cards/${card.id}`}>
              <Box
                bg="white"
                borderWidth="1px"
                borderColor="border"
                borderRadius="card"
                p={5}
                boxShadow="sm"
                transition="box-shadow 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between" align="start" gap={2}>
                    <Heading size="sm" color="primary" truncate>
                      {card.name}
                    </Heading>
                    <StatusBadge status={card.status} />
                  </Flex>
                  <Text fontSize="lg" fontWeight="semibold" color="secondary">
                    {formatCardValue(card)}
                  </Text>
                  <Flex justify="space-between" fontSize="sm" color="textSecondary">
                    <Text>{card.salesCount} sold</Text>
                    <Text>{formatCurrency(card.totalRevenue, card.currency)} revenue</Text>
                  </Flex>
                </VStack>
              </Box>
            </RouterLink>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}

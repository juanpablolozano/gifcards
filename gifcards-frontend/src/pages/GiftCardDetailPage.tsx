import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { KpiCard } from "../components/shared/KpiCard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { toaster } from "../lib/toaster";
import { getGiftCard, updateGiftCard } from "../services/giftCardService";
import { useAuthStore } from "../stores/authStore";
import type { GiftCardDetail } from "../types/giftCard";

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatCardAmount(card: GiftCardDetail): string {
  if (card.valueType === "fixed" && card.fixedAmount != null) {
    return formatMoney(card.fixedAmount, card.currency);
  }
  if (card.minAmount != null && card.maxAmount != null) {
    return `${formatMoney(card.minAmount, card.currency)} – ${formatMoney(card.maxAmount, card.currency)}`;
  }
  return "—";
}

export function GiftCardDetailPage() {
  const { id: cardId } = useParams<{ id: string }>();
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);

  const [card, setCard] = useState<GiftCardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCard = useCallback(async () => {
    if (!idToken || !cardId) {
      setIsLoading(false);
      if (!cardId) setError("Could not load gift card.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detail = await getGiftCard(idToken, cardId);
      setCard(detail);
    } catch {
      setError("Could not load gift card.");
      setCard(null);
    } finally {
      setIsLoading(false);
    }
  }, [cardId, idToken]);

  useEffect(() => {
    void loadCard();
  }, [loadCard]);

  const handleTogglePause = async () => {
    if (!idToken || !card || !cardId) return;
    if (card.status !== "active" && card.status !== "paused") return;

    const nextStatus = card.status === "active" ? "paused" : "active";
    setIsToggling(true);

    try {
      const updated = await updateGiftCard(idToken, cardId, { status: nextStatus });
      setCard((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toaster.create({
        title: nextStatus === "paused" ? "Gift card paused" : "Gift card resumed",
        type: "success",
      });
    } catch {
      toaster.create({ title: "Failed to update status", type: "error" });
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!card?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(card.publicUrl);
      toaster.create({ title: "Link copied", type: "success" });
    } catch {
      toaster.create({ title: "Could not copy link", type: "error" });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="240px">
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  if (error || !card) {
    return (
      <EmptyState
        title="Gift card not found"
        description={error ?? "This gift card could not be loaded."}
        action={
          <Button asChild variant="outline">
            <RouterLink to="/gift-cards">Back to gift cards</RouterLink>
          </Button>
        }
      />
    );
  }

  const canTogglePause = card.status === "active" || card.status === "paused";

  return (
    <VStack align="stretch" gap={6}>
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 6, md: 8 }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          gap={4}
          mb={6}
        >
          <VStack align="start" gap={2}>
            <Flex align="center" gap={3} flexWrap="wrap">
              <Heading size="md" color="primary">
                {card.name}
              </Heading>
              <StatusBadge status={card.status} />
            </Flex>
            <Text color="textSecondary" fontSize="sm">
              Created {formatDate(card.createdAt)}
            </Text>
          </VStack>

          <Flex gap={2} flexWrap="wrap">
            <Button asChild variant="outline">
              <RouterLink to={`/gift-cards/${card.id}/edit`}>Edit</RouterLink>
            </Button>
            {canTogglePause && (
              <Button variant="outline" loading={isToggling} onClick={handleTogglePause}>
                {card.status === "active" ? "Pause" : "Resume"}
              </Button>
            )}
          </Flex>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          <GiftCardPreview
            name={card.name}
            amount={formatCardAmount(card)}
            message={card.message ?? undefined}
            merchantName={merchant?.businessName ?? undefined}
          />

          {card.publicUrl ? (
            <VStack align="stretch" gap={2} justify="center">
              <Text fontSize="sm" fontWeight="600" color="primary">
                Share link
              </Text>
              <Flex gap={2}>
                <Input value={card.publicUrl} readOnly bg="surface" borderColor="border" />
                <Button variant="outline" onClick={handleCopyLink}>
                  Copy
                </Button>
              </Flex>
            </VStack>
          ) : (
            <Text color="textSecondary" fontSize="sm">
              No public link available for this card.
            </Text>
          )}
        </Grid>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <KpiCard label="Sold" value={String(card.metrics.soldCount)} />
        <KpiCard
          label="Revenue"
          value={formatMoney(card.totalRevenue, card.currency)}
        />
        <KpiCard
          label="Outstanding balance"
          value={formatMoney(card.metrics.outstandingBalance, card.currency)}
        />
        <KpiCard
          label="Redeemed"
          value={formatMoney(card.metrics.redeemedAmount, card.currency)}
        />
      </Grid>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 4, md: 6 }}
      >
        <Heading size="sm" color="primary" mb={4}>
          Recent transactions
        </Heading>

        {card.transactions.length === 0 ? (
          <Text color="textSecondary" fontSize="sm">
            No transactions yet for this gift card.
          </Text>
        ) : (
          <Table.ScrollArea>
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Type</Table.ColumnHeader>
                  <Table.ColumnHeader>Amount</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {card.transactions.map((tx) => (
                  <Table.Row key={tx.id}>
                    <Table.Cell>{formatDate(tx.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={tx.type} />
                    </Table.Cell>
                    <Table.Cell>{formatMoney(tx.amount, card.currency)}</Table.Cell>
                    <Table.Cell>
                      <StatusBadge status={tx.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}
      </Box>
    </VStack>
  );
}

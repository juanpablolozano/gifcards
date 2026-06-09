import {
  Box,
  Field,
  Flex,
  Heading,
  NativeSelect,
  Spinner,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "../components/shared/EmptyState";
import { StatusBadge } from "../components/shared/StatusBadge";
import { listGiftCards } from "../services/giftCardService";
import { listTransactions, type Transaction } from "../services/transactionService";
import { useAuthStore } from "../stores/authStore";
import type { GiftCard } from "../types/giftCard";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function TransactionsPage() {
  const idToken = useAuthStore((state) => state.idToken);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [giftCardFilter, setGiftCardFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGiftCards = useCallback(async () => {
    if (!idToken) return;
    try {
      const result = await listGiftCards(idToken);
      setGiftCards(result.items);
    } catch {
      setGiftCards([]);
    }
  }, [idToken]);

  const loadTransactions = useCallback(async () => {
    if (!idToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await listTransactions(idToken, {
        type: typeFilter || undefined,
        giftCardId: giftCardFilter || undefined,
        limit: 100,
      });
      setTransactions(result.items);
      setTotal(result.total);
    } catch {
      setError("Could not load transactions.");
      setTransactions([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [giftCardFilter, idToken, typeFilter]);

  useEffect(() => {
    void loadGiftCards();
  }, [loadGiftCards]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

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
              Transactions
            </Heading>
            <Text color="textSecondary">
              View purchases and redemptions across your gift cards.
            </Text>
          </VStack>

          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align={{ base: "stretch", md: "end" }}
          >
            <Field.Root flex="1">
              <Field.Label color="primary">Type</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={typeFilter}
                  bg="surface"
                  borderColor="border"
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="">All types</option>
                  <option value="purchase">Purchase</option>
                  <option value="redemption">Redemption</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>

            <Field.Root flex="1">
              <Field.Label color="primary">Gift card</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={giftCardFilter}
                  bg="surface"
                  borderColor="border"
                  onChange={(event) => setGiftCardFilter(event.target.value)}
                >
                  <option value="">All gift cards</option>
                  {giftCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </Flex>
        </VStack>
      </Box>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 4, md: 6 }}
      >
        {isLoading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="lg" color="secondary" />
          </Flex>
        ) : error ? (
          <EmptyState title="Unable to load transactions" description={error} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Transactions will appear here once customers purchase or redeem gift cards."
          />
        ) : (
          <VStack align="stretch" gap={4}>
            <Text fontSize="sm" color="textSecondary">
              Showing {transactions.length} of {total} transactions
            </Text>

            <Table.ScrollArea>
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Type</Table.ColumnHeader>
                    <Table.ColumnHeader>Gift card</Table.ColumnHeader>
                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                    <Table.ColumnHeader>Code</Table.ColumnHeader>
                    <Table.ColumnHeader>Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {transactions.map((tx) => (
                    <Table.Row key={tx.id}>
                      <Table.Cell>{formatDate(tx.createdAt)}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={tx.type} />
                      </Table.Cell>
                      <Table.Cell>{tx.giftCardName ?? "—"}</Table.Cell>
                      <Table.Cell>{tx.customerEmail ?? "—"}</Table.Cell>
                      <Table.Cell>{tx.code ?? "—"}</Table.Cell>
                      <Table.Cell>{formatMoney(tx.amount)}</Table.Cell>
                      <Table.Cell>
                        <StatusBadge status={tx.status} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </VStack>
        )}
      </Box>
    </VStack>
  );
}

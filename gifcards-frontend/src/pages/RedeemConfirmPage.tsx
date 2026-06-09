import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { StatusBadge } from "../components/shared/StatusBadge";
import { toaster } from "../lib/toaster";
import { confirmRedemption } from "../services/redemptionService";
import { useAuthStore } from "../stores/authStore";
import { useRedeemStore } from "../stores/redeemStore";

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

type SuccessState = {
  transactionId: string;
  newBalance: number;
  status: string;
  redeemedAt: string;
  redeemedAmount: number;
};

export function RedeemConfirmPage() {
  const navigate = useNavigate();
  const idToken = useAuthStore((state) => state.idToken);

  const validated = useRedeemStore((state) => state.validated);
  const amount = useRedeemStore((state) => state.amount);
  const notes = useRedeemStore((state) => state.notes);
  const setAmount = useRedeemStore((state) => state.setAmount);
  const setNotes = useRedeemStore((state) => state.setNotes);
  const clear = useRedeemStore((state) => state.clear);

  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  useEffect(() => {
    if (!validated?.issuedCardId) {
      navigate("/redeem", { replace: true });
    }
  }, [validated, navigate]);

  if (!validated?.issuedCardId) {
    return (
      <Flex justify="center" align="center" minH="240px">
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  const currency = validated.currency ?? "USD";
  const balance = validated.balance ?? 0;

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!idToken || !validated.issuedCardId) return;

    const parsedAmount = Number.parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter a valid redemption amount.");
      return;
    }

    if (parsedAmount > balance) {
      setFormError(`Amount cannot exceed the available balance of ${formatMoney(balance, currency)}.`);
      return;
    }

    setFormError(null);
    setIsConfirming(true);

    try {
      const result = await confirmRedemption(idToken, {
        issuedCardId: validated.issuedCardId,
        amount: parsedAmount,
        notes: notes.trim() || undefined,
      });

      setSuccess({
        ...result,
        redeemedAmount: parsedAmount,
      });

      toaster.create({
        title: "Redemption complete",
        description: `${formatMoney(parsedAmount, currency)} redeemed successfully.`,
        type: "success",
      });
    } catch {
      toaster.create({ title: "Failed to confirm redemption", type: "error" });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRedeemAnother = () => {
    clear();
    navigate("/redeem");
  };

  if (success) {
    return (
      <VStack align="stretch" gap={6}>
        <Box
          bg="white"
          borderWidth="1px"
          borderColor="border"
          borderRadius="card"
          p={{ base: 6, md: 8 }}
          maxW="lg"
          mx="auto"
          w="full"
        >
          <VStack align="stretch" gap={4}>
            <Box
              bg="green.50"
              borderWidth="1px"
              borderColor="green.200"
              borderRadius="md"
              p={4}
            >
              <Heading size="sm" color="green.800" mb={2}>
                Redemption successful
              </Heading>
              <Text color="green.700" fontSize="sm">
                {formatMoney(success.redeemedAmount, currency)} was redeemed from this gift card.
              </Text>
            </Box>

            <VStack align="stretch" gap={2} fontSize="sm">
              <Flex justify="space-between">
                <Text color="textSecondary">Transaction ID</Text>
                <Text fontFamily="mono">{success.transactionId}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="textSecondary">Remaining balance</Text>
                <Text fontWeight="600">{formatMoney(success.newBalance, currency)}</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="textSecondary">Card status</Text>
                <StatusBadge status={success.status} />
              </Flex>
              <Flex justify="space-between">
                <Text color="textSecondary">Redeemed at</Text>
                <Text>{formatDate(success.redeemedAt)}</Text>
              </Flex>
            </VStack>

            <Flex gap={3} flexWrap="wrap" pt={2}>
              <Button
                bg="secondary"
                color="white"
                _hover={{ bg: "#4338CA" }}
                onClick={handleRedeemAnother}
              >
                Redeem another
              </Button>
              <Button asChild variant="outline">
                <RouterLink to="/transactions">View transactions</RouterLink>
              </Button>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="border"
        borderRadius="card"
        p={{ base: 6, md: 8 }}
        maxW="lg"
        mx="auto"
        w="full"
      >
        <VStack as="form" align="stretch" gap={6} onSubmit={handleConfirm}>
          <VStack align="start" gap={1}>
            <Heading size="md" color="primary">
              Confirm redemption
            </Heading>
            <Text color="textSecondary">
              Enter the amount to redeem from this gift card.
            </Text>
          </VStack>

          <Box bg="surface" borderRadius="md" p={4}>
            <VStack align="stretch" gap={2} fontSize="sm">
              <Flex justify="space-between">
                <Text color="textSecondary">Gift card</Text>
                <Text fontWeight="600">{validated.giftCardName ?? "Gift card"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="textSecondary">Code</Text>
                <Text fontFamily="mono">{validated.code}</Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text color="textSecondary">Status</Text>
                {validated.status ? <StatusBadge status={validated.status} /> : <Text>—</Text>}
              </Flex>
              <Flex justify="space-between">
                <Text color="textSecondary">Available balance</Text>
                <Text fontWeight="600" color="primary">
                  {formatMoney(balance, currency)}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {formError && (
            <Text color="red.500" fontSize="sm">
              {formError}
            </Text>
          )}

          <Field.Root required>
            <Field.Label color="primary">Redemption amount ({currency})</Field.Label>
            <Input
              type="number"
              min={0.01}
              max={balance}
              step="0.01"
              value={amount}
              bg="surface"
              borderColor="border"
              onChange={(event) => setAmount(event.target.value)}
            />
            <Field.HelperText color="textSecondary">
              Maximum: {formatMoney(balance, currency)}
            </Field.HelperText>
          </Field.Root>

          <Field.Root>
            <Field.Label color="primary">Notes (optional)</Field.Label>
            <Textarea
              value={notes}
              rows={3}
              bg="surface"
              borderColor="border"
              placeholder="Internal note about this redemption"
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field.Root>

          <Flex justify="space-between" gap={3} flexWrap="wrap">
            <Button asChild variant="outline">
              <RouterLink to="/redeem">Back</RouterLink>
            </Button>
            <Button
              type="submit"
              bg="secondary"
              color="white"
              _hover={{ bg: "#4338CA" }}
              loading={isConfirming}
            >
              Confirm redemption
            </Button>
          </Flex>
        </VStack>
      </Box>
    </VStack>
  );
}

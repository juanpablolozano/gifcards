import {
  Button,
  Container,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { EmptyState } from "../components/shared/EmptyState";
import { getCheckoutSession } from "../services/checkoutService";
import type { CheckoutSessionStatus } from "../types/checkout";

const TERMINAL_STATUSES = new Set(["completed", "expired", "failed"]);
const POLL_INTERVAL_MS = 2000;

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<CheckoutSessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("missing_session");
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const result = await getCheckoutSession(sessionId);
        if (cancelled) return;

        setSession(result);

        if (!TERMINAL_STATUSES.has(result.status)) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError("session_lookup_failed");
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId]);

  if (!sessionId || error) {
    return (
      <Container maxW="lg" py={16}>
        <EmptyState
          title="Payment status unavailable"
          description="We could not confirm your payment. Contact support if you were charged."
        />
      </Container>
    );
  }

  if (!session) {
    return (
      <VStack minH="60vh" justify="center" gap={4}>
        <Spinner size="lg" color="secondary" />
        <Text color="textSecondary">Confirming your payment…</Text>
      </VStack>
    );
  }

  if (session.status === "failed" || session.status === "expired") {
    return (
      <Container maxW="lg" py={16}>
        <EmptyState
          title="Payment not completed"
          description={`Your payment session is ${session.status}. Please try again.`}
          action={
            <Button asChild variant="outline" borderColor="border">
              <RouterLink to="/checkout">Back to checkout</RouterLink>
            </Button>
          }
        />
      </Container>
    );
  }

  if (session.status !== "completed") {
    return (
      <VStack minH="60vh" justify="center" gap={4}>
        <Spinner size="lg" color="secondary" />
        <Text color="textSecondary">Processing your gift card…</Text>
      </VStack>
    );
  }

  return (
    <Container maxW="md" py={16}>
      <VStack gap={6} align="stretch" textAlign="center">
        <Heading size="lg" color="primary">
          Payment successful
        </Heading>
        <Text color="textSecondary">
          Your {session.giftCardName} gift card is ready.
          {session.emailSent ? " A confirmation email has been sent." : null}
        </Text>

        {session.issuedCardToken ? (
          <Button asChild bg="secondary" color="white" _hover={{ bg: "#4338CA" }}>
            <RouterLink to={`/gift/${session.issuedCardToken}`}>
              View your gift card
            </RouterLink>
          </Button>
        ) : (
          <Text color="textSecondary" fontSize="sm">
            Your gift card is being prepared. Refresh this page in a moment.
          </Text>
        )}
      </VStack>
    </Container>
  );
}

import {
  Box,
  Button,
  Container,
  Field,
  Heading,
  Input,
  Separator,
  Switch,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { GiftCardPreview } from "../components/shared/GiftCardPreview";
import { toaster } from "../lib/toaster";
import { createCheckoutSession } from "../services/checkoutService";
import { useCheckoutStore } from "../stores/checkoutStore";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amount);
}

export function CheckoutPage() {
  const cart = useCheckoutStore((state) => state.cart);
  const buyerEmail = useCheckoutStore((state) => state.buyerEmail);
  const isGift = useCheckoutStore((state) => state.isGift);
  const recipientEmail = useCheckoutStore((state) => state.recipientEmail);
  const recipientName = useCheckoutStore((state) => state.recipientName);
  const giftMessage = useCheckoutStore((state) => state.giftMessage);
  const setBuyerEmail = useCheckoutStore((state) => state.setBuyerEmail);
  const setIsGift = useCheckoutStore((state) => state.setIsGift);
  const setRecipientEmail = useCheckoutStore((state) => state.setRecipientEmail);
  const setRecipientName = useCheckoutStore((state) => state.setRecipientName);
  const setGiftMessage = useCheckoutStore((state) => state.setGiftMessage);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!cart) {
    return <Navigate to="/" replace />;
  }

  const handlePay = async () => {
    if (!buyerEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);

    try {
      const session = await createCheckoutSession({
        giftCardId: cart.giftCardId,
        merchantSlug: cart.merchantSlug,
        amount: cart.amount,
        buyerEmail: buyerEmail.trim(),
        isGift,
        recipientEmail: isGift ? recipientEmail.trim() || undefined : undefined,
        recipientName: isGift ? recipientName.trim() || undefined : undefined,
        giftMessage: isGift ? giftMessage.trim() || undefined : undefined,
      });

      window.location.href = session.checkoutUrl;
    } catch {
      toaster.create({
        title: "Checkout failed",
        description: "Unable to start payment. Please try again.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <VStack gap={8} align="stretch">
        <Heading size="lg" color="primary">
          Checkout
        </Heading>

        <Box
          bg="white"
          border="1px solid"
          borderColor="border"
          borderRadius="card"
          p={6}
        >
          <VStack gap={4} align="stretch">
            <Text fontWeight="semibold" color="primary">
              Order summary
            </Text>
            <GiftCardPreview
              name={cart.giftCardName}
              amount={formatMoney(cart.amount, cart.currency)}
              merchantName={cart.merchantName}
            />
            <Separator />
            <Text fontSize="lg" fontWeight="bold" color="primary">
              Total: {formatMoney(cart.amount, cart.currency)}
            </Text>
          </VStack>
        </Box>

        <Field.Root invalid={Boolean(emailError)}>
          <Field.Label color="primary">Your email</Field.Label>
          <Input
            type="email"
            value={buyerEmail}
            bg="white"
            borderColor="border"
            placeholder="you@example.com"
            onChange={(event) => {
              setBuyerEmail(event.target.value);
              setEmailError(null);
            }}
          />
          {emailError ? <Field.ErrorText>{emailError}</Field.ErrorText> : null}
        </Field.Root>

        <Switch.Root
          checked={isGift}
          onCheckedChange={(details) => setIsGift(details.checked === true)}
        >
          <Switch.HiddenInput />
          <Switch.Control />
          <Switch.Label color="primary">Send as a gift</Switch.Label>
        </Switch.Root>

        {isGift ? (
          <VStack gap={4} align="stretch">
            <Field.Root>
              <Field.Label color="primary">Recipient name</Field.Label>
              <Input
                value={recipientName}
                bg="white"
                borderColor="border"
                onChange={(event) => setRecipientName(event.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label color="primary">Recipient email</Field.Label>
              <Input
                type="email"
                value={recipientEmail}
                bg="white"
                borderColor="border"
                onChange={(event) => setRecipientEmail(event.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label color="primary">Gift message</Field.Label>
              <Textarea
                value={giftMessage}
                bg="white"
                borderColor="border"
                rows={3}
                onChange={(event) => setGiftMessage(event.target.value)}
              />
            </Field.Root>
          </VStack>
        ) : null}

        <Button
          width="full"
          bg="secondary"
          color="white"
          _hover={{ bg: "#4338CA" }}
          loading={isSubmitting}
          onClick={handlePay}
        >
          Pay with Stripe
        </Button>
      </VStack>
    </Container>
  );
}

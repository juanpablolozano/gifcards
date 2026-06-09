import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "../lib/toaster";
import { validateRedemptionCode } from "../services/redemptionService";
import { useAuthStore } from "../stores/authStore";
import { useRedeemStore } from "../stores/redeemStore";

export function RedeemPage() {
  const navigate = useNavigate();
  const idToken = useAuthStore((state) => state.idToken);
  const setValidated = useRedeemStore((state) => state.setValidated);
  const clear = useRedeemStore((state) => state.clear);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!idToken) return;

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a redemption code.");
      return;
    }

    setError(null);
    setIsValidating(true);

    try {
      const result = await validateRedemptionCode(idToken, trimmed);

      if (!result.valid || !result.issuedCardId) {
        setError(
          result.errorCode === "not_found"
            ? "Code not found. Check the code and try again."
            : result.errorCode === "expired"
              ? "This gift card has expired."
              : result.errorCode === "fully_redeemed"
                ? "This gift card has no remaining balance."
                : "This code cannot be redeemed.",
        );
        return;
      }

      clear();
      setValidated(result);
      navigate("/redeem/confirm");
    } catch {
      toaster.create({ title: "Failed to validate code", type: "error" });
    } finally {
      setIsValidating(false);
    }
  };

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
        <VStack as="form" align="stretch" gap={6} onSubmit={handleSubmit}>
          <VStack align="start" gap={1}>
            <Heading size="md" color="primary">
              Redeem gift card
            </Heading>
            <Text color="textSecondary">
              Enter the customer&apos;s gift card code to validate the balance.
            </Text>
          </VStack>

          <Field.Root required invalid={Boolean(error)}>
            <Field.Label color="primary">Redemption code</Field.Label>
            <Input
              value={code}
              placeholder="e.g. ABCD-1234"
              bg="surface"
              borderColor="border"
              fontFamily="mono"
              textTransform="uppercase"
              onChange={(event) => {
                setCode(event.target.value);
                setError(null);
              }}
            />
            {error ? <Field.ErrorText>{error}</Field.ErrorText> : null}
          </Field.Root>

          <Flex justify="flex-end">
            <Button
              type="submit"
              bg="secondary"
              color="white"
              _hover={{ bg: "#4338CA" }}
              loading={isValidating}
            >
              Validate code
            </Button>
          </Flex>
        </VStack>
      </Box>

      <Text textAlign="center" color="textSecondary" fontSize="sm">
        After validation you&apos;ll confirm the redemption amount on the next step.
      </Text>
    </VStack>
  );
}

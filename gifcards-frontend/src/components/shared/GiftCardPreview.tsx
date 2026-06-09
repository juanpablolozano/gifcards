import { Box, Heading, Text, VStack } from "@chakra-ui/react";

type GiftCardPreviewProps = {
  name: string;
  amount: string;
  message?: string;
  merchantName?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export function GiftCardPreview({
  name,
  amount,
  message,
  merchantName,
  primaryColor = "#111827",
  secondaryColor = "#4F46E5",
}: GiftCardPreviewProps) {
  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg={`linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}
      color="white"
      p={8}
      minH="200px"
    >
      <VStack align="start" justify="space-between" h="full" gap={4}>
        <Text fontSize="sm" opacity={0.8}>
          {merchantName ?? "Your Business"}
        </Text>
        <Heading size="lg">{name || "Gift Card"}</Heading>
        <Heading size="2xl">{amount}</Heading>
        {message && (
          <Text fontSize="sm" opacity={0.9}>
            {message}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

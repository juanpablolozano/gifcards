import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box bg="white" border="1px solid" borderColor="border" borderRadius="card" p={10} textAlign="center">
      <VStack gap={4}>
        <Heading size="md" color="primary">
          {title}
        </Heading>
        <Text color="textSecondary">{description}</Text>
        {action}
      </VStack>
    </Box>
  );
}

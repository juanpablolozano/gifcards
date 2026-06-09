import { Box, Heading, Text, VStack } from "@chakra-ui/react";

type KpiCardProps = {
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
};

export function KpiCard({ label, value, trend, trendLabel }: KpiCardProps) {
  return (
    <Box bg="white" border="1px solid" borderColor="border" borderRadius="card" p={6} boxShadow="sm">
      <VStack align="start" gap={2}>
        <Text fontSize="sm" color="textSecondary" fontWeight="600">
          {label}
        </Text>
        <Heading size="lg" color="primary">
          {value}
        </Heading>
        {trend && (
          <Text fontSize="sm" color="accent">
            {trend} {trendLabel}
          </Text>
        )}
      </VStack>
    </Box>
  );
}

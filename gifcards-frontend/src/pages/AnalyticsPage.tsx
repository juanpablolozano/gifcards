import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toaster } from "../lib/toaster";
import { fetchAnalytics, type AnalyticsResponse } from "../services/analyticsService";
import { useAuthStore } from "../stores/authStore";
import { KpiCard } from "../components/shared/KpiCard";

const dayOptions = [7, 30, 90] as const;

function formatMoney(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type SimpleBarChartProps = {
  series: AnalyticsResponse["series"];
};

function SimpleBarChart({ series }: SimpleBarChartProps) {
  const { t } = useTranslation("dashboard");
  const maxValue = useMemo(() => {
    if (series.length === 0) return 1;
    return Math.max(
      ...series.flatMap((point) => [point.salesAmount, point.redemptionAmount]),
      1,
    );
  }, [series]);

  if (series.length === 0) {
    return (
      <Text color="textSecondary" textAlign="center" py={8}>
        {t("analytics.noData")}
      </Text>
    );
  }

  return (
    <VStack align="stretch" gap={4}>
      <HStack gap={4} fontSize="sm">
        <HStack gap={2}>
          <Box boxSize={3} bg="secondary" borderRadius="sm" />
          <Text color="textSecondary">{t("analytics.sales")}</Text>
        </HStack>
        <HStack gap={2}>
          <Box boxSize={3} bg="accent" borderRadius="sm" />
          <Text color="textSecondary">{t("analytics.redemptions")}</Text>
        </HStack>
      </HStack>

      <Flex align="flex-end" gap={2} minH="220px" overflowX="auto" pb={2}>
        {series.map((point) => {
          const salesHeight = `${(point.salesAmount / maxValue) * 100}%`;
          const redemptionHeight = `${(point.redemptionAmount / maxValue) * 100}%`;

          return (
            <VStack key={point.date} gap={2} minW="48px" flexShrink={0}>
              <Flex align="flex-end" gap={1} h="180px" w="full">
                <Box
                  flex="1"
                  h={salesHeight}
                  minH={point.salesAmount > 0 ? "4px" : "0"}
                  bg="secondary"
                  borderTopRadius="sm"
                  title={`${t("analytics.sales")}: ${formatMoney(point.salesAmount)}`}
                />
                <Box
                  flex="1"
                  h={redemptionHeight}
                  minH={point.redemptionAmount > 0 ? "4px" : "0"}
                  bg="accent"
                  borderTopRadius="sm"
                  title={`${t("analytics.redemptions")}: ${formatMoney(point.redemptionAmount)}`}
                />
              </Flex>
              <Text fontSize="xs" color="textSecondary" textAlign="center">
                {formatDateLabel(point.date)}
              </Text>
            </VStack>
          );
        })}
      </Flex>
    </VStack>
  );
}

export function AnalyticsPage() {
  const { t } = useTranslation("dashboard");
  const idToken = useAuthStore((state) => state.idToken);
  const [days, setDays] = useState<(typeof dayOptions)[number]>(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;

    let cancelled = false;
    setIsLoading(true);

    fetchAnalytics(idToken, { days })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) {
          toaster.create({
            title: t("analytics.loadError"),
            type: "error",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days, idToken, t]);

  return (
    <VStack align="stretch" gap={6}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Heading size="md" color="primary">
          {t("pages.analytics")}
        </Heading>

        <HStack gap={2}>
          {dayOptions.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={days === option ? "solid" : "outline"}
              colorPalette={days === option ? "purple" : "gray"}
              onClick={() => setDays(option)}
            >
              {t("analytics.days", { count: option })}
            </Button>
          ))}
        </HStack>
      </Flex>

      {isLoading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="secondary" />
        </Flex>
      ) : data ? (
        <>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            <KpiCard
              label={t("analytics.totalSales")}
              value={formatMoney(data.totals.totalSales)}
            />
            <KpiCard
              label={t("analytics.totalRedemptions")}
              value={formatMoney(data.totals.totalRedemptions)}
            />
            <KpiCard
              label={t("analytics.netOutstanding")}
              value={formatMoney(data.totals.netOutstanding)}
            />
          </Grid>

          <Box
            bg="white"
            borderWidth="1px"
            borderColor="border"
            borderRadius="card"
            p={{ base: 4, md: 6 }}
          >
            <SimpleBarChart series={data.series} />
          </Box>
        </>
      ) : null}
    </VStack>
  );
}

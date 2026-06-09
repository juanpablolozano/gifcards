import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { KpiCard } from "../components/shared/KpiCard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { toaster } from "../lib/toaster";
import { fetchDashboard } from "../services/dashboardService";
import { useAuthStore } from "../stores/authStore";
import type { DashboardResponse } from "../types/dashboard";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

function formatTrend(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

type ChecklistItemProps = {
  label: string;
  completed: boolean;
};

function ChecklistItem({ label, completed }: ChecklistItemProps) {
  return (
    <Flex align="center" gap={3}>
      <Flex
        align="center"
        justify="center"
        boxSize="24px"
        borderRadius="full"
        bg={completed ? "accent" : "surface"}
        color={completed ? "white" : "textSecondary"}
        fontSize="sm"
        fontWeight="bold"
        borderWidth={completed ? "0" : "1px"}
        borderColor="border"
      >
        {completed ? "✓" : ""}
      </Flex>
      <Text color={completed ? "primary" : "textSecondary"} fontWeight={completed ? "medium" : "normal"}>
        {label}
      </Text>
    </Flex>
  );
}

export function DashboardPage() {
  const idToken = useAuthStore((state) => state.idToken);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!idToken) {
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const data = await fetchDashboard(idToken!);
        if (!cancelled) {
          setDashboard(data);
        }
      } catch {
        if (!cancelled) {
          toaster.create({
            title: "Could not load dashboard",
            type: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [idToken]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  if (!dashboard) {
    return (
      <Box bg="white" borderWidth="1px" borderColor="border" borderRadius="card" p={8}>
        <Text color="textSecondary">Unable to load dashboard data. Please refresh the page.</Text>
      </Box>
    );
  }

  const { kpis, recentActivity, onboardingChecklist } = dashboard;

  return (
    <VStack align="stretch" gap={6}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <KpiCard
          label="Total sales"
          value={formatCurrency(kpis.totalSales)}
          trend={formatTrend(kpis.salesTrend)}
          trendLabel="vs last month"
        />
        <KpiCard
          label="Redemptions"
          value={formatCurrency(kpis.totalRedemptions)}
          trend={formatTrend(kpis.redemptionsTrend)}
          trendLabel="vs last month"
        />
        <KpiCard
          label="Outstanding balance"
          value={formatCurrency(kpis.outstandingBalance)}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={4}>
        <Box bg="white" borderWidth="1px" borderColor="border" borderRadius="card" p={6}>
          <Heading size="md" color="primary" mb={4}>
            Recent activity
          </Heading>
          {recentActivity.length === 0 ? (
            <Text color="textSecondary">No transactions yet.</Text>
          ) : (
            <VStack align="stretch" gap={3}>
              {recentActivity.map((activity) => (
                <Flex
                  key={activity.id}
                  justify="space-between"
                  align="center"
                  gap={4}
                  py={2}
                  borderBottomWidth="1px"
                  borderColor="border"
                  _last={{ borderBottomWidth: 0 }}
                >
                  <Box minW={0}>
                    <Text fontWeight="medium" color="primary" truncate>
                      {activity.giftCardName ?? "Gift card"}
                    </Text>
                    <Text fontSize="sm" color="textSecondary">
                      {formatDate(activity.createdAt)} · {activity.type}
                    </Text>
                  </Box>
                  <VStack gap={1} align="end" flexShrink={0}>
                    <Text fontWeight="semibold" color="primary">
                      {formatCurrency(activity.amount)}
                    </Text>
                    <StatusBadge status={activity.status} />
                  </VStack>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>

        <Box bg="white" borderWidth="1px" borderColor="border" borderRadius="card" p={6}>
          <Heading size="md" color="primary" mb={4}>
            Getting started
          </Heading>
          <VStack align="stretch" gap={3} mb={6}>
            <ChecklistItem
              label="Create your account"
              completed={onboardingChecklist.accountCreated}
            />
            <ChecklistItem
              label="Complete business profile"
              completed={onboardingChecklist.profileCompleted}
            />
            <ChecklistItem
              label="Publish your first gift card"
              completed={onboardingChecklist.firstGiftCardPublished}
            />
          </VStack>
          <Button
            asChild
            width="full"
            bg="secondary"
            color="white"
            _hover={{ bg: "#4338CA" }}
          >
            <RouterLink to="/gift-cards/new">Create gift card</RouterLink>
          </Button>
        </Box>
      </Grid>
    </VStack>
  );
}

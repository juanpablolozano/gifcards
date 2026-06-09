import {
  Badge,
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toaster } from "../lib/toaster";
import { getPaymentsStatus } from "../services/merchantService";
import type { PaymentsStatus } from "../types/merchant";
import { useAuthStore } from "../stores/authStore";

export function SettingsPaymentsPage() {
  const { t } = useTranslation("dashboard");
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);
  const [status, setStatus] = useState<PaymentsStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!idToken || !merchant) return;

    getPaymentsStatus(idToken, merchant.id)
      .then(setStatus)
      .catch(() => {
        toaster.create({ title: t("settings.loadError"), type: "error" });
      })
      .finally(() => setIsLoading(false));
  }, [idToken, merchant, t]);

  if (isLoading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner size="lg" color="secondary" />
      </Flex>
    );
  }

  if (!status) return null;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="border"
      borderRadius="card"
      p={{ base: 6, md: 8 }}
    >
      <VStack align="stretch" gap={6}>
        <Flex justify="space-between" align="center" gap={4} wrap="wrap">
          <Heading size="md" color="primary">
            {t("settings.paymentsTitle")}
          </Heading>
          {status.mode === "test" ? (
            <Badge colorPalette="orange" variant="subtle">
              {t("settings.testMode")}
            </Badge>
          ) : null}
        </Flex>

        <VStack align="stretch" gap={3}>
          <Flex justify="space-between" gap={4}>
            <Text color="textSecondary">{t("settings.paymentsEnabled")}</Text>
            <Badge colorPalette={status.enabled ? "green" : "gray"} variant="subtle">
              {status.enabled ? t("settings.yes") : t("settings.no")}
            </Badge>
          </Flex>

          <Flex justify="space-between" gap={4}>
            <Text color="textSecondary">{t("settings.stripeConnect")}</Text>
            <Badge
              colorPalette={status.stripeConnectAvailable ? "green" : "gray"}
              variant="subtle"
            >
              {status.stripeConnectAvailable ? t("settings.available") : t("settings.unavailable")}
            </Badge>
          </Flex>

          <Flex justify="space-between" gap={4}>
            <Text color="textSecondary">{t("settings.payoutsEnabled")}</Text>
            <Badge colorPalette={status.payoutsEnabled ? "green" : "gray"} variant="subtle">
              {status.payoutsEnabled ? t("settings.yes") : t("settings.no")}
            </Badge>
          </Flex>
        </VStack>

        {status.message ? (
          <Text fontSize="sm" color="textSecondary">
            {status.message}
          </Text>
        ) : null}

        {status.requirementsDue.length > 0 ? (
          <Box>
            <Text fontWeight="semibold" color="primary" mb={2}>
              {t("settings.requirementsDue")}
            </Text>
            <VStack align="stretch" gap={1}>
              {status.requirementsDue.map((requirement) => (
                <Text key={requirement} fontSize="sm" color="textSecondary">
                  • {requirement}
                </Text>
              ))}
            </VStack>
          </Box>
        ) : null}
      </VStack>
    </Box>
  );
}

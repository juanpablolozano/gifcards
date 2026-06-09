import { Heading, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getPageTitleKey } from "../config/merchantNav";

export function DashboardPlaceholderPage() {
  const { t } = useTranslation("dashboard");
  const { pathname } = useLocation();
  const pageTitleKey = getPageTitleKey(pathname);

  return (
    <VStack
      align="stretch"
      gap={2}
      bg="white"
      borderWidth="1px"
      borderColor="border"
      borderRadius="card"
      p={{ base: 6, md: 8 }}
      minH="200px"
    >
      <Heading size="md" color="primary">
        {t(pageTitleKey)}
      </Heading>
      <Text color="textSecondary">{t("comingSoon")}</Text>
    </VStack>
  );
}

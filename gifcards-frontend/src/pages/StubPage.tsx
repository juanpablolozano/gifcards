import { Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";

export function StubPage() {
  const { t } = useTranslation("auth");

  return (
    <AuthLayout>
      <VStack gap={4} align="stretch">
        <Heading size="md" color="primary">
          {t("comingSoon")}
        </Heading>
        <Text color="textSecondary">{t("comingSoon")}</Text>
        <Button asChild variant="outline" borderColor="border">
          <RouterLink to="/login">{t("backToLogin")}</RouterLink>
        </Button>
      </VStack>
    </AuthLayout>
  );
}

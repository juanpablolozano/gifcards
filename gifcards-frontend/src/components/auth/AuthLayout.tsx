import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./LanguageToggle";

type AuthLayoutProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  const { t } = useTranslation("auth");

  return (
    <Box minH="100vh" bg="surface" px={4} py={8}>
      <Flex maxW="480px" mx="auto" direction="column" gap={6}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              boxSize="40px"
              borderRadius="button"
              bg="secondary"
              color="white"
              fontWeight="bold"
            >
              G
            </Flex>
            <Heading size="lg" color="primary">
              {t("brand")}
            </Heading>
          </Flex>
          <LanguageToggle />
        </Flex>

        <Box
          bg="white"
          borderWidth="1px"
          borderColor="border"
          borderRadius="card"
          boxShadow="sm"
          p={{ base: 6, md: 8 }}
        >
          {children}
        </Box>

        {footer}
      </Flex>
    </Box>
  );
}

export function AuthFooter() {
  const { t } = useTranslation("auth");

  return (
    <VStack gap={2} textAlign="center">
      <Text fontSize="sm" color="textSecondary">
        {t("copyright")}
      </Text>
      <Flex gap={4} justify="center">
        <Text fontSize="sm" color="secondary">
          {t("privacyPolicy")}
        </Text>
        <Text fontSize="sm" color="secondary">
          {t("termsOfService")}
        </Text>
      </Flex>
    </VStack>
  );
}

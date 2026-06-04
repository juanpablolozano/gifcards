import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageToggle } from "../components/auth/LanguageToggle";
import { useAuthActions } from "../hooks/useAuth";
import { useAuthStore } from "../stores/authStore";

export function HomePage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
          <VStack gap={4} align="stretch">
            <Heading size="md" color="primary">
              {t("homeTitle")}
            </Heading>
            <Text color="textSecondary">
              {t("homeSubtitle")}{" "}
              <Text as="span" color="primary" fontWeight="medium">
                {user?.email ?? user?.uid}
              </Text>
            </Text>
            <Button
              bg="secondary"
              color="white"
              _hover={{ bg: "#4338CA" }}
              onClick={handleLogout}
            >
              {t("logoutButton")}
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}

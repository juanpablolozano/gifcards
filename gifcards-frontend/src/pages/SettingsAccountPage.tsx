import {
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../hooks/useAuth";
import { toaster } from "../lib/toaster";
import { updateMerchant } from "../services/merchantService";
import { useAuthStore } from "../stores/authStore";

export function SettingsAccountPage() {
  const { t, i18n } = useTranslation(["dashboard", "auth"]);
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const user = useAuthStore((state) => state.user);
  const idToken = useAuthStore((state) => state.idToken);
  const merchant = useAuthStore((state) => state.merchant);
  const setSession = useAuthStore((state) => state.setSession);
  const currentLanguage = i18n.language.startsWith("es") ? "es" : "en";

  const handleLanguageChange = async (language: "en" | "es") => {
    localStorage.setItem("gifcards_language", language);
    await i18n.changeLanguage(language);

    if (!idToken || !merchant || !user) return;

    try {
      const updated = await updateMerchant(idToken, merchant.id, {
        preferredLanguage: language,
      });
      setSession({
        user,
        idToken,
        merchant: {
          ...merchant,
          preferredLanguage: updated.preferredLanguage,
        },
      });
    } catch {
      toaster.create({
        title: t("dashboard:settings.saveError"),
        type: "error",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="border"
      borderRadius="card"
      p={{ base: 6, md: 8 }}
    >
      <VStack align="stretch" gap={6}>
        <Heading size="md" color="primary">
          {t("dashboard:settings.accountTitle")}
        </Heading>

        <Field.Root>
          <Field.Label color="primary">{t("auth:emailLabel")}</Field.Label>
          <Input
            value={user?.email ?? ""}
            readOnly
            bg="surface"
            borderColor="border"
          />
          <Field.HelperText>{t("dashboard:settings.emailReadOnly")}</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label color="primary">{t("dashboard:settings.language")}</Field.Label>
          <HStack gap={1}>
            <Button
              size="sm"
              variant={currentLanguage === "en" ? "solid" : "ghost"}
              colorPalette="gray"
              onClick={() => void handleLanguageChange("en")}
            >
              EN
            </Button>
            <Text color="textSecondary" fontSize="sm">
              /
            </Text>
            <Button
              size="sm"
              variant={currentLanguage === "es" ? "solid" : "ghost"}
              colorPalette="gray"
              onClick={() => void handleLanguageChange("es")}
            >
              ES
            </Button>
          </HStack>
        </Field.Root>

        <Box borderTopWidth="1px" borderColor="border" pt={6}>
          <Button
            variant="outline"
            colorPalette="red"
            onClick={() => void handleLogout()}
          >
            {t("auth:logoutButton")}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}

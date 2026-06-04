import { Button, HStack, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export function LanguageToggle() {
  const { i18n } = useTranslation("auth");
  const currentLanguage = i18n.language.startsWith("es") ? "es" : "en";

  const setLanguage = (language: "en" | "es") => {
    localStorage.setItem("gifcards_language", language);
    void i18n.changeLanguage(language);
  };

  return (
    <HStack gap={1}>
      <Button
        size="xs"
        variant={currentLanguage === "en" ? "solid" : "ghost"}
        colorPalette="gray"
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
      <Text color="textSecondary" fontSize="sm">
        /
      </Text>
      <Button
        size="xs"
        variant={currentLanguage === "es" ? "solid" : "ghost"}
        colorPalette="gray"
        onClick={() => setLanguage("es")}
      >
        ES
      </Button>
    </HStack>
  );
}

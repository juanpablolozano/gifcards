import { Box, Button, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { GoogleLogo } from "./GoogleLogo";

type GoogleSignInButtonProps = {
  isLoading: boolean;
  onClick: () => void;
};

export function GoogleSignInButton({
  isLoading,
  onClick,
}: GoogleSignInButtonProps) {
  const { t } = useTranslation("auth");

  return (
    <Button
      width="full"
      minH="44px"
      variant="outline"
      bg="white"
      borderColor="border"
      borderRadius="button"
      color="primary"
      fontWeight="medium"
      position="relative"
      loading={isLoading}
      loadingText={t("googleButton")}
      _hover={{
        bg: "surface",
        borderColor: "border",
      }}
      _active={{
        bg: "surface",
      }}
      onClick={onClick}
    >
      <Box position="absolute" left={4} display="flex" alignItems="center">
        <GoogleLogo size={20} />
      </Box>
      <Text as="span" width="full" textAlign="center">
        {t("googleButton")}
      </Text>
    </Button>
  );
}

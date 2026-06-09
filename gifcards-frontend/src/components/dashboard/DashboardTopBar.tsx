import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { createGiftCardPath, getPageTitleKey } from "../../config/merchantNav";
import { LanguageToggle } from "../auth/LanguageToggle";
import { AddIcon, BellIcon } from "./dashboardIcons";

export function DashboardTopBar() {
  const { t } = useTranslation("dashboard");
  const { pathname } = useLocation();
  const pageTitleKey = getPageTitleKey(pathname);

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      gap={4}
      px={{ base: 4, md: 6 }}
      py={4}
      bg="white"
      borderBottomWidth="1px"
      borderColor="border"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Heading size="lg" color="primary" fontWeight="bold">
        {t(pageTitleKey)}
      </Heading>

      <Flex align="center" gap={{ base: 2, md: 4 }} flexShrink={0}>
        <LanguageToggle />

        <Box position="relative">
          <IconButton
            aria-label={t("notifications")}
            variant="ghost"
            color="textSecondary"
            size="sm"
          >
            <BellIcon size={20} />
          </IconButton>
          <Box
            position="absolute"
            top="6px"
            right="6px"
            boxSize="8px"
            borderRadius="full"
            bg="red.500"
            borderWidth="2px"
            borderColor="white"
          />
        </Box>

        <Button
          asChild
          bg="secondary"
          color="white"
          size="sm"
          _hover={{ bg: "#4338CA" }}
          display={{ base: "none", sm: "inline-flex" }}
        >
          <RouterLink to={createGiftCardPath}>
            <Flex align="center" gap={2}>
              <AddIcon size={18} />
              {t("createGiftCard")}
            </Flex>
          </RouterLink>
        </Button>

        <IconButton
          asChild
          aria-label={t("createGiftCard")}
          bg="secondary"
          color="white"
          size="sm"
          _hover={{ bg: "#4338CA" }}
          display={{ base: "inline-flex", sm: "none" }}
        >
          <RouterLink to={createGiftCardPath}>
            <AddIcon size={18} />
          </RouterLink>
        </IconButton>
      </Flex>
    </Flex>
  );
}

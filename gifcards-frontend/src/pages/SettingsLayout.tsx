import { Box, Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router-dom";

const settingsTabs = [
  { path: "/settings/account", labelKey: "settings.tabs.account" },
  { path: "/settings/business", labelKey: "settings.tabs.business" },
  { path: "/settings/payments", labelKey: "settings.tabs.payments" },
] as const;

export function SettingsLayout() {
  const { t } = useTranslation("dashboard");

  return (
    <Flex direction="column" gap={6}>
      <Flex
        gap={1}
        borderBottomWidth="1px"
        borderColor="border"
        overflowX="auto"
      >
        {settingsTabs.map((tab) => (
          <NavLink key={tab.path} to={tab.path} style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <Box
                px={4}
                py={3}
                borderBottomWidth="2px"
                borderBottomColor={isActive ? "secondary" : "transparent"}
                color={isActive ? "secondary" : "textSecondary"}
                fontWeight={isActive ? "semibold" : "medium"}
                fontSize="sm"
                whiteSpace="nowrap"
                _hover={{ color: isActive ? "secondary" : "primary" }}
              >
                {t(tab.labelKey)}
              </Box>
            )}
          </NavLink>
        ))}
      </Flex>

      <Outlet />
    </Flex>
  );
}

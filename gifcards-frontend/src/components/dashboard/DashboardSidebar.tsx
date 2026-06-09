import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { merchantNavItems } from "../../config/merchantNav";
import { useAuthActions } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/authStore";
import { GiftCardsIcon } from "./dashboardIcons";
import { SidebarNavItem } from "./SidebarNavItem";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getDisplayName(
  businessName: string | null | undefined,
  email: string | null | undefined,
): string {
  if (businessName?.trim()) {
    return businessName.trim();
  }
  if (email?.trim()) {
    return email.trim();
  }
  return "Merchant";
}

export function DashboardSidebar() {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const merchant = useAuthStore((state) => state.merchant);
  const { logout } = useAuthActions();

  const displayName = getDisplayName(merchant?.businessName, user?.email);
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <Flex
      as="aside"
      direction="column"
      w={{ base: "0", md: "260px" }}
      minW={{ base: "0", md: "260px" }}
      minH="100vh"
      bg="white"
      borderRightWidth="1px"
      borderColor="border"
      display={{ base: "none", md: "flex" }}
      overflow="hidden"
    >
      <Box px={5} py={6} borderBottomWidth="1px" borderColor="border">
        <Flex align="center" gap={3}>
          <Flex
            align="center"
            justify="center"
            boxSize="40px"
            borderRadius="button"
            bg="secondary"
            color="white"
            flexShrink={0}
          >
            <GiftCardsIcon size={22} />
          </Flex>
          <Box minW={0}>
            <Text fontWeight="bold" color="primary" fontSize="md" truncate>
              {t("brand")}
            </Text>
            <Text fontSize="xs" color="textSecondary" truncate>
              {t("brandSubtitle")}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box as="nav" flex="1" py={3}>
        {merchantNavItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            to={item.path}
            label={t(item.labelKey)}
            icon={item.icon}
            end={item.end}
          />
        ))}
      </Box>

      <Box px={4} py={4} borderTopWidth="1px" borderColor="border">
        <Flex align="center" gap={3} mb={3}>
          <Avatar.Root size="sm" colorPalette="purple">
            <Avatar.Fallback name={displayName}>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <Box minW={0} flex="1">
            <Text fontSize="sm" fontWeight="medium" color="primary" truncate>
              {displayName}
            </Text>
            <Text fontSize="xs" color="textSecondary">
              {t("adminRole")}
            </Text>
          </Box>
        </Flex>
        <Button
          variant="ghost"
          size="sm"
          width="full"
          color="textSecondary"
          _hover={{ bg: "surface", color: "primary" }}
          onClick={handleLogout}
        >
          {t("logout")}
        </Button>
      </Box>
    </Flex>
  );
}
